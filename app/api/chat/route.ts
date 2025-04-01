import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType, GenerationConfig, Content, Part } from "@google/generative-ai";
import { encode } from 'gpt-tokenizer';
import type { LlmContext } from '@/types';
import { SYSTEM_PROMPT } from '@/lib/prompts/system-prompt';
import { logger } from '@/lib/logger';

// --- Constants ---
const MAX_CONTEXT_TOKENS = 4000; // Threshold for triggering context summarization

// --- Utility Functions ---

/**
 * Estimates the token count of a JavaScript object using gpt-tokenizer.
 * @param {any} obj - The object to count tokens for.
 * @returns {number} The estimated token count.
 */
function countTokens(obj: any): number {
  // Use gpt-tokenizer for accurate token counting based on GPT models
  const jsonString = JSON.stringify(obj);
  return encode(jsonString).length;
}

/**
 * Placeholder function for summarizing the LLM context if it exceeds token limits.
 * Currently logs a warning and returns the original context.
 * @param {LlmContext} context - The context object to potentially summarize.
 * @param {any} reqLogger - The request-specific logger instance.
 * @returns {Promise<LlmContext>} A promise resolving to the original or summarized context.
 * @todo Implement actual LLM call for summarization.
 */
async function summarizeContext(context: LlmContext, reqLogger: any): Promise<LlmContext> {
  reqLogger.warn("Context summarization triggered, but not yet implemented. Returning original context.");
  // Example of how summarization might be prompted:
  // const summaryPrompt = `Summarize this learning context concisely, focusing on the current lesson, mastered/struggling concepts, and the last 2 interactions:
  // ${JSON.stringify(context, null, 2)}`;
  // const summaryResponse = await callLlmForSummary(summaryPrompt); // Hypothetical function
  // return parseSummaryResponse(summaryResponse); // Hypothetical function
  return context; // Return original context for now
}

/**
 * Builds the chat history array in the format expected by the Google Generative AI SDK.
 * Includes the system prompt and recent user/AI interactions.
 * @param {string} systemPrompt - The initial system prompt defining the AI's role.
 * @param {LlmContext['recentInteractions']} interactions - Array of recent user/AI messages.
 * @returns {Content[]} The formatted chat history.
 */
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
      // Assuming ai_response contains the text in responseText and follows the flat structure
      if (interaction.ai_response?.responseText) {
        const modelResponsePart = {
          text: JSON.stringify({
            responseText: interaction.ai_response.responseText,
            actionType: interaction.ai_response.actionType,
            lessonId: interaction.ai_response.lessonId,
            quizId: interaction.ai_response.quizId,
            flagsPreviousMessageAsInappropriate: interaction.ai_response.flagsPreviousMessageAsInappropriate,
            reasoning: interaction.ai_response.reasoning,
            // lessonMarkdownContent and generatedQuizData are typically only in the *current* response, not history
          })
        };
        history.push({ role: "model", parts: [modelResponsePart] });
      }
    });
  }
  return history;
}

// --- Gemini Configuration ---
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const llmModelName = process.env.LLM_MODEL_NAME;

if (!apiKey) {
    logger.warn("GEMINI_API_KEY environment variable is not set. API calls will fail.");
}
if (!llmModelName) {
  logger.error("LLM_MODEL_NAME environment variable is not set.");
  // Throwing error prevents server start/request handling if model isn't configured.
  throw new Error("LLM_MODEL_NAME environment variable is not set. Please configure it.");
}

const model = genAI?.getGenerativeModel({ model: llmModelName });

/**
 * Configuration settings for the Gemini model generation.
 * @type {GenerationConfig}
 */
const generationConfig: GenerationConfig = {
  temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.1'), // Lower temperature for more deterministic, less creative responses
  topP: parseFloat(process.env.LLM_TOP_P || '0.95'),
  topK: parseInt(process.env.LLM_TOP_K || '40', 10),
  maxOutputTokens: parseInt(process.env.LLM_MAX_OUTPUT_TOKENS || '1000', 10), // Maximum tokens allowed in the response
  responseMimeType: "application/json", // Expect a JSON response
  responseSchema: { // Define the expected flat JSON structure
    type: SchemaType.OBJECT,
    properties: {
      responseText: { type: SchemaType.STRING }, // Required text response
      actionType: { type: SchemaType.STRING, nullable: true }, // e.g., "showQuiz", "generateQuiz", null
      lessonId: { type: SchemaType.STRING, nullable: true },
      quizId: { type: SchemaType.STRING, nullable: true },
      lessonMarkdownContent: { type: SchemaType.STRING, nullable: true },
      generatedQuizData: { // Added for quiz generation
        type: SchemaType.ARRAY,
        nullable: true,
        items: { // Define the structure of objects within the array (LessonQuiz)
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.STRING },
            title: { type: SchemaType.STRING },
            type: { type: SchemaType.STRING }, // Removed enum, rely on prompt/validation
            concepts: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            question: { type: SchemaType.STRING, nullable: true },
            options: { // For multiple-choice
              type: SchemaType.ARRAY,
              nullable: true,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  text: { type: SchemaType.STRING },
                  correct: { type: SchemaType.BOOLEAN }
                },
                required: ["text", "correct"]
              }
            },
            headers: { // For table
              type: SchemaType.ARRAY,
              nullable: true,
              items: { type: SchemaType.STRING }
            },
            items: { // For list/expansions (LessonQuizItem structure)
              type: SchemaType.ARRAY,
              nullable: true,
              items: {
                type: SchemaType.OBJECT,
                properties: { // Simplified LessonQuizItem for schema validation
                  letter: { type: SchemaType.STRING },
                  question: { type: SchemaType.STRING, nullable: true },
                  answer: { type: SchemaType.STRING, nullable: true },
                  number: { type: SchemaType.STRING, nullable: true },
                  expansion: { type: SchemaType.STRING, nullable: true },
                  isExample: { type: SchemaType.BOOLEAN, nullable: true },
                  // Place value fields omitted for brevity in schema, rely on prompt
                },
                required: ["letter"]
              }
            },
            rows: { // For table (LessonQuizItem structure)
              type: SchemaType.ARRAY,
              nullable: true,
              items: {
                type: SchemaType.OBJECT,
                properties: { // Simplified LessonQuizItem for schema validation
                  letter: { type: SchemaType.STRING },
                  question: { type: SchemaType.STRING, nullable: true },
                  answer: { type: SchemaType.STRING, nullable: true },
                  // Other LessonQuizItem fields omitted for brevity
                },
                required: ["letter"]
              }
            }
          },
          required: ["id", "title", "type", "concepts"]
        }
      },
      flagsPreviousMessageAsInappropriate: { type: SchemaType.BOOLEAN },
      reasoning: { type: SchemaType.STRING, nullable: true },
      clarificationOptions: { // Added for clarification buttons
        type: SchemaType.ARRAY,
        nullable: true,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            label: { type: SchemaType.STRING },
            value: { type: SchemaType.STRING }
          },
          required: ["label", "value"]
        }
      },
    },
    required: ["responseText", "flagsPreviousMessageAsInappropriate"]
  },
};

/**
 * Safety settings to configure content moderation for the Gemini model.
 * Blocks content categorized as medium or high probability for listed harm categories.
 * @type {Array<object>}
 */
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// --- API Route Handler ---

/**
 * Handles POST requests to the /api/chat endpoint.
 * Processes user messages, interacts with the Gemini LLM, and returns the AI's response.
 * Manages context, history, safety settings, and response validation.
 *
 * @param {Request} request - The incoming Next.js API request object.
 * @returns {Promise<NextResponse>} A promise resolving to the API response.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!apiKey || !genAI || !model) {
    logger.error("Gemini API key or client not initialized. Cannot process request.");
    return NextResponse.json({ error: "API not configured correctly." }, { status: 500 });
  }

  const reqLogger = logger.startRequest({ path: request.url, method: request.method });

  let requestBody: any;
  try {
    const rawBody = await request.text();
    reqLogger.logPayload('request', rawBody); // Log raw body (consider logging only size in production)
    try {
        requestBody = JSON.parse(rawBody);
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
      // Proceed with the original context if summarization fails or is skipped.
      reqLogger.warn('Context summarization skipped/failed. Proceeding with original context.');
      processedLlmContext = currentLlmContext;
    }
  } else {
    reqLogger.info(`Context size (${contextTokenCount}) is within threshold (${MAX_CONTEXT_TOKENS}). No summarization needed.`);
  }

  // --- Start LLM Interaction using Chat Session ---
  try {
    // Use processedLlmContext (original or summarized)
    const chatHistory = buildChatHistory(SYSTEM_PROMPT, processedLlmContext.recentInteractions);
    reqLogger.info(`Built chat history with ${chatHistory.length} items.`);

    const chatSession = model.startChat({
        history: chatHistory,
        generationConfig,
        safetySettings,
    });

    // Prepare the message payload for this turn
    const messagePayload = {
        currentUserMessage,
        availableLessons: availableLessons, // Provide map {id: title}
        currentLessonDetails: currentLessonData ? { // Provide essential details
            id: currentLessonData.id,
            title: currentLessonData.title,
            prevLesson: currentLessonData.prevLesson,
            nextLesson: currentLessonData.nextLesson
        } : undefined,
        currentLesson: currentLlmContext.currentLesson ? { id: currentLlmContext.currentLesson.id } : undefined
    };
    // Send payload as a JSON string within the message part
    const messageText = `input: ${JSON.stringify(messagePayload)}`;
    const messageToSend: Part[] = [
        { text: messageText },
        { text: "\noutput: " } // Marker for the AI to start its JSON output
    ];

    reqLogger.logPayload('llm_request', { message: messageText }); // Log message being sent

    const result = await chatSession.sendMessage(messageToSend);
    reqLogger.info("Received raw response from Gemini chat session.");

    // --- Response Handling ---
    if (!result.response) {
        reqLogger.error("Gemini response object was undefined.");
        throw new Error("No response object received from LLM chat session.");
    }

    const candidates = result.response.candidates;
    if (!candidates || candidates.length === 0 || !candidates[0].content || !candidates[0].content.parts || candidates[0].content.parts.length === 0) {
        reqLogger.error("Invalid response structure from Gemini: Missing candidates or content parts.", { response: result.response });

        // Handle safety blocking
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
                details: { reason: blockReason, blockedCategories }
            }, { status: 403 });
        }

        // Handle other empty/invalid responses
        reqLogger.endRequest(422, { error: "Empty response from LLM" });
        return NextResponse.json({
            error: "The AI couldn't generate a response to your message",
            details: "This might be due to content restrictions or technical limitations"
        }, { status: 422 });
    }

    const responseText = candidates[0].content.parts[0].text;
    reqLogger.logPayload('llm_response', responseText); // Log raw response text
    if (!responseText) {
        reqLogger.error("Empty text part in Gemini response.", { parts: candidates[0].content.parts });
        throw new Error("Empty response text from LLM chat session.");
    }

    // Attempt to parse the JSON response text
    let parsedResponse;
    try {
      const jsonToParse = responseText.trim();
      if (!jsonToParse) {
           reqLogger.error("Received empty JSON string from LLM.", { rawResponse: responseText });
           throw new Error("Empty JSON content from LLM response.");
      }
      try {
          parsedResponse = JSON.parse(jsonToParse);
          reqLogger.info("Successfully parsed Gemini JSON response.", { rawResponsePreview: jsonToParse.substring(0, 100) }); // Log success + preview
      } catch (jsonParseError) {
          reqLogger.error("Failed to parse LLM JSON response", jsonParseError instanceof Error ? jsonParseError : { error: jsonParseError });
          reqLogger.error("Raw response text that failed parsing:", { rawResponse: responseText });
          // Throw a new error specifically indicating parsing failure
          throw new Error(`LLM response JSON parsing failed: ${jsonParseError instanceof Error ? jsonParseError.message : 'Unknown parsing error'}`);
      }

      // Clean up potential LLM prefix and duplicate title in lesson content (only if parsing succeeded)
      if (parsedResponse.lessonMarkdownContent && typeof parsedResponse.lessonMarkdownContent === 'string') {
        const lines = parsedResponse.lessonMarkdownContent.split('\n');
        // Check if there are at least two lines and they match the expected prefixes
        if (lines.length >= 2 && lines[0].startsWith('Lesson generated-: Lesson:') && lines[1].startsWith('Lesson:')) {
          // Remove the first two lines and join the rest
          parsedResponse.lessonMarkdownContent = lines.slice(2).join('\n');
          reqLogger.info("Cleaned up LLM lesson content prefix and duplicate title.");
        }
      }

      const tokenUsage = result.response?.usageMetadata?.totalTokenCount;
      reqLogger.logLlmResult(parsedResponse, tokenUsage);
        // --- Start Response Validation ---
        if (parsedResponse.responseText === undefined || parsedResponse.responseText === null) {
            reqLogger.error('Validation Error: responseText is missing or null.', { response: parsedResponse });
            throw new Error('LLM response missing required field: responseText');
        }
        if (typeof parsedResponse.flagsPreviousMessageAsInappropriate !== 'boolean') {
            reqLogger.error('Validation Error: flagsPreviousMessageAsInappropriate is missing or not a boolean.', { response: parsedResponse });
            throw new Error('LLM response missing or invalid required field: flagsPreviousMessageAsInappropriate');
        }

        // Action-specific validation
        if (parsedResponse.actionType) {
          const action = parsedResponse.actionType;
          const requiresLessonId = ['showQuiz', 'displayLessonContent', 'completeLesson', 'returnToLessonOverview'];
          const requiresQuizId = ['showQuiz', 'showPreviousQuiz', 'showNextQuiz']; // Added from types
          const requiresMarkdown = ['generateFullLesson'];
          const requiresGeneratedQuiz = ['generateQuiz']; // Added

          if (requiresLessonId.includes(action) && (!parsedResponse.lessonId || typeof parsedResponse.lessonId !== 'string')) {
            reqLogger.error(`Validation Error: Action '${action}' requires a non-empty string 'lessonId'.`, { response: parsedResponse });
            throw new Error(`LLM response action '${action}' missing or invalid 'lessonId'.`);
          }
          if (requiresQuizId.includes(action) && (!parsedResponse.quizId || typeof parsedResponse.quizId !== 'string')) {
            reqLogger.error(`Validation Error: Action '${action}' requires a non-empty string 'quizId'.`, { response: parsedResponse });
            throw new Error(`LLM response action '${action}' missing or invalid 'quizId'.`);
          }
          if (requiresMarkdown.includes(action) && (!parsedResponse.lessonMarkdownContent || typeof parsedResponse.lessonMarkdownContent !== 'string' || parsedResponse.lessonMarkdownContent.trim() === '')) {
            reqLogger.error(`Validation Error: Action '${action}' requires a non-empty string 'lessonMarkdownContent'.`, { response: parsedResponse });
            throw new Error(`LLM response action '${action}' missing or invalid 'lessonMarkdownContent'.`);
          }
          if (requiresGeneratedQuiz.includes(action)) {
            if (!parsedResponse.generatedQuizData || !Array.isArray(parsedResponse.generatedQuizData) || parsedResponse.generatedQuizData.length === 0) {
              reqLogger.error(`Validation Error: Action '${action}' requires a non-empty array 'generatedQuizData'.`, { response: parsedResponse });
              throw new Error(`LLM response action '${action}' missing or invalid 'generatedQuizData'.`);
            }
            // Basic check on the first item as a sanity check (optional)
            const firstQuiz = parsedResponse.generatedQuizData[0];
            if (!firstQuiz || typeof firstQuiz.id !== 'string' || typeof firstQuiz.title !== 'string' || typeof firstQuiz.type !== 'string') {
               reqLogger.warn(`Validation Warning: First item in 'generatedQuizData' for action '${action}' seems malformed.`, { firstQuiz });
               // Decide whether to throw an error or just warn
               // throw new Error(`LLM response action '${action}' has malformed 'generatedQuizData'.`);
            }
          }

          // Log unhandled known actions if necessary, or just proceed
          // Update knownActions to include all defined action types
          const knownActions = [
            ...requiresLessonId,
            ...requiresQuizId,
            ...requiresMarkdown,
            ...requiresGeneratedQuiz,
            'clarifyQuestion', // Add other known actions not covered by specific requirements
            'returnToLessonOverview', // Added based on types/index.ts
            'showPreviousQuiz', // Added based on types/index.ts
            'showNextQuiz' // Added based on types/index.ts
          ];
          if (!knownActions.includes(action)) {
             reqLogger.warn(`Received potentially unknown or unvalidated actionType: ${action}`, { response: parsedResponse });
          }
        }
        reqLogger.debug(`Validation passed for response (v_new). Action Type: ${parsedResponse.actionType || 'null'}`);
        // --- End Response Validation ---

    } catch (parseOrValidationError) {
        const errorContext = parseOrValidationError instanceof Error ? { error: { message: parseOrValidationError.message, name: parseOrValidationError.name } } : { error: parseOrValidationError };
        reqLogger.error("LLM response parsing/validation failed", errorContext);
        reqLogger.error("Raw response text that failed parsing/validation:", { rawResponse: responseText });

        reqLogger.endRequest(500, { error: "Error processing LLM response" });
        // Use Response constructor for non-JSON error body
        return NextResponse.json({ error: 'Error processing LLM response' }, { status: 500 });
    }

    // Return the parsed LLM response and the updated history
    const updatedHistory = await chatSession.getHistory();
    reqLogger.info(`Returning history with ${updatedHistory.length} entries.`);

    reqLogger.endRequest(200, { actionType: parsedResponse.actionType });
    return NextResponse.json({ llmResponse: parsedResponse, history: updatedHistory });

  } catch (error) {
    reqLogger.error("Unhandled error in chat API handler", error instanceof Error ? error : { error: error });
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    // Ensure request ends even on unhandled errors
    if (!reqLogger.hasEnded()) {
        reqLogger.endRequest(500, { error: errorMessage });
    }
    return NextResponse.json({ error: `LLM API call failed: ${errorMessage}` }, { status: 500 });
  }
}