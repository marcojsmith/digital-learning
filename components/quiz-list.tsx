import React from 'react';
import { LessonQuiz, LessonQuizItem } from '@/types'; // Import necessary types

interface QuizListProps {
  // Accept the base type, parent ensures it's 'list'
  quiz: LessonQuiz & { type: 'list'; items: LessonQuizItem[] };
}

const QuizList: React.FC<QuizListProps> = ({ quiz }) => {
  // Ensure items exist before mapping
  if (!quiz.items || quiz.items.length === 0) {
    return <p className="text-muted-foreground">No list items provided for this quiz.</p>;
  }

  return (
    <div className="space-y-3">
      {/* Question is likely rendered by the parent QuizDisplay */}
      {/* {quiz.question && <p className="font-medium mb-2">{quiz.question}</p>} */}
      <ul className="list-none space-y-2 pl-0"> {/* Removed default list styling */}
        {quiz.items.map((item: LessonQuizItem, index: number) => (
          <li key={index} className="flex items-start space-x-2">
            {/* Display letter if available */}
            {item.letter && <span className="font-semibold">{item.letter}.</span>}
            {/* Display question if available */}
            <span>{item.question || 'List item content missing'}</span>
            {/* Add input/selection later if needed */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizList;