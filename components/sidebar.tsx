"use client"

import { useState } from "react"
import type { Subject, Lesson } from "@/types"
import { ChevronDown } from "lucide-react"

interface SidebarProps {
  subjects: Subject[]
  lessons: Lesson[]
  currentLessonId: string | null // Allow null for initial state
  onLessonSelect: (lessonId: string) => void
  isMobile: boolean
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({
  subjects,
  lessons,
  currentLessonId,
  onLessonSelect,
  isMobile,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [collapsedSubjects, setCollapsedSubjects] = useState<string[]>([])

  const toggleSubject = (subjectId: string) => {
    setCollapsedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId],
    )
  }

  const handleLessonClick = (lessonId: string) => {
    onLessonSelect(lessonId)
    if (isMobile && isOpen) {
      onToggle()
    }
  }

  const sidebarClasses = `
    bg-white shadow-md overflow-y-auto transition-all duration-300
    ${
      isMobile
        ? `fixed top-0 h-full z-50 w-[280px] ${isOpen ? "left-0" : "-left-[300px]"}`
        : "w-[280px] sticky top-[74px] h-[calc(100vh-74px)] flex-shrink-0"
    }
  `

  return (
    <nav id="sidebar" role="navigation" aria-label="Course Navigation" className={sidebarClasses}>
      <h3 className="mx-5 mb-4 pb-4 border-b border-medium-gray text-lg text-primary-dark">My Courses</h3>
      <ul>
        {subjects.map((subject) => (
          <li key={subject.id}>
            <div
              className={`subject mx-5 my-2 py-1 font-semibold text-primary-dark flex items-center justify-between cursor-pointer ${
                collapsedSubjects.includes(subject.id) ? "collapsed" : ""
              }`}
              onClick={() => toggleSubject(subject.id)}
            >
              <span className="flex items-center">
                <span className="subject-icon mr-2 opacity-70">{subject.icon}</span> {subject.name}
              </span>
              <ChevronDown
                className={`transition-transform duration-200 ${
                  collapsedSubjects.includes(subject.id) ? "-rotate-90" : ""
                }`}
                size={16}
              />
            </div>
            <ul
              className={`lesson-list pl-5 max-h-[1000px] overflow-hidden transition-all duration-300 ${
                collapsedSubjects.includes(subject.id) ? "max-h-0" : ""
              }`}
            >
              {subject.lessons.map((lessonId) => {
                const lesson = lessons.find((l) => l.id === lessonId)
                if (!lesson) return null

                return (
                  <li key={lessonId} className="lesson">
                    <a
                      href={`#${lessonId}`}
                      className={`flex items-center justify-between py-2 px-5 pl-9 text-dark-gray hover:bg-light-gray hover:text-primary hover:border-l-secondary border-l-3 border-transparent transition-all ${
                        currentLessonId === lessonId ? "bg-primary text-white border-l-secondary font-medium" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault()
                        handleLessonClick(lessonId)
                      }}
                    >
                      {lesson.title}
                      <span
                        className={`inline-block w-3 h-3 rounded-full ml-2 flex-shrink-0 border border-opacity-10 ${
                          lesson.progress === "completed"
                            ? "bg-primary"
                            : lesson.progress === "in-progress"
                              ? "bg-secondary"
                              : "bg-medium-gray"
                        } ${currentLessonId === lessonId ? "border-white" : ""}`}
                      ></span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  )
}

