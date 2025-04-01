import React from 'react';
import { LessonQuiz, LessonQuizItem } from '@/types'; // Import necessary types
import { Input } from "@/components/ui/input"; // Using shadcn/ui components
import { Label } from "@/components/ui/label"; // Using shadcn/ui components

interface QuizExpansionsProps {
  // Accept the base type, parent ensures it's 'expansions'
  quiz: LessonQuiz & { type: 'expansions'; items: LessonQuizItem[] };
}

const QuizExpansions: React.FC<QuizExpansionsProps> = ({ quiz }) => {
  // Ensure items exist before mapping
  if (!quiz.items || quiz.items.length === 0) {
    return <p className="text-muted-foreground">No expansion items provided for this quiz.</p>;
  }

  // Basic state to hold user inputs (not submitted)
  const [expansions, setExpansions] = React.useState<{ [key: number]: string }>({});

  const handleInputChange = (index: number, value: string) => {
    setExpansions(prev => ({ ...prev, [index]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Question is likely rendered by the parent QuizDisplay */}
      {/* {quiz.question && <p className="font-medium mb-2">{quiz.question}</p>} */}
      {quiz.items.map((item: LessonQuizItem, index: number) => (
        <div key={index} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          {/* Display number if available */}
          {item.number && (
            <Label htmlFor={`expansion-${quiz.id}-${index}`} className="w-full sm:w-auto font-semibold mb-1 sm:mb-0">
              {item.number} =
            </Label>
          )}
          {/* Provide an input for the expansion */}
          <Input
            id={`expansion-${quiz.id}-${index}`}
            type="text"
            placeholder="Enter expansion"
            value={expansions[index] || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            className="flex-grow" // Allow input to take available space
          />
          {/* Optionally display the expected answer for debugging/reference if available */}
          {/* {item.expansion && <span className="text-sm text-muted-foreground">(Expected: {item.expansion})</span>} */}
        </div>
      ))}
    </div>
  );
};

export default QuizExpansions;