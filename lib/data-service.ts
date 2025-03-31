import type { Subject, Lesson, LessonDatabase, StudentProfile } from "@/types";

// Simulate async delay for fetching data
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const SIMULATED_DELAY_MS = 50; // Adjust as needed, 0 for no delay

/**
 * Fetches the list of subjects.
 * In a real app, this would fetch from an API or database.
 */
export async function getSubjects(): Promise<Subject[]> {
    // Dynamically import the mock data to simulate fetching
    const { subjects } = await import('@/data/mock-data/lesson-data');
    await delay(SIMULATED_DELAY_MS);
    return subjects;
}

/**
 * Fetches the list of all lessons.
 * In a real app, this would fetch from an API or database.
 */
export async function getLessons(): Promise<Lesson[]> {
    const { lessons } = await import('@/data/lessons'); // Corrected import path
    await delay(SIMULATED_DELAY_MS);
    return lessons;
}

/**
 * Fetches a single lesson by its ID.
 * In a real app, this would fetch from an API or database.
 */
export async function getLessonById(id: string): Promise<Lesson | undefined> {
    const { lessons } = await import('@/data/mock-data/lesson-data');
    await delay(SIMULATED_DELAY_MS);
    return lessons.find(lesson => lesson.id === id);
}

/**
 * Fetches the lesson database used specifically by the chat simulation.
 * In a real app, this might fetch specialized data or be handled differently.
 */
export async function getChatLessonDatabase(): Promise<LessonDatabase> {
    const { chatLessonDatabase } = await import('@/data/mock-data/chat-data');
    await delay(SIMULATED_DELAY_MS);
    return chatLessonDatabase;
}

/**
 * Fetches the initial student profile.
 * In a real app, this would fetch from user authentication/session data.
 */
export async function getInitialStudentProfile(): Promise<StudentProfile | null> {
    const { initialStudentProfile } = await import('@/data/mock-data/chat-data');
    await delay(SIMULATED_DELAY_MS);
    // Return a copy to prevent accidental mutation of the mock data
    return initialStudentProfile ? { ...initialStudentProfile } : null;
}

// Add other data fetching functions as needed (e.g., update progress, save answers)