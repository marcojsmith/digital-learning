import type { Subject, Lesson, LessonDatabase, StudentProfile } from "@/types";

// Simulate async delay for fetching data
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const SIMULATED_DELAY_MS = 50; // Adjust as needed, 0 for no delay

/**
 * Fetches the list of available learning subjects.
 * Simulates an asynchronous API call.
 * @returns A promise resolving to an array of Subject objects.
 */
export async function getSubjects(): Promise<Subject[]> {
    // Dynamically import the mock data to simulate fetching
    const { subjects } = await import('@/data/mock-data/lesson-data');
    await delay(SIMULATED_DELAY_MS);
    return subjects;
}

/**
 * Fetches the list of all available lessons across all subjects.
 * Simulates an asynchronous API call.
 * @returns A promise resolving to an array of Lesson objects.
 */
export async function getLessons(): Promise<Lesson[]> {
    const { lessons } = await import('@/data/lessons'); // Corrected import path
    await delay(SIMULATED_DELAY_MS);
    return lessons;
}

/**
 * Fetches a single lesson by its unique identifier.
 * Simulates an asynchronous API call.
 * @param id - The unique ID of the lesson to fetch.
 * @returns A promise resolving to the Lesson object if found, otherwise undefined.
 */
export async function getLessonById(id: string): Promise<Lesson | undefined> {
    const { lessons } = await import('@/data/mock-data/lesson-data');
    await delay(SIMULATED_DELAY_MS);
    return lessons.find(lesson => lesson.id === id);
}

/**
 * Fetches the structured lesson data used by the chat assistant simulation.
 * Simulates an asynchronous API call.
 * @returns A promise resolving to the LessonDatabase object.
 */
export async function getChatLessonDatabase(): Promise<LessonDatabase> {
    const { chatLessonDatabase } = await import('@/data/mock-data/chat-data');
    await delay(SIMULATED_DELAY_MS);
    return chatLessonDatabase;
}

/**
 * Fetches the initial student profile data.
 * Simulates fetching data for a logged-in user.
 * @returns A promise resolving to the StudentProfile object, or null if unavailable.
 */
export async function getInitialStudentProfile(): Promise<StudentProfile | null> {
    const { initialStudentProfile } = await import('@/data/mock-data/chat-data');
    await delay(SIMULATED_DELAY_MS);
    // Return a copy to prevent accidental mutation of the mock data
    return initialStudentProfile ? { ...initialStudentProfile } : null;
}

// TODO: Add other data fetching functions as needed (e.g., update progress, save answers)