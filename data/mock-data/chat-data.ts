import type { Lesson, LessonDatabase, StudentProfile } from "@/types";
// Import the source lessons array from the other mock data file
import { lessons as mainLessons } from "./lesson-data";

// Initial student profile data (previously inline in chat.tsx)
export const initialStudentProfile: StudentProfile = {
    name: "Student",
    grade: 4,
    age: 9,
    learningStyle: "visual",
    challenges: ["multiplication"]
};

// Create the chatLessonDatabase by transforming the main lessons array
// This ensures the chat simulation uses the same data structure and content
// as the rest of the application.
export const chatLessonDatabase: LessonDatabase = mainLessons.reduce((acc, lesson) => {
    // Use the lesson's 'id' as the key in the database object
    acc[lesson.id] = lesson;
    return acc;
}, {} as LessonDatabase); // Initialize with an empty object typed correctly

// Note: The previous hardcoded chatLessonDatabase object is now replaced by this transformation.