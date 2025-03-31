// --- Quiz/Activity Types ---
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
export interface Lesson {
  id: string // e.g., "lesson1"
  lessonId?: string; // Restored as optional, as components might reference it
  title: string
  description: string // Replaced 'content'
  concepts: string[] // Added concepts
  subject: string
  progress: "completed" | "in-progress" | "not-started"
  quizzes: LessonQuiz[] // Replaced single 'quiz' with array
  nextLesson?: string
  prevLesson?: string
}

// --- Added LessonDatabase Type ---
export interface LessonDatabase {
  [key: string]: Lesson;
}

// --- Subject Type ---
export interface Subject {
  id: string
  name: string
  icon: string
  lessons: string[] // Lesson IDs
}

// --- User Type ---
export interface User {
  name: string
  avatar: string
}

// --- Chat Related Types ---
export interface ChatMessage {
  text: string
  type: "user" | "ai" | "typing";
  isInappropriate?: boolean; // Flag for potentially inappropriate user messages
}

// Added ChatAction Type
export interface ChatAction {
    type: "showLessonOverview" | "showQuiz" | "completeLesson" | "returnToLessonOverview" | "showPreviousQuiz" | "showNextQuiz";
    payload: {
        lessonId?: string;
        quizId?: string;
    };
}

// Added StudentProfile Type (assuming it might be needed globally)
export interface StudentProfile {
  name: string;
  grade: number;
  age: number;
  learningStyle: string;
  challenges: string[];
}

// Added LlmContext Type
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
