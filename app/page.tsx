"use client"

import { useState, useEffect } from "react"
import { useMobile } from "@/hooks/use-mobile"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import LessonContent from "@/components/lesson-content"
import LearningAssistant from "@/components/learning-assistant"
import { useLearningAssistant } from "@/contexts/learning-assistant-context"
import { subjects, lessons } from "@/data/lessons"
import { Menu } from "lucide-react"

export default function Home() {
  const [currentLessonId, setCurrentLessonId] = useState("lesson1")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [updatedLessons, setUpdatedLessons] = useState(lessons)
  const isMobile = useMobile()

  // Get learning assistant context
  const { setCurrentLesson } = useLearningAssistant()

  // Initialize from URL hash if present
  useEffect(() => {
    const hash = window.location.hash.substring(1)
    if (hash && lessons.some((lesson) => lesson.id === hash)) {
      setCurrentLessonId(hash)
    }
  }, [])

  // Update URL hash when lesson changes
  useEffect(() => {
    window.location.hash = `#${currentLessonId}`
  }, [currentLessonId])

  // Update learning assistant when lesson changes
  useEffect(() => {
    const currentLesson = updatedLessons.find((lesson) => lesson.id === currentLessonId)
    if (currentLesson) {
      setCurrentLesson(currentLesson)
    }
  }, [currentLessonId, updatedLessons, setCurrentLesson])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
    if (!sidebarOpen) {
      document.body.classList.add("sidebar-open")
    } else {
      document.body.classList.remove("sidebar-open")
    }
  }

  const handleLessonSelect = (lessonId: string) => {
    setCurrentLessonId(lessonId)
    window.scrollTo(0, 0)
  }

  const handleLessonComplete = (lessonId: string) => {
    setUpdatedLessons((prev) =>
      prev.map((lesson) => (lesson.id === lessonId ? { ...lesson, progress: "completed" as const } : lesson)),
    )
  }

  const currentLesson = updatedLessons.find((lesson) => lesson.id === currentLessonId) || updatedLessons[0]

  return (
    <>
      <Header user={{ name: "Student Name", avatar: "S" }} />

      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed z-[1100] top-20 left-4 w-11 h-11 bg-primary text-white border-none rounded-full shadow-md flex items-center justify-center text-2xl"
          aria-label="Toggle Menu"
        >
          <Menu size={24} />
        </button>
      )}

      <div className={`flex min-h-[calc(100vh-74px)] ${isMobile ? "flex-col" : ""}`}>
        <Sidebar
          subjects={subjects}
          lessons={updatedLessons}
          currentLessonId={currentLessonId}
          onLessonSelect={handleLessonSelect}
          isMobile={isMobile}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />

        <main
          className="flex-grow p-10 transition-all"
          role="main"
          style={{
            paddingRight: isMobile ? "10px" : "370px", // Add padding to make room for the assistant
          }}
        >
          <LessonContent
            key={currentLessonId}
            lesson={currentLesson}
            onLessonSelect={handleLessonSelect}
            onLessonComplete={handleLessonComplete}
          />
        </main>

        {/* Learning Assistant Sidebar */}
        <LearningAssistant />
      </div>

      {/* Overlay for mobile sidebar */}
      {isMobile && sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleSidebar} />}
    </>
  )
}

