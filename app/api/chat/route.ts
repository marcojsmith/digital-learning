import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType, GenerationConfig, Content, Part } from "@google/generative-ai";
// Removed duplicate import line
import type { LlmContext } from '@/types';
import { SYSTEM_PROMPT } from '@/lib/prompts/system-prompt'; // Import the updated prompt constant
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

const model = genAI?.getGenerativeModel({
  // Use a model supporting JSON mode
   model: "gemini-2.0-flash",
  // model: "gemini-2.5-pro-exp-03-25",
});

const generationConfig: GenerationConfig = { // Explicitly type the config
  temperature: 0.1, // Adjust for creativity vs consistency
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 500, // Reduced token limit as requested
  responseMimeType: "application/json",
  responseSchema: { // Updated flat schema per PLAN_llm_response_formatting.md
    type: SchemaType.OBJECT,
    properties: {
      responseText: { type: SchemaType.STRING }, // Required text response
      actionType: { type: SchemaType.STRING, nullable: true }, // e.g., "showQuiz", "showLessonOverview", null
      lessonId: { type: SchemaType.STRING, nullable: true }, // ID for lesson context
      quizId: { type: SchemaType.STRING, nullable: true }, // ID for quiz context
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
            default:
                // Optional: Log if an unknown actionType is received
                reqLogger.warn(`Received unknown actionType: ${parsedResponse.actionType}`, { response: parsedResponse });
          }
        }
        reqLogger.debug(`Validation passed for response (v_new). Action Type: ${parsedResponse.actionType || 'null'}`);
        // --- End New Validation Logic ---

    } catch (parseError) {
        // Wrap error for logging context if it's an Error instance
        const errorContext = parseError instanceof Error ? { error: { message: parseError.message, name: parseError.name } } : { error: parseError };
        reqLogger.warn("Initial JSON parse/validation failed (v_new format)", errorContext);
        reqLogger.error("Raw response text that failed initial parsing:", { rawResponse: responseText });

        // --- Backwards Compatibility: Attempt parsing legacy format ---
        try {
            reqLogger.info("Attempting fallback parse with legacy (v_legacy) format.");
            const legacyParsedResponse = JSON.parse(responseText.trim()); // Re-parse assuming old structure might exist

            // Check if it looks like the legacy structure
            if (legacyParsedResponse && typeof legacyParsedResponse.action === 'object') {
                 // Add response_format to the context object
                reqLogger.info("Successfully parsed as potential legacy format. Transforming to v_new.", { response_format: 'v_legacy' });

                // Transform legacy to new flat structure
                parsedResponse = {
                    responseText: legacyParsedResponse.responseText ?? '', // Ensure responseText exists
                    actionType: legacyParsedResponse.action?.type ?? null,
                    lessonId: legacyParsedResponse.action?.payload?.lessonId ?? null,
                    quizId: legacyParsedResponse.action?.payload?.quizId ?? null,
                    flagsPreviousMessageAsInappropriate: legacyParsedResponse.flagsPreviousMessageAsInappropriate ?? false, // Default to false if missing
                    reasoning: legacyParsedResponse.reasoning ?? null
                };

                // --- Re-run Validation Logic on TRANSFORMED legacy response ---
                reqLogger.info("Re-validating transformed legacy response.");
                if (parsedResponse.responseText === undefined || parsedResponse.responseText === null) {
                    throw new Error('Transformed legacy response missing required field: responseText');
                }
                if (typeof parsedResponse.flagsPreviousMessageAsInappropriate !== 'boolean') {
                     throw new Error('Transformed legacy response missing or invalid required field: flagsPreviousMessageAsInappropriate');
                }
                if (parsedResponse.actionType) {
                  switch (parsedResponse.actionType) {
                    case 'showQuiz':
                      if (!parsedResponse.lessonId || typeof parsedResponse.lessonId !== 'string' || !parsedResponse.quizId || typeof parsedResponse.quizId !== 'string') {
                        throw new Error(`Transformed legacy action 'showQuiz' missing or invalid 'lessonId' or 'quizId'.`);
                      }
                      break;
                    case 'showLessonOverview':
                    case 'completeLesson':
                      if (!parsedResponse.lessonId || typeof parsedResponse.lessonId !== 'string') {
                        throw new Error(`Transformed legacy action '${parsedResponse.actionType}' missing or invalid 'lessonId'.`);
                      }
                      break;
                    case 'clarifyQuestion':
                        break; // No specific IDs needed
                    default:
                        reqLogger.warn(`Received unknown actionType in transformed legacy response: ${parsedResponse.actionType}`);
                  }
                }
                reqLogger.debug(`Validation passed for transformed legacy response (v_legacy). Action Type: ${parsedResponse.actionType || 'null'}`);
                // If validation passes, proceed using the transformed 'parsedResponse'
                 // Extract token usage if available (might not be accurate for legacy parse path)
                const tokenUsage = result.response?.usageMetadata?.totalTokenCount;
                reqLogger.logLlmResult(parsedResponse, tokenUsage); // Log transformed result

            } else {
                 // Parsed but doesn't look like legacy format either
                 reqLogger.error("Parsed fallback JSON but it doesn't match expected legacy structure.", { parsed: legacyParsedResponse });
                 throw new Error("Response format is invalid (neither v_new nor recognized v_legacy).");
            }

        } catch (legacyParseError) {
            reqLogger.error("Fallback parsing (v_legacy) also failed.", legacyParseError instanceof Error ? legacyParseError : { error: legacyParseError });
            // If fallback also fails, return the original error response
            reqLogger.endRequest(500, { error: "Failed to parse LLM response (both v_new and v_legacy attempts failed)" });
            return NextResponse.json({ error: "Failed to parse LLM response as valid JSON (tried current and legacy formats)." }, { status: 500 });
        }
        // --- End Backwards Compatibility ---
    }

    // Return the parsed JSON object
    // IMPORTANT: The client needs the updated history. We should add it to the response.
    // Get the latest history from the chat session object (implementation might vary based on SDK version)
    // For now, we'll just return the parsed response. Client-side needs adjustment.
    // TODO: Add updated history to the response payload for the client.
    reqLogger.endRequest(200, { actionType: parsedResponse.actionType }); // Use the new flat field
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