"use client"

import type React from "react"
import type { Lesson, LessonQuiz } from "@/types"

interface LessonContentProps {
  lesson: Lesson
  allLessons: Lesson[]
  currentQuizIdToShow: string | null
  onNavigateRequest: (direction: 'prev' | 'next') => void; // For prev/next LESSON
  onShowQuiz: (lessonId: string, quizId: string) => void; // For showing specific quiz within lesson
  onLessonComplete: (lessonId: string) => void
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
    onNavigateRequest,
    onShowQuiz, // Added prop
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

  if (!quizToShow) { // Viewing lesson overview
      if (hasQuizzes) {
          nextButtonText = "Start First Activity";
          nextButtonAction = () => onShowQuiz(lesson.id, quizzes[0].id);
      } else if (lesson.nextLesson) {
          nextButtonText = `Next Lesson: ${allLessons.find((l) => l.id === lesson.nextLesson)?.title || ''}`;
          nextButtonAction = () => onNavigateRequest('next');
      }
  } else { // Viewing a quiz
      if (!isLastQuiz) {
          nextButtonText = "Next Activity";
          nextButtonAction = () => onShowQuiz(lesson.id, quizzes[currentQuizIndex + 1].id);
      } else if (lesson.nextLesson) {
          nextButtonText = `Next Lesson: ${allLessons.find((l) => l.id === lesson.nextLesson)?.title || ''}`;
          nextButtonAction = () => onNavigateRequest('next');
      }
  }


  return (
    <div className="max-w-[850px] mx-auto bg-white rounded-lg p-7 shadow-md animate-fadeIn">
      <h2 className="text-primary-dark text-2xl font-semibold mb-6 pb-4 border-b border-medium-gray">
        Lesson {lesson.id.replace("lesson", "")}: {lesson.title}
        {quizToShow && <span className="text-lg font-normal text-gray-600"> - {quizToShow.title}</span>} {/* Show quiz title */}
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
        {/* Previous Button Logic (Simplified: always goes to previous lesson overview for now) */}
        {lesson.prevLesson ? (
          <button
            onClick={() => onNavigateRequest('prev')} // Could be enhanced to go to prev quiz/overview
            className="inline-block px-6 py-2 bg-medium-gray text-dark-gray rounded hover:bg-gray-400 transition-colors"
          >
            &laquo; Previous: {allLessons.find((l) => l.id === lesson.prevLesson)?.title}
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
