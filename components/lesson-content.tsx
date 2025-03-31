"use client"

import type React from "react"
import type { Lesson, LessonQuiz } from "@/types"

interface LessonContentProps {
  lesson: Lesson
  allLessons: Lesson[] // Keep for nav titles
  currentQuizIdToShow: string | null
  onSimulateUserMessage: (message: string) => void; // New prop
  onLessonComplete: (lessonId: string) => void // Keep for now
  // Removed onNavigateRequest and onShowQuiz
}

// Helper Function to Render Specific Quiz (remains the same)
const renderQuiz = (quiz: LessonQuiz) => {
    // ... (renderQuiz implementation remains unchanged)
    return (
        <div className="bg-light-gray p-6 rounded-lg mt-6 border border-medium-gray">
            <h3 className="mb-4 text-xl text-primary-dark font-medium">{quiz.title}</h3>
            {quiz.type === "list" && quiz.items && (
                <ol className="list-decimal list-inside space-y-2">
                    {quiz.items.map(item => (
                        <li key={item.letter}>
                            {item.question}
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
                    <p className="mb-3" dangerouslySetInnerHTML={{ __html: quiz.question }} />
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

      {quizToShow ? (
        renderQuiz(quizToShow)
      ) : (
        <div
            className="prose max-w-none lesson-description-html"
            dangerouslySetInnerHTML={{ __html: lesson.description }}
        />
      )}

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
