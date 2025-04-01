"use client"
import React from 'react';
import { useState, useEffect } from "react";

import ReactMarkdown, { type Components } from 'react-markdown'
// Removed unstable import: import { type CodeProps } from 'react-markdown/lib/ast-to-react'
import remarkGfm from 'remark-gfm'
import type { Lesson, LessonQuiz, LessonQuizItem } from "@/types" // Added LessonQuizItem
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Added Input import
interface LessonContentProps {
  lesson: Lesson
  allLessons: Lesson[] // Keep for nav titles
  currentQuizIdToShow: string | null
  onSimulateUserMessage: (message: string) => void; // New prop
  onLessonComplete: (lessonId: string) => void // Keep for now
  // Removed onNavigateRequest and onShowQuiz
}

// Helper Function to Render Specific Quiz (updated for Markdown)
const renderQuiz = (
  quiz: LessonQuiz,
  selectedAnswer: string | null,
  setSelectedAnswer: (value: string | null) => void,
  listAnswers: { [key: string]: string },
  setListAnswers: (answers: { [key: string]: string }) => void,
  tableAnswers: { [key: string]: string },
  setTableAnswers: (answers: { [key: string]: string }) => void,
  expansionAnswers: { [key: string]: string }, // Added expansionAnswers state
  setExpansionAnswers: (answers: { [key: string]: string }) => void // Added setter for expansionAnswers
) => {
  // Common Markdown components configuration
  const markdownComponents: Components = { // Add Components type
    // Handle custom image placeholder syntax: ![Alt text](placeholder:description)
    img: ({ node, ...props }: { node?: any; src?: string; alt?: string }) => {
      if (props.src?.startsWith('placeholder:')) {
        const description = props.src.substring('placeholder:'.length);
        return (
          <span className="block text-center p-4 border border-dashed border-gray-400 rounded my-4 bg-gray-50 dark:bg-gray-800">
            🖼️ Image Placeholder: {props.alt || description || 'No description provided'}
          </span>
        );
      }
      // eslint-disable-next-line @next/next/no-img-element
      return <img {...props} alt={props.alt || ''} />; // Default rendering for other images
    },
    // Optional: Add custom styling or handling for other elements like code blocks
    code({ node, inline, className, children, ...props }: { node?: any; inline?: boolean; className?: string; children?: React.ReactNode }) { // Define type inline
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <div className="my-4 rounded bg-gray-900 dark:bg-black overflow-hidden">
          <div className="px-4 py-1 bg-gray-700 dark:bg-gray-800 text-xs text-gray-300 font-mono flex justify-between items-center">
            <span>{match[1]}</span>
            {/* Add copy button? */}
          </div>
          <pre className="p-4 text-sm text-gray-100 overflow-x-auto"><code className={className} {...props}>
            {children}
          </code></pre>
        </div>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
  };

  // Render quiz based on type
    // ... (renderQuiz implementation remains unchanged)
    return (
        <div className="bg-light-gray p-6 rounded-lg mt-6 border border-medium-gray">
            <h3 className="mb-4 text-xl text-primary-dark font-medium">{quiz.title}</h3>
            {quiz.type === "list" && quiz.items && (
                <ol className="list-decimal list-inside space-y-2">
                    {quiz.items.map(item => (
                        <li key={item.letter}>
                            {item.question ? <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{item.question}</ReactMarkdown> : null}
                            <Input
                              type="text"
                              value={listAnswers[item.letter] || ''}
                              onChange={(e) => setListAnswers({ ...listAnswers, [item.letter]: e.target.value })}
                              className="inline-block ml-2 w-auto min-w-[100px] border-gray-400" // Use Input component
                              placeholder="Your answer"
                            />
                        </li>
                    ))}
                </ol>
            )}
            {quiz.type === "table" && quiz.rows && quiz.headers && (
                 <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-medium-gray text-sm text-center">
                        <thead>
                            <tr className="bg-gray-100">
                                {quiz.headers.map((header, index) => (
                                    <th key={index} className="border border-medium-gray p-2">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {quiz.rows.map(row => (
                                <tr key={row.letter}>
                                    <td className="border border-medium-gray p-2">{row.letter}</td>
                                    <td className="border border-medium-gray p-2">{row.number}</td>
                                    {/* Render Input or value for each place value column */}
                                    {['tenThousands', 'thousands', 'hundreds', 'tens', 'units'].map(placeValue => {
                                        const cellKey = `${row.letter}-${placeValue}`;
                                        const value = (row as any)[placeValue]; // Type assertion needed if row type isn't specific enough
                                        return (
                                            <td key={cellKey} className="border border-medium-gray p-1">
                                                {value != null ? ( // Check for null or undefined
                                                    value
                                                ) : (
                                                    <Input
                                                        type="text"
                                                        value={tableAnswers[cellKey] || ''}
                                                        onChange={(e) => setTableAnswers({ ...tableAnswers, [cellKey]: e.target.value })}
                                                        className="w-full h-full text-center border-none focus:ring-0 p-1 text-sm" // Adjusted styling
                                                        placeholder="" // Keep placeholder minimal or empty
                                                    />
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            )}
            {quiz.type === "expansions" && quiz.items && (
                 <ol className="list-decimal list-inside space-y-4"> {/* Increased spacing */}
                    {quiz.items.map(item => {
                        const placeValues = ['thousands', 'hundreds', 'tens', 'ones'].filter(pv => (item as any)[pv] === null || (item as any)[pv] === undefined); // Determine which inputs are needed

                        return (
                            <li key={item.letter} className="flex items-center space-x-1"> {/* Use flex for alignment */}
                                <span>{item.number} = </span>
                                {item.isExample ? (
                                    <span className="ml-1 font-mono">{item.expansion}</span>
                                ) : (
                                    <div className="flex items-center space-x-1 ml-1">
                                        {/* Render inputs dynamically based on available null place values */}
                                        {placeValues.map((placeValue, index) => {
                                            const inputKey = `${item.letter}-${placeValue}`;
                                            return (
                                                <React.Fragment key={inputKey}>
                                                    {index > 0 && <span className="text-gray-500">+</span>}
                                                    <Input
                                                        type="text" // Use text initially, consider number later if needed
                                                        pattern="[0-9]*" // Allow only numbers
                                                        inputMode="numeric" // Hint for mobile keyboards
                                                        value={expansionAnswers[inputKey] || ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/[^0-9]/g, ''); // Ensure only numbers are stored
                                                            setExpansionAnswers({ ...expansionAnswers, [inputKey]: value });
                                                        }}
                                                        className="w-16 h-8 text-center border-gray-400 px-1 text-sm" // Compact styling
                                                        placeholder={placeValue.charAt(0).toUpperCase()} // Placeholder like T, H, T, O
                                                    />
                                                </React.Fragment>
                                            );
                                        })}
                                        {/* Add logic here if the structure is different, e.g., a single expansion input */}
                                        {placeValues.length === 0 && !item.isExample && (
                                            // Fallback if no specific place values are null but it's not an example
                                            // This might indicate a different structure or a single input field needed
                                            <Input
                                                type="text"
                                                value={expansionAnswers[`${item.letter}-full`] || ''}
                                                onChange={(e) => setExpansionAnswers({ ...expansionAnswers, [`${item.letter}-full`]: e.target.value })}
                                                className="w-32 h-8 border-gray-400 px-1 text-sm ml-1"
                                                placeholder="Expansion"
                                            />
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ol>
            )}
            {quiz.type === "multiple-choice" && quiz.question && quiz.options && (
                 <div>
                    {quiz.question && <div className="mb-3 prose prose-indigo max-w-none dark:prose-invert"><ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{quiz.question}</ReactMarkdown></div>}
                    <RadioGroup value={selectedAnswer ?? undefined} onValueChange={setSelectedAnswer} className="space-y-2">
                      {quiz.options.map((option, index) => {
                        const optionId = `${quiz.id}-option-${index}`;
                        return (
                          <div key={optionId} className="flex items-center space-x-2 p-3 bg-white rounded border border-medium-gray hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value={optionId} id={optionId} />
                            <Label htmlFor={optionId} className="flex-1 cursor-pointer">{option.text}</Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                 </div>
            )}
        </div>
    );
}


export default function LessonContent({
    lesson,
    allLessons,
    currentQuizIdToShow,
    onSimulateUserMessage, // Use new prop
    onLessonComplete
}: LessonContentProps) {

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [listAnswers, setListAnswers] = useState<{ [key: string]: string }>({}); // State for list answers
  const [tableAnswers, setTableAnswers] = useState<{ [key: string]: string }>({}); // State for table answers
  const [expansionAnswers, setExpansionAnswers] = useState<{ [key: string]: string }>({}); // State for expansion answers
  const quizzes = lesson.quizzes || [];

  // Reset selection when quiz changes
  useEffect(() => {
    setSelectedAnswer(null);
    setListAnswers({});
    setTableAnswers({});
    setExpansionAnswers({}); // Reset expansion answers when quiz changes
  }, [currentQuizIdToShow]);

  const currentQuizIndex = currentQuizIdToShow ? quizzes.findIndex(q => q.id === currentQuizIdToShow) : -1;
  const quizToShow = currentQuizIndex !== -1 ? quizzes[currentQuizIndex] : null;
  const isLastQuiz = currentQuizIndex !== -1 && currentQuizIndex === quizzes.length - 1;
  const hasQuizzes = quizzes.length > 0;

  // Determine Next Button Logic
  let nextButtonText = "";
  let nextButtonAction: (() => void) | null = null;
  let simulateMessage = ""; // Message to simulate

  if (!quizToShow) { // Viewing lesson overview
      if (hasQuizzes) {
          // Lesson has quizzes -> "Start First Activity"
          nextButtonText = "Start First Activity";
          simulateMessage = "next activity"; // Or "start quiz"
          nextButtonAction = () => onSimulateUserMessage(simulateMessage);
      } else {
          // Lesson does NOT have quizzes
          if (lesson.nextLesson) {
              // No quizzes AND there is a next lesson -> "Next Lesson"
              nextButtonText = "Next Lesson";
              simulateMessage = "next lesson";
              nextButtonAction = () => onSimulateUserMessage(simulateMessage);
          }
          // If no quizzes AND no next lesson, nextButtonAction remains null, button doesn't render.
      }
  } else { // Viewing a quiz
      if (!isLastQuiz) {
          nextButtonText = "Next Activity";
          simulateMessage = "next activity"; // Or "next quiz"
          nextButtonAction = () => onSimulateUserMessage(simulateMessage);
      } else if (lesson.nextLesson) {
          nextButtonText = `Next Lesson: ${allLessons.find((l) => l.id === lesson.nextLesson)?.title || ''}`;
          simulateMessage = "next lesson";
          nextButtonAction = () => onSimulateUserMessage(simulateMessage);
      }
  }


  return (
    <div className="max-w-[850px] mx-auto bg-white rounded-lg p-7 shadow-md animate-fadeIn">
      <h2 className="text-primary-dark text-2xl font-semibold mb-6 pb-4 border-b border-medium-gray">
        Lesson {lesson.id.replace("lesson", "")}: {lesson.title}
        {quizToShow && <span className="text-lg font-normal text-gray-600"> - {quizToShow.title}</span>}
      </h2>

      {/* --- Content Rendering Logic --- */}
      {quizToShow ? (
        // If a quiz is active, render the quiz
        renderQuiz(quizToShow, selectedAnswer, setSelectedAnswer, listAnswers, setListAnswers, tableAnswers, setTableAnswers, expansionAnswers, setExpansionAnswers) // Pass all quiz states
      ) : lesson.contentMarkdown ? (
        // If no quiz, render the main lesson Markdown content
        <div className="prose prose-indigo max-w-none dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Handle custom image placeholder syntax: ![Alt text](placeholder:description)
              img: ({ node, ...props }) => {
                if (props.src?.startsWith('placeholder:')) {
                  const description = props.src.substring('placeholder:'.length);
                  return (
                    <span className="block text-center p-4 border border-dashed border-gray-400 rounded my-4 bg-gray-50 dark:bg-gray-800">
                      🖼️ Image Placeholder: {props.alt || description || 'No description provided'}
                    </span>
                  );
                }
                // eslint-disable-next-line @next/next/no-img-element
                return <img {...props} alt={props.alt || ''} />; // Default rendering for other images
              },
              // Optional: Add custom styling or handling for other elements like code blocks
              code({ node, inline, className, children, ...props }: { node?: any; inline?: boolean; className?: string; children?: React.ReactNode }) { // Define type inline
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <div className="my-4 rounded bg-gray-900 dark:bg-black overflow-hidden">
                    <div className="px-4 py-1 bg-gray-700 dark:bg-gray-800 text-xs text-gray-300 font-mono flex justify-between items-center">
                      <span>{match[1]}</span>
                      {/* Add copy button? */}
                    </div>
                    <pre className="p-4 text-sm text-gray-100 overflow-x-auto"><code className={className} {...props}>
                      {children}
                    </code></pre>
                  </div>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {lesson.contentMarkdown}
          </ReactMarkdown>
        </div>
      ) : (
        // Fallback: If no content at all (neither quiz nor lesson markdown)
        <p className="text-gray-500 italic">No content available for this section.</p>
      )}
      {/* --- End Content Rendering Logic --- */}

      {/* Updated Navigation Logic */}
      <div className="flex justify-between mt-8 pt-5 border-t border-medium-gray">
        {/* Previous Button Logic */}
        {lesson.prevLesson || quizToShow ? ( // Show prev button if there's a prev lesson OR if viewing a quiz
          <button
            // Simulate "previous activity" if viewing quiz, "previous lesson" otherwise
            onClick={() => onSimulateUserMessage(quizToShow ? "previous activity" : "previous lesson")}
            className="inline-block px-6 py-2 bg-medium-gray text-dark-gray rounded hover:bg-gray-400 transition-colors"
          >
            &laquo; Previous {/* Simplified text */}
          </button>
        ) : (
          <span></span>
        )}

        {/* Next Button with Context-Aware Logic */}
        {nextButtonAction && (
          <button
            onClick={nextButtonAction}
            className="inline-block px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          >
            {nextButtonText} &raquo;
          </button>
        )}
      </div>
    </div>
  )
}
