import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType, GenerationConfig, Content, Part } from "@google/generative-ai";
import { encode } from 'gpt-tokenizer';
import type { LlmContext } from '@/types';
import { SYSTEM_PROMPT } from '@/lib/prompts/system-prompt'; // Import the updated prompt constant
import { logger } from '@/lib/logger'; // Import the new logger
// --- Utility Functions ---
function countTokens(obj: any): number {
  // Use gpt-tokenizer for accurate token counting
  const jsonString = JSON.stringify(obj);
  return encode(jsonString).length;
}

// Placeholder for context summarization logic
async function summarizeContext(context: LlmContext, reqLogger: any): Promise<LlmContext> {
  reqLogger.warn("Context summarization triggered, but not yet implemented. Returning original context.");
  // TODO: Implement actual LLM call for summarization
  // Example: Call another LLM endpoint or use a specific prompt
  const summaryPrompt = `Summarize this learning context concisely, focusing on the current lesson, mastered/struggling concepts, and the last 2 interactions:
${JSON.stringify(context, null, 2)}`;
  // const summaryResponse = await callLlmForSummary(summaryPrompt);
  // return parseSummaryResponse(summaryResponse);
  return context; // Return original context for now
}


// Helper function to format history for startChat
function buildChatHistory(systemPrompt: string, interactions: LlmContext['recentInteractions']): Content[] {
  const history: Content[] = [
    // Start with the system prompt as the first user message
    { role: "user", parts: [{ text: systemPrompt }] },
    // Add a placeholder model response to prime the conversation
    { role: "model", parts: [{ text: "Okay, I understand my role. I'm ready to assist the student." }] }
  ];

  if (interactions) {
    interactions.forEach(interaction => {
      if (interaction.user) {
        history.push({ role: "user", parts: [{ text: interaction.user }] });
      }
      // Assuming ai_response contains the text in responseText
      if (interaction.ai_response?.responseText) {
        // Construct the full JSON string expected by the model based on its training
        // Construct the model response part using the NEW flat structure
        const modelResponsePart = {
          text: JSON.stringify({
            responseText: interaction.ai_response.responseText,
            actionType: interaction.ai_response.actionType, // Use new field
            lessonId: interaction.ai_response.lessonId,     // Use new field
            quizId: interaction.ai_response.quizId,         // Use new field
            flagsPreviousMessageAsInappropriate: interaction.ai_response.flagsPreviousMessageAsInappropriate,
            reasoning: interaction.ai_response.reasoning
            // Note: contextUpdates is not part of the new standard response schema
          })
        };
        history.push({ role: "model", parts: [modelResponsePart] });
      }
    });
  }
  return history;
}

// --- System Prompt ---
// Use the imported prompt constant
const systemPromptText = SYSTEM_PROMPT; // Use the imported constant directly

// --- Gemini Configuration ---
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Get model name from environment variable
const llmModelName = process.env.LLM_MODEL_NAME;

if (!llmModelName) {
  logger.error("LLM_MODEL_NAME environment variable is not set.");
  throw new Error("LLM_MODEL_NAME environment variable is not set. Please configure it.");
  // Note: Throwing an error here will prevent the server from starting/handling requests
  // if the model name isn't configured, which is safer than using a potentially incorrect default.
}

const model = genAI?.getGenerativeModel({
  model: llmModelName, // Use the environment variable
});

const generationConfig: GenerationConfig = { // Explicitly type the config
  temperature: 0.1, // Adjust for creativity vs consistency
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1000, // Reduced token limit as requested
  responseMimeType: "application/json",
  responseSchema: { // Updated flat schema per PLAN_llm_response_formatting.md
    type: SchemaType.OBJECT,
    properties: {
      responseText: { type: SchemaType.STRING }, // Required text response
      actionType: { type: SchemaType.STRING, nullable: true }, // e.g., "showQuiz", "showLessonOverview", null
      lessonId: { type: SchemaType.STRING, nullable: true }, // ID for lesson context
      quizId: { type: SchemaType.STRING, nullable: true }, // ID for quiz context
      lessonMarkdownContent: { type: SchemaType.STRING, nullable: true }, // Optional Markdown content for generated lessons
      flagsPreviousMessageAsInappropriate: { type: SchemaType.BOOLEAN }, // Required boolean flag
      reasoning: { type: SchemaType.STRING, nullable: true } // Optional explanation
    },
    // Only fields that MUST be present in every response
    required: ["responseText", "flagsPreviousMessageAsInappropriate"]
  },
};

// Safety settings (adjust as needed)
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// --- API Route Handler ---
export async function POST(request: Request) {
  // Use general logger here as reqLogger is not yet initialized
  if (!apiKey || !genAI || !model) {
    logger.error("Gemini API key or client not initialized. Cannot process request.");
    return NextResponse.json({ error: "API not configured correctly." }, { status: 500 });
  }

  // Start request logging
  const reqLogger = logger.startRequest({ path: request.url, method: request.method });

  let requestBody: any; // Keep 'any' for flexibility or define a strict input type
  try {
    // Clone the request to read the body safely
    const rawBody = await request.text(); // Read as text first for logging
    reqLogger.logPayload('request', rawBody); // Log raw body (or size in prod)
    try {
        requestBody = JSON.parse(rawBody); // Now parse
    } catch (parseError) {
        reqLogger.error("Error parsing request body JSON", parseError instanceof Error ? parseError : { error: parseError });
        reqLogger.endRequest(400, { error: "Invalid JSON format" });
        return NextResponse.json({ error: "Invalid request body: Malformed JSON." }, { status: 400 });
    }
  } catch (error) {
    reqLogger.error("Error reading request body", error instanceof Error ? error : { error: error });
    reqLogger.endRequest(500, { error: "Failed to read request body" });
    return NextResponse.json({ error: "Failed to read request body." }, { status: 500 });
  }

  const { currentUserMessage, currentLlmContext, availableLessons, currentLessonData } = requestBody;

  if (!currentUserMessage || !currentLlmContext || !availableLessons) {
    reqLogger.warn("Missing required fields in request body.", {
        hasCurrentUserMessage: !!currentUserMessage,
        hasCurrentLlmContext: !!currentLlmContext,
        hasAvailableLessons: !!availableLessons,
    });
    reqLogger.endRequest(400, { error: "Missing required fields" });
    return NextResponse.json({ error: "Missing required fields in request body." }, { status: 400 });
  }
  const MAX_CONTEXT_TOKENS = 4000; // Define a threshold for context size
  let processedLlmContext = currentLlmContext;

  // Check context size and summarize if needed
  const contextTokenCount = countTokens(currentLlmContext);
  reqLogger.info(`Current context token count (approx): ${contextTokenCount}`);

  if (contextTokenCount > MAX_CONTEXT_TOKENS) {
    reqLogger.info(`Context size (${contextTokenCount}) exceeds threshold (${MAX_CONTEXT_TOKENS}). Attempting summarization.`);
    try {
      processedLlmContext = await summarizeContext(currentLlmContext, reqLogger);
      const summarizedTokenCount = countTokens(processedLlmContext);
      reqLogger.info(`Summarized context token count (approx): ${summarizedTokenCount}`);
    } catch (summaryError) {
      reqLogger.error("Error during context summarization", summaryError instanceof Error ? summaryError : { error: summaryError });
      // Strategy: Log a warning and proceed with the original context if summarization fails or is skipped.
      console.warn('Context summarization skipped/failed. Proceeding with original context.'); // Added warning
      processedLlmContext = currentLlmContext;
    }
  } else {
    reqLogger.info(`Context size (${contextTokenCount}) is within threshold (${MAX_CONTEXT_TOKENS}). No summarization needed.`);
  }

  // --- Start LLM Interaction using Chat Session ---
  try {
    // Build chat history using the helper function
    // Note: We use processedLlmContext here, which might be the summarized version
    const chatHistory = buildChatHistory(systemPromptText, processedLlmContext.recentInteractions);
    reqLogger.info(`Built chat history with ${chatHistory.length} items.`);

    // Start a chat session
    const chatSession = model.startChat({
        history: chatHistory,
        generationConfig,
        safetySettings,
    });

    // Prepare the message payload for sendMessage
    // We only need to send the current user message now, plus essential context for this turn
    const messagePayload = {
        currentUserMessage,
        availableLessons, // Provide available lessons for context
        currentLessonData // Provide current lesson data if available
        // Note: The rest of the context (student profile, history) is in chatHistory
    };
    // We send the payload as a JSON string within the message part, mimicking the input/output structure
    const messageText = `input: ${JSON.stringify(messagePayload)}`;
    // Define the format reminder to include in each message
    const formatReminder = `\n\n**REMINDER:** Your response MUST be a single, valid JSON object matching this structure:
\`\`\`json
{
  "responseText": "string | null",
  "action": { "type": "string", "payload": { "lessonId": "string | null", "quizId": "string | null" } } | null,
  "reasoning": "string | null",
  "contextUpdates": { /* ... */ } | null,
  "flagsPreviousMessageAsInappropriate": boolean | null
}
\`\`\`
Ensure ALL fields are present, using null where appropriate. Payloads are MANDATORY for showLessonOverview, showQuiz, completeLesson.`;

    const messageToSend: Part[] = [
        { text: messageText },
        { text: formatReminder }, // Insert the reminder
        { text: "\noutput: " } // Add newline before output marker
    ];

    reqLogger.logPayload('llm_request', { message: messageText }); // Log message being sent

    // Send the user message to the chat session
    const result = await chatSession.sendMessage(messageToSend); // Send the structured message

    reqLogger.info("Received raw response from Gemini chat session."); // Log confirmation

    // --- Response Handling ---
    if (!result.response) {
        reqLogger.error("Gemini response object was undefined.");
        throw new Error("No response object received from LLM chat session.");
    }

    const candidates = result.response.candidates;
    if (!candidates || candidates.length === 0 || !candidates[0].content || !candidates[0].content.parts || candidates[0].content.parts.length === 0) {
        reqLogger.error("Invalid response structure from Gemini: Missing candidates or content parts.", { response: result.response });
        
        // Enhanced safety feedback handling
        const blockReason = result.response.promptFeedback?.blockReason;
        if (blockReason) {
            const safetyRatings = result.response.promptFeedback?.safetyRatings || [];
            const blockedCategories = safetyRatings
                .filter(rating => rating.probability === 'HIGH')
                .map(rating => rating.category);
                
            reqLogger.warn(`LLM request blocked by safety filter`, {
                blockReason,
                blockedCategories,
                safetyRatings
            });
            
            reqLogger.endRequest(403, {
                error: "Content blocked by safety filters",
                blockReason,
                blockedCategories
            });
            
            return NextResponse.json({
                error: "Your message was blocked by content moderation filters",
                details: {
                    reason: blockReason,
                    blockedCategories
                }
            }, { status: 403 });
        }
        
        // Handle empty responses that weren't explicitly blocked
        reqLogger.endRequest(422, { error: "Empty response from LLM" });
        return NextResponse.json({
            error: "The AI couldn't generate a response to your message",
            details: "This might be due to content restrictions or technical limitations"
        }, { status: 422 });
    }

    const responseText = candidates[0].content.parts[0].text;
    reqLogger.logPayload('llm_response', responseText); // Log raw response text (or size in prod)
    if (!responseText) {
        reqLogger.error("Empty text part in Gemini response.", { parts: candidates[0].content.parts });
        throw new Error("Empty response text from LLM chat session.");
    }

    // Attempt to parse the JSON response text
    let parsedResponse;
    try {
        // JSON should be returned directly due to responseMimeType: "application/json"
        const jsonToParse = responseText.trim();

        if (!jsonToParse) {
             reqLogger.error("Received empty JSON string from LLM.", { rawResponse: responseText });
             throw new Error("Empty JSON content from LLM response.");
        }

        parsedResponse = JSON.parse(jsonToParse);
        // Add response_format to the context object
        reqLogger.info("Successfully parsed Gemini JSON response (v_new).", { response_format: 'v_new' });
        // Extract token usage if available
        const tokenUsage = result.response?.usageMetadata?.totalTokenCount;
        reqLogger.logLlmResult(parsedResponse, tokenUsage); // Log parsed result, timing, and token usage

        // --- Start New Validation Logic (per PLAN_llm_response_formatting.md) ---
        // Basic required field checks (already covered by schema 'required', but good for runtime safety)
        if (parsedResponse.responseText === undefined || parsedResponse.responseText === null) {
            reqLogger.error('Validation Error: responseText is missing or null.', { response: parsedResponse });
            throw new Error('LLM response missing required field: responseText');
        }
        // Ensure flagsPreviousMessageAsInappropriate is strictly boolean (not nullable)
        if (typeof parsedResponse.flagsPreviousMessageAsInappropriate !== 'boolean') {
            reqLogger.error('Validation Error: flagsPreviousMessageAsInappropriate is missing or not a boolean.', { response: parsedResponse });
            throw new Error('LLM response missing or invalid required field: flagsPreviousMessageAsInappropriate');
        }

        // Action-specific validation
        if (parsedResponse.actionType) {
          switch (parsedResponse.actionType) {
            case 'showQuiz':
              if (!parsedResponse.lessonId || typeof parsedResponse.lessonId !== 'string' || !parsedResponse.quizId || typeof parsedResponse.quizId !== 'string') {
                reqLogger.error(`Validation Error: Action 'showQuiz' requires non-empty string 'lessonId' and 'quizId'.`, { response: parsedResponse });
                throw new Error(`LLM response action 'showQuiz' missing or invalid 'lessonId' or 'quizId'.`);
              }
              break;
            case 'showLessonOverview':
              // Add validation for other actions like completeLesson if needed based on schema/plan
            // case 'completeLesson': // Example if needed
              if (!parsedResponse.lessonId || typeof parsedResponse.lessonId !== 'string') {
                reqLogger.error(`Validation Error: Action '${parsedResponse.actionType}' requires a non-empty string 'lessonId'.`, { response: parsedResponse });
                throw new Error(`LLM response action '${parsedResponse.actionType}' missing or invalid 'lessonId'.`);
              }
              break;
            case 'completeLesson':
              if (!parsedResponse.lessonId || typeof parsedResponse.lessonId !== 'string') {
                reqLogger.error(`Validation Error: Action 'completeLesson' requires a non-empty string 'lessonId'.`, { response: parsedResponse });
                throw new Error(`LLM response action 'completeLesson' missing or invalid 'lessonId'.`);
              }
              break;
            // Add cases for other actions requiring specific fields (e.g., clarifyQuestion might not need IDs)
            case 'clarifyQuestion':
                // No specific IDs needed for this action type currently
                break;
            case 'generateFullLesson':
              // This action MUST include the lesson content.
              if (!parsedResponse.lessonMarkdownContent || typeof parsedResponse.lessonMarkdownContent !== 'string' || parsedResponse.lessonMarkdownContent.trim() === '') {
                reqLogger.error(`Validation Error: Action 'generateFullLesson' requires a non-empty string 'lessonMarkdownContent'.`, { response: parsedResponse });
                throw new Error(`LLM response action 'generateFullLesson' missing or invalid 'lessonMarkdownContent'.`);
              }
              // No specific IDs are strictly required for *just* generating content,
              // but lessonId might be present if it's related to an existing lesson context.
              break;
            default:
                // Log if an unknown actionType is received AFTER explicit checks
                reqLogger.warn(`Received unhandled actionType: ${parsedResponse.actionType}`, { response: parsedResponse });
          }
        }
        reqLogger.debug(`Validation passed for response (v_new). Action Type: ${parsedResponse.actionType || 'null'}`);
        // --- End New Validation Logic ---

    } catch (parseError) {
        // Log the parsing/validation error
        const errorContext = parseError instanceof Error ? { error: { message: parseError.message, name: parseError.name } } : { error: parseError };
        reqLogger.error("LLM response parsing/validation failed", errorContext);
        reqLogger.error("Raw response text that failed parsing:", { rawResponse: responseText }); // Keep raw response log

        // End request and return standard error response
        reqLogger.endRequest(500, { error: "Error processing LLM response" });
        return new Response('Error processing LLM response', { status: 500 });
    }

    // Return the parsed JSON object
    // IMPORTANT: The client needs the updated history. We should add it to the response.
    // Get the latest history from the chat session object
    const updatedHistory = await chatSession.getHistory(); // Fetch updated history
    reqLogger.info(`Returning history with ${updatedHistory.length} entries.`); // Log history length

    reqLogger.endRequest(200, { actionType: parsedResponse.actionType }); // Use the new flat field
    // Return both the parsed LLM response and the updated history
    return NextResponse.json({ llmResponse: parsedResponse, history: updatedHistory });

  } catch (error) {
    reqLogger.error("Unhandled error in chat API handler", error instanceof Error ? error : { error: error });
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    // Ensure request ends even on unhandled errors
    if (!reqLogger.hasEnded()) { // Use the getter method
        reqLogger.endRequest(500, { error: errorMessage });
    }
    return NextResponse.json({ error: `LLM API call failed: ${errorMessage}` }, { status: 500 });
  }
}