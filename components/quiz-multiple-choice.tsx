import React, { useState } from 'react';
import { LessonQuiz } from '@/types'; // Use the base LessonQuiz type
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Using shadcn/ui components
import { Label } from '@/components/ui/label'; // Using shadcn/ui components

interface QuizMultipleChoiceProps {
  // Accept the base type, parent ensures it's 'multiple-choice'
  quiz: LessonQuiz & { type: 'multiple-choice'; options: { text: string; correct: boolean }[] };
  // Optional: Add a callback for when an answer is selected if needed later
  // onAnswerSelect?: (selectedAnswer: string) => void;
}

const QuizMultipleChoice: React.FC<QuizMultipleChoiceProps> = ({ quiz }) => {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    // if (onAnswerSelect) {
    //   onAnswerSelect(value);
    // }
  };

  return (
    <div className="space-y-3">
      {/* Question is likely rendered by the parent QuizDisplay, but check if needed here */}
      {/* {quiz.question && <p className="font-medium mb-2">{quiz.question}</p>} */}
      <RadioGroup value={selectedValue} onValueChange={handleValueChange}>
        {/* Ensure options exist before mapping (though parent should guarantee it) */}
        {quiz.options?.map((option: { text: string; correct: boolean }, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            {/* Use option.text for value and label */}
            <RadioGroupItem value={option.text} id={`option-${quiz.id}-${index}`} />
            <Label htmlFor={`option-${quiz.id}-${index}`}>{option.text}</Label>
          </div>
        ))}
      </RadioGroup>
      {/* Display selected value for debugging/confirmation - remove later */}
      {/* {selectedValue && <p className="mt-2 text-sm text-muted-foreground">Selected: {selectedValue}</p>} */}
    </div>
  );
};

export default QuizMultipleChoice;