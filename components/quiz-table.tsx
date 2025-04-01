import React from 'react';
import { LessonQuiz, LessonQuizItem } from '@/types'; // Import necessary types
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Using shadcn/ui components

interface QuizTableProps {
  // Accept the base type, parent ensures it's 'table'
  quiz: LessonQuiz & { type: 'table'; headers?: string[]; rows?: LessonQuizItem[] };
}

const QuizTable: React.FC<QuizTableProps> = ({ quiz }) => {
  // Ensure headers and rows exist
  if (!quiz.headers || quiz.headers.length === 0 || !quiz.rows || quiz.rows.length === 0) {
    return <p className="text-muted-foreground">Table headers or rows are missing for this quiz.</p>;
  }

  // Determine which properties of LessonQuizItem are actually used in the rows
  // This helps render only relevant columns dynamically.
  const usedProperties = quiz.rows.reduce<Set<keyof LessonQuizItem>>((acc, row) => {
    Object.keys(row).forEach(key => {
      if (row[key as keyof LessonQuizItem] !== undefined && row[key as keyof LessonQuizItem] !== null && row[key as keyof LessonQuizItem] !== '') {
        acc.add(key as keyof LessonQuizItem);
      }
    });
    return acc;
  }, new Set<keyof LessonQuizItem>());

  // Filter headers based on used properties (optional, could just use quiz.headers)
  // const relevantHeaders = quiz.headers.filter(header =>
  //   Array.from(usedProperties).some(prop => prop.toLowerCase().includes(header.toLowerCase()))
  // );
  // For simplicity, we'll use the provided headers directly for now.

  return (
    <div className="overflow-x-auto"> {/* Added for responsiveness */}
      {/* Question is likely rendered by the parent QuizDisplay */}
      {/* {quiz.question && <p className="font-medium mb-2">{quiz.question}</p>} */}
      <Table>
        <TableHeader>
          <TableRow>
            {quiz.headers.map((header, index) => (
              <TableHead key={index}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {quiz.rows.map((row: LessonQuizItem, rowIndex: number) => (
            <TableRow key={rowIndex}>
              {/* Render cells based on the order of headers */}
              {quiz.headers?.map((header, colIndex) => {
                // Find the corresponding property in the row item
                // This assumes headers roughly match property names (case-insensitive)
                // A more robust mapping might be needed if names differ significantly
                const propKey = Object.keys(row).find(key =>
                  key.toLowerCase() === header.toLowerCase()
                ) as keyof LessonQuizItem | undefined;

                const cellValue = propKey ? row[propKey] : '-'; // Default value if no match

                return (
                  <TableCell key={`${rowIndex}-${colIndex}`}>
                    {/* Add input/selection later if needed */}
                    {cellValue}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuizTable;