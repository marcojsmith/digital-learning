"use client"

import { useState } from "react"
import type { Lesson } from "@/types"
import { lessons } from "@/data/lessons" // Import lessons data

interface LessonContentProps {
  lesson: Lesson
  onLessonSelect: (lessonId: string) => void
  onLessonComplete: (lessonId: string) => void
}

export default function LessonContent({ lesson, onLessonSelect, onLessonComplete }: LessonContentProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return // Already answered

    setSelectedOption(index)
    setShowFeedback(true)

    if (lesson.quiz?.options[index].correct) {
      onLessonComplete(lesson.id)
    }
  }

  const isCorrect = selectedOption !== null && lesson.quiz?.options[selectedOption]?.correct

  return (
    <div className="max-w-[850px] mx-auto bg-white rounded-lg p-7 shadow-md animate-fadeIn">
      <h2 className="text-primary-dark text-2xl font-semibold mb-6 pb-4 border-b border-medium-gray">
        Lesson {lesson.id.replace("lesson", "")}: {lesson.title}
      </h2>

      <div dangerouslySetInnerHTML={{ __html: lesson.content }} className="lesson-content-html" />

      {lesson.quiz && (
        <div className="bg-light-gray p-6 rounded-lg mt-10 border border-medium-gray">
          <h3 className="mb-5 text-xl text-primary-dark">Quick Quiz</h3>
          <p dangerouslySetInnerHTML={{ __html: lesson.quiz.question }} />

          <ul className="list-none p-0 mb-5">
            {lesson.quiz.options.map((option, index) => (
              <li
                key={index}
                className={`
                  block p-3 my-2 bg-white rounded border border-medium-gray cursor-pointer transition-all
                  ${selectedOption === index && option.correct ? "bg-success border-success-border text-success-text font-medium" : ""}
                  ${selectedOption === index && !option.correct ? "bg-warning border-warning-border text-warning-text font-medium" : ""}
                  ${selectedOption !== null ? "pointer-events-none opacity-70" : "hover:bg-gray-50 hover:border-primary hover:shadow-sm"}
                  relative
                `}
                onClick={() => handleOptionClick(index)}
              >
                {option.text}
                {selectedOption === index && option.correct && (
                  <span className="absolute right-4 text-success-text font-bold">✓</span>
                )}
                {selectedOption === index && !option.correct && (
                  <span className="absolute right-4 text-warning-text font-bold">✗</span>
                )}
              </li>
            ))}
          </ul>

          {showFeedback && (
            <div
              className={`p-3 rounded text-center font-medium ${
                isCorrect
                  ? "bg-success text-success-text border border-success-border"
                  : "bg-warning text-warning-text border border-warning-border"
              }`}
            >
              {isCorrect ? "Correct! Well done!" : "Not quite right. Review the lesson material."}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between mt-8 pt-5 border-t border-medium-gray">
        {lesson.prevLesson ? (
          <button
            onClick={() => onLessonSelect(lesson.prevLesson!)}
            className="inline-block px-6 py-2 bg-medium-gray text-dark-gray rounded hover:bg-gray-400 transition-colors"
          >
            &laquo; Previous: {lessons.find((l) => l.id === lesson.prevLesson)?.title}
          </button>
        ) : (
          <span></span>
        )}

        {lesson.nextLesson && (
          <button
            onClick={() => onLessonSelect(lesson.nextLesson!)}
            className="inline-block px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          >
            Next: {lessons.find((l) => l.id === lesson.nextLesson)?.title} &raquo;
          </button>
        )}
      </div>
    </div>
  )
}

