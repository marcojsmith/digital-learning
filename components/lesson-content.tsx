"use client"

import type React from "react"
import ReactMarkdown, { type Components } from 'react-markdown'
// Removed unstable import: import { type CodeProps } from 'react-markdown/lib/ast-to-react'
import remarkGfm from 'remark-gfm'
import type { Lesson, LessonQuiz, LessonQuizItem } from "@/types" // Added LessonQuizItem

interface LessonContentProps {
  lesson: Lesson
  allLessons: Lesson[] // Keep for nav titles
  currentQuizIdToShow: string | null
  onSimulateUserMessage: (message: string) => void; // New prop
  onLessonComplete: (lessonId: string) => void // Keep for now
  // Removed onNavigateRequest and onShowQuiz
}

// Helper Function to Render Specific Quiz (updated for Markdown)
const renderQuiz = (quiz: LessonQuiz) => {
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
                            <span className="inline-block border-b border-gray-400 min-w-[80px] ml-2"></span>
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
                                    <td className="border border-medium-gray p-2">{row.tenThousands ?? <span className="inline-block border-b border-gray-400 w-8"></span>}</td>
                                    <td className="border border-medium-gray p-2">{row.thousands ?? <span className="inline-block border-b border-gray-400 w-8"></span>}</td>
                                    <td className="border border-medium-gray p-2">{row.hundreds ?? <span className="inline-block border-b border-gray-400 w-8"></span>}</td>
                                    <td className="border border-medium-gray p-2">{row.tens ?? <span className="inline-block border-b border-gray-400 w-8"></span>}</td>
                                    <td className="border border-medium-gray p-2">{row.units ?? <span className="inline-block border-b border-gray-400 w-8"></span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            )}
            {quiz.type === "expansions" && quiz.items && (
                 <ol className="list-decimal list-inside space-y-2">
                    {quiz.items.map(item => (
                        <li key={item.letter}>
                            {item.number} = {item.isExample ? item.expansion : <span className="inline-block border-b border-gray-400 min-w-[200px] ml-2"></span>}
                        </li>
                    ))}
                </ol>
            )}
            {quiz.type === "multiple-choice" && quiz.question && quiz.options && (
                 <div>
                    {quiz.question && <div className="mb-3 prose prose-indigo max-w-none dark:prose-invert"><ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{quiz.question}</ReactMarkdown></div>}
                    <ul className="list-none p-0 mb-5">
                       {quiz.options.map((option, index) => (
                         <li key={index} className="block p-3 my-2 bg-white rounded border border-medium-gray cursor-not-allowed opacity-70">
                            {option.text}
                         </li>
                       ))}
                    </ul>
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

  const quizzes = lesson.quizzes || [];
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
          nextButtonText = "Start First Activity";
          simulateMessage = "next activity"; // Or "start quiz"
          nextButtonAction = () => onSimulateUserMessage(simulateMessage);
      } else if (lesson.nextLesson) {
          nextButtonText = `Next Lesson: ${allLessons.find((l) => l.id === lesson.nextLesson)?.title || ''}`;
          simulateMessage = "next lesson";
          nextButtonAction = () => onSimulateUserMessage(simulateMessage);
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
        renderQuiz(quizToShow)
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
