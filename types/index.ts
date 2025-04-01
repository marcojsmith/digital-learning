// --- Quiz/Activity Types ---
/**
 * Represents a single item within a lesson quiz or activity.
 * Structure varies depending on the quiz type (list, table, expansions).
 */
export interface LessonQuizItem {
  letter: string;
  question?: string;
  answer?: string;
  number?: string;
  expansion?: string;
  isExample?: boolean;
  tenThousands?: string;
  thousands?: string;
  hundreds?: string;
  tens?: string;
  units?: string;
}

/**
 * Defines the structure for quizzes or activities associated with a lesson.
 * Supports different formats like lists, tables, expansions, and multiple-choice.
 */
export interface LessonQuiz {
  id: string; // e.g., "quiz1", "activity2"
  title: string;
  type: "list" | "table" | "expansions" | "multiple-choice"; // Added multiple-choice for original format
  concepts: string[];
  // Properties specific to type
  question?: string; // For multiple-choice
  options?: { text: string; correct: boolean }[]; // For multiple-choice
  headers?: string[]; // For table
  items?: LessonQuizItem[]; // For list/expansions
  rows?: LessonQuizItem[]; // For table
}

// --- Main Lesson Type ---
/**
 * Represents a single learning lesson.
 * Contains content, associated concepts, subject, progress, and related quizzes.
 */
export interface Lesson {
  id: string; // e.g., "lesson1"
  lessonId?: string; // Restored as optional, as components might reference it
  title: string;
  contentMarkdown: string; // Renamed from 'description', expects Markdown
  concepts: string[]; // Added concepts
  subject: string;
  progress: "completed" | "in-progress" | "not-started";
  quizzes: LessonQuiz[]; // Replaced single 'quiz' with array
  nextLesson?: string;
  prevLesson?: string;
}

// --- Added LessonDatabase Type ---
/**
 * Represents the structure of the entire lesson database,
 * typically mapping lesson IDs to Lesson objects.
 */
export interface LessonDatabase {
  [key: string]: Lesson;
}

// --- Subject Type ---
/**
 * Represents a subject area containing multiple lessons.
 */
export interface Subject {
  id: string;
  name: string;
  icon: string;
  lessons: string[]; // Lesson IDs
}

// --- User Type ---
/**
 * Represents a user of the application (simplified).
 */
export interface User {
  name: string;
  avatar: string;
}

// --- Chat Related Types ---
/**
 * Represents a single clarification option presented to the user.
 */
export interface ClarificationOption {
  label: string; // Text displayed on the button
  value: string; // Text sent back when the button is clicked
}

/**
 * Represents a single message in the chat interface.
 */
export interface ChatMessage {
  text: string;
  type: "user" | "ai" | "typing";
  isInappropriate?: boolean; // Flag for potentially inappropriate user messages
  clarificationOptions?: ClarificationOption[]; // Optional clarification buttons
}

// Added ChatAction Type
// Define the possible action types based on the new flattened structure
/**
 * Defines the possible action types the AI can request the frontend to perform.
 */
export type ActionType =
  | "displayLessonContent" // Renamed from 
  | "showQuiz"
  | "completeLesson"
  | "returnToLessonOverview"
  | "showPreviousQuiz"
  | "showNextQuiz"
  | "generateFullLesson" // Added for full lesson generation
  | "generateQuiz" // Added for LLM quiz generation
  | "requestClarification" // Added for clarification requests
  | null; // Added null based on LLMResponse definition

// Updated ChatAction interface reflecting the flattened structure
/**
 * Represents an action requested by the AI, including the type and necessary payload.
 */
export interface ChatAction {
  actionType: ActionType;
  lessonId?: string | null; // Corresponds to old payload.lessonId
  quizId?: string | null;   // Corresponds to old payload.quizId
  lessonMarkdownContent?: string | null; // Added for generateFullLesson action
  generatedQuizData?: LessonQuiz[] | null; // Added for generateQuiz action
  // Note: flagsPreviousMessageAsInappropriate is handled separately from the action intent.
}

// Added StudentProfile Type (assuming it might be needed globally)
/**
 * Represents the profile of the student interacting with the learning assistant.
 */
export interface StudentProfile {
  name: string;
  grade: number;
  age: number;
  learningStyle: string;
  challenges: string[];
}

// Added LlmContext Type
/**
 * Represents the contextual information provided to the LLM for generating responses.
 * Includes student profile, current lesson/quiz state, history, and concept tracking.
 */
export interface LlmContext {
  studentProfile: StudentProfile | null;
  currentLesson: { id: string; data: Lesson; startTime: Date; progressPercentage: number } | null;
  currentQuiz: { id: string; data: LessonQuiz; startTime: Date; attempts: number; answers: any; correctCount: number } | null;
  progressHistory: any[]; // Define more specific type if needed
  recentInteractions: any[]; // Define more specific type if needed
  conceptsIntroduced: Set<string>;
  conceptsMastered: Set<string>;
  conceptsStruggling: Set<string>;
}
