import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType, GenerationConfig, Content, Part } from "@google/generative-ai";
// Removed duplicate import line
import type { LlmContext } from '@/types';
import { SYSTEM_PROMPT_TEXT } from '@/lib/prompts/system-prompt'; // Import the prompt
import { logger } from '@/lib/logger'; // Import the new logger
// --- Utility Functions ---
function countTokens(obj: any): number {
  // Simple approximation: 1 token ~ 4 chars in English
  // Use a proper tokenizer (e.g., gpt-tokenizer) for accuracy in production
  const jsonString = JSON.stringify(obj);
  return Math.ceil(jsonString.length / 4);
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
        const modelResponsePart = {
          text: JSON.stringify({
            responseText: interaction.ai_response.responseText,
            action: interaction.ai_response.action,
            reasoning: interaction.ai_response.reasoning,
            contextUpdates: interaction.ai_response.contextUpdates,
            flagsPreviousMessageAsInappropriate: interaction.ai_response.flagsPreviousMessageAsInappropriate
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
const systemPromptText = SYSTEM_PROMPT_TEXT;

// --- Gemini Configuration ---
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const model = genAI?.getGenerativeModel({
  // Use a model supporting JSON mode
  // model: "gemini-2.0-flash",
   model: "gemini-2.5-pro-exp-03-25",
});

const generationConfig: GenerationConfig = { // Explicitly type the config
  temperature: 0.1, // Adjust for creativity vs consistency
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 500, // Reduced token limit as requested
  responseMimeType: "application/json",
  responseSchema: { // Use SchemaType enum values
    type: SchemaType.OBJECT, // Corrected: Use enum for top-level type
    properties: {
      responseText: { type: SchemaType.STRING, nullable: true }, // Allow null
      action: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING },
          payload: { // Define expected optional payload properties
            type: SchemaType.OBJECT,
            properties: {
              lessonId: { type: SchemaType.STRING, nullable: true },
              quizId: { type: SchemaType.STRING, nullable: true }
            },
            // Note: 'required' field is omitted here, making properties optional by default
          }
        },
        nullable: true // Allow action to be null
      },
      reasoning: { type: SchemaType.STRING, nullable: true },
      contextUpdates: {
        type: SchemaType.OBJECT,
        nullable: true,
        properties: { // Define expected optional context update properties
            conceptsMastered: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, nullable: true },
            conceptsStruggling: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, nullable: true },
            conceptsIntroduced: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, nullable: true },
            // Add other potential context fields here if needed
        }
      },
      flagsPreviousMessageAsInappropriate: { type: SchemaType.BOOLEAN, nullable: true }
    },
    required: ["responseText", "action", "reasoning", "contextUpdates", "flagsPreviousMessageAsInappropriate"] // All fields required
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
      // Decide how to handle summary failure: proceed with original context or return error?
      // For now, proceed with the original context but log the error.
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
    const messageToSend: Part[] = [{ text: messageText }, { text: "output: " }];

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
        // Attempt to extract JSON block if wrapped in markdown
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = responseText.match(jsonRegex);
        const jsonToParse = match ? match[1].trim() : responseText.trim(); // Use extracted or trimmed raw text

        if (!jsonToParse) {
             reqLogger.error("Extracted JSON string is empty after regex/trim.", { rawResponse: responseText });
             throw new Error("Empty JSON content from LLM response.");
        }

        parsedResponse = JSON.parse(jsonToParse);
        reqLogger.info("Successfully parsed Gemini JSON response.");
        // Extract token usage if available
        const tokenUsage = result.response?.usageMetadata?.totalTokenCount;
        reqLogger.logLlmResult(parsedResponse, tokenUsage); // Log parsed result, timing, and token usage

        // --- Start Payload Validation Logic ---
        const requiredPayloadActions = ['showLessonOverview', 'showQuiz', 'completeLesson'];
        const action = parsedResponse.action; // Assuming parsedResponse holds the parsed JSON

        if (action && requiredPayloadActions.includes(action.type)) {
          if (!action.payload) {
            reqLogger.error(`Validation Error: Action '${action.type}' requires a payload, but it was missing.`, { action });
            throw new Error(`LLM response action '${action.type}' missing required payload.`);
          }

          if ((action.type === 'showLessonOverview' || action.type === 'completeLesson') && (!action.payload.lessonId || typeof action.payload.lessonId !== 'string')) {
             reqLogger.error(`Validation Error: Action '${action.type}' payload missing or invalid 'lessonId'.`, { payload: action.payload });
             throw new Error(`LLM response payload for '${action.type}' missing required 'lessonId'.`);
          }

          if (action.type === 'showQuiz' && (!action.payload.lessonId || typeof action.payload.lessonId !== 'string' || !action.payload.quizId || typeof action.payload.quizId !== 'string')) {
             reqLogger.error(`Validation Error: Action '${action.type}' payload missing or invalid 'lessonId' or 'quizId'.`, { payload: action.payload });
             throw new Error(`LLM response payload for '${action.type}' missing required 'lessonId' or 'quizId'.`);
          }
          reqLogger.debug(`Payload validation passed for action type: ${action.type}`);
        }
        // --- End Payload Validation Logic ---

    } catch (parseError) {
        reqLogger.error("Error parsing Gemini JSON response", parseError instanceof Error ? parseError : { error: parseError });
        reqLogger.error("Raw response text that failed parsing:", { rawResponse: responseText }); // Log raw text for debugging
        // Return a specific error response to the client
        reqLogger.endRequest(500, { error: "Failed to parse LLM response" });
        return NextResponse.json({ error: "Failed to parse LLM response as JSON." }, { status: 500 });
    }

    // Return the parsed JSON object
    // IMPORTANT: The client needs the updated history. We should add it to the response.
    // Get the latest history from the chat session object (implementation might vary based on SDK version)
    // For now, we'll just return the parsed response. Client-side needs adjustment.
    // TODO: Add updated history to the response payload for the client.
    reqLogger.endRequest(200, { actionType: parsedResponse.action?.type });
    return NextResponse.json(parsedResponse);

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