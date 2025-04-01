import React from 'react';
import { LessonQuiz, LessonQuizItem } from '@/types'; // Import LessonQuizItem as well
import QuizMultipleChoice from '@/components/quiz-multiple-choice'; // Use path alias
import QuizList from '@/components/quiz-list'; // Use path alias
import QuizTable from '@/components/quiz-table'; // Use path alias
import QuizExpansions from '@/components/quiz-expansions'; // Use path alias

interface QuizDisplayProps {
  quizzes: LessonQuiz[];
}

const QuizDisplay: React.FC<QuizDisplayProps> = ({ quizzes }) => {
  if (!quizzes || quizzes.length === 0) {
    return null; // Or some placeholder/message
  }

  return (
    <div className="space-y-6 my-6"> {/* Added margin */}
      <h2 className="text-xl font-semibold mb-4">Quiz Time!</h2>
      {quizzes.map((quiz, index) => (
        <div key={index} className="p-4 border rounded-lg shadow-sm bg-card text-card-foreground"> {/* Added text color */}
          {/* Render question only if it exists */}
          {quiz.question && <h3 className="text-lg font-medium mb-3">{quiz.question}</h3>}
          {(() => {
            // Type guard needed because LessonQuiz is a union type
            switch (quiz.type) {
              case 'multiple-choice':
                // Explicitly cast to the expected type
                if (quiz.type === 'multiple-choice') {
                  return <QuizMultipleChoice quiz={quiz as LessonQuiz & { type: 'multiple-choice'; options: { text: string; correct: boolean }[] }} />;
                }
                break;
              case 'list':
                 // Explicitly cast to the expected type
                if (quiz.type === 'list') {
                  return <QuizList quiz={quiz as LessonQuiz & { type: 'list'; items: LessonQuizItem[] }} />;
                }
                break;
              case 'table':
                 // Explicitly cast to the expected type
                if (quiz.type === 'table') {
                  return <QuizTable quiz={quiz as LessonQuiz & { type: 'table'; headers?: string[]; rows?: LessonQuizItem[] }} />;
                }
                break;
              case 'expansions':
                 // Explicitly cast to the expected type
                if (quiz.type === 'expansions') {
                  return <QuizExpansions quiz={quiz as LessonQuiz & { type: 'expansions'; items: LessonQuizItem[] }} />;
                }
                break;
              default:
                // Optional: Handle unknown quiz types
                // The switch should ideally be exhaustive based on LessonQuiz['type']
                // If a new type is added to LessonQuiz['type'] without updating this switch,
                // TypeScript might not error depending on configuration, hence the warning.
                const unknownQuiz = quiz as any; // Cast to any to access type property safely
                console.warn(`Unsupported quiz type: ${unknownQuiz?.type}`);
                return <p>Unsupported quiz type: {unknownQuiz?.type}</p>;
            }
          })()}
        </div>
      ))}
      {/* Add a submit button later if needed */}
      {/* <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded">Submit Answers</button> */}
    </div>
  );
};

export default QuizDisplay;