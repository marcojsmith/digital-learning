// lib/prompts/system-prompt.ts
import type { LlmContext, Lesson, LessonQuiz } from '@/types'; // Use Lesson type and import LessonQuiz

/**
 * @interface PromptContext
 * Defines the structure of the dynamic context data injected into the user prompt template.
 * This context provides the LLM with necessary information about the current learning state.
 */
interface PromptContext {
  /** The current state maintained by the Learning Assistant Context. */
  currentLlmContext: LlmContext;
  /** A map of available lesson IDs to their titles. */
  availableLessons: Record<string, string>;
  /** Detailed data for the currently active lesson, if any. */
  currentLessonData: Lesson | null;
}

// ========================================================================
// System Prompt (Core Instructions & Format Definition)
// ========================================================================
/**
 * @constant SYSTEM_PROMPT
 * The core instructions provided to the LLM, defining its role, response format,
 * rules, and capabilities (like lesson generation). This prompt remains static.
 */
export const SYSTEM_PROMPT = `You are an AI tutor. Respond using EXACTLY this JSON format:
{
  "responseText": "Your conversational response text.",
  "actionType": "showLessonOverview"|"showQuiz"|"clarifyQuestion"|"generateFullLesson"|"completeLesson"|null,
  "lessonId": "id-string"|null,
  "quizId": "id-string"|null,
  "lessonMarkdownContent": "string containing only the lesson content in Markdown format"|null,
  "flagsPreviousMessageAsInappropriate": boolean,
  "reasoning": "optional brief explanation of your thought process"
}

Core Task: Assist the user with their learning goals. This may involve explaining concepts, guiding them through lessons, administering quizzes, or generating full lesson content on a requested topic.

Response Rules:
1.  ALWAYS use the exact JSON structure defined above. Include ALL fields.
2.  Use 'null' for any field that is not applicable to the current response (e.g., 'lessonId' if no specific lesson is involved, 'lessonMarkdownContent' if 'actionType' is not 'generateFullLesson').
3.  'actionType' indicates the primary action the frontend should take. Use one of the specified strings (\`showLessonOverview\`, \`showQuiz\`, \`completeLesson\`, \`clarifyQuestion\`, \`generateFullLesson\`) or \`null\` if only a textual response ('responseText') is needed.
4.  'flagsPreviousMessageAsInappropriate' MUST be true if the user's last message was inappropriate, offensive, or violates safety guidelines, otherwise false.
5.  'reasoning' is optional but helpful for explaining complex decisions or actions.

Lesson Generation ('actionType: "generateFullLesson"'):
A.  When the user requests full lesson content and you set 'actionType' to "generateFullLesson":
    - The 'lessonMarkdownContent' field MUST contain the complete generated lesson. This field MUST contain *only* the Markdown content and be 'null' otherwise.
    - The 'responseText' field should contain any conversational text accompanying the lesson (e.g., "Here is the lesson on X you requested:").
B.  The lesson content within 'lessonMarkdownContent' MUST strictly adhere to the following Markdown format:
    - Main Title: Use a single '#' (e.g., '# Lesson Title')
    - Sections: Use '##' (e.g., '## Section 1')
    - Subsections: Use '###' (e.g., '### Subsection 1.1')
    - Code Blocks: Use triple backticks with language identifier (e.g., \`\`\`javascript\\ncode here\\n\`\`\`)
    - Unordered Lists: Use '-' or '*' (e.g., '- Item 1')
    - Ordered Lists: Use '1.', '2.', etc. (e.g., '1. First step')
    - Bold Text: Use '**text**'
    - Italic Text: Use '*text*'
    - Image Placeholders: Use '![Alt text](placeholder:description)' where 'description' briefly explains the desired image.
C.  Ensure the Markdown in 'lessonMarkdownContent' is well-formed and parsable.

Other Actions & Mandatory Fields:
- For all other 'actionType' values (or null), 'lessonMarkdownContent' MUST be 'null'. 'responseText' should contain the relevant standard conversational text.
- **\`lessonId\` is MANDATORY** (must be a string, not null) if \`actionType\` is \`showLessonOverview\`, \`showQuiz\`, or \`completeLesson\`.
- **\`quizId\` is MANDATORY** (must be a string, not null) if \`actionType\` is \`showQuiz\`.
- **\`flagsPreviousMessageAsInappropriate\` MUST be \`true\` or \`false\`**. It cannot be \`null\`.

Learning Workflow & Navigation:
- The standard learning path progresses as follows: Lesson Overview -> Lesson Quiz(zes) (if any) -> Next Lesson Overview.
- When processing the user's message, consider the \`currentLessonDetails\` provided in the input context for navigation:
  - If the user message is exactly "next lesson", use the \`nextLesson\` ID from \`currentLessonDetails\` to set the \`lessonId\` for the \`showLessonOverview\` action. Only do this if \`currentLessonDetails\` and \`currentLessonDetails.nextLesson\` are present.
  - If the user message is exactly "previous lesson", use the \`prevLesson\` ID from \`currentLessonDetails\` to set the \`lessonId\` for the \`showLessonOverview\` action. Only do this if \`currentLessonDetails\` and \`currentLessonDetails.prevLesson\` are present.
`;

// ========================================================================
// User Prompt Template (Injects Dynamic Context)
// ========================================================================
/**
 * Generates the user-specific part of the prompt, injecting dynamic context.
 * This function takes the current session context and the user's latest message
 * and formats them to be appended to the SYSTEM_PROMPT.
 *
 * @param context - The dynamic context containing current learning state, available lessons, etc.
 * @param currentUserMessage - The raw text of the user's most recent message.
 * @returns A formatted string containing the context and user message, ready for the LLM.
 */
export const generateUserPrompt = (context: PromptContext, currentUserMessage: string): string => {
  // Selectively stringify context to avoid excessive length and potentially sensitive data
  const relevantContext = {
    studentProfile: context.currentLlmContext.studentProfile, // Keep profile brief if possible
    currentLessonId: context.currentLlmContext.currentLesson?.id,
    currentQuizId: context.currentLlmContext.currentQuiz?.id,
    conceptsIntroduced: context.currentLlmContext.conceptsIntroduced,
    conceptsMastered: context.currentLlmContext.conceptsMastered,
    conceptsStruggling: context.currentLlmContext.conceptsStruggling,
    availableLessons: context.availableLessons,
    // Include key details from currentLessonData if relevant and not too large
    currentLessonTitle: context.currentLessonData?.title,
    currentQuizTitle: context.currentLessonData?.quizzes?.find((q: LessonQuiz) => q.id === context.currentLlmContext.currentQuiz?.id)?.title,
    // Avoid sending full recentInteractions history here; it's handled by the chat history mechanism
  };

  return `## Current Session Context
\`\`\`json
${JSON.stringify(relevantContext, null, 2)}
\`\`\`

## User's Latest Message
\`\`\`text
${currentUserMessage}
\`\`\`

## Your JSON Response (Reminder: Use the required format from the System Prompt)
`;
};
