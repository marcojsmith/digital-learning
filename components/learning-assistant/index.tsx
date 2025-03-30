"use client"

import { useState, useEffect } from "react"
import { useLearningAssistant } from "@/contexts/learning-assistant-context"
import type { AssistantData } from "@/types/assistant"
import { assistantData } from "@/data/assistant-data"
import Concept from "./concept"
import { BookOpen, X, LightbulbIcon } from "lucide-react"

export default function LearningAssistant() {
  const { isOpen, toggleAssistant, currentLesson, completedConcepts } = useLearningAssistant()

  const [assistantContent, setAssistantContent] = useState<AssistantData | null>(null)
  const [progress, setProgress] = useState(0)

  // Update assistant content when lesson changes
  useEffect(() => {
    if (currentLesson) {
      const content = assistantData.find((data) => data.lessonId === currentLesson.id)
      setAssistantContent(content || null)
    }
  }, [currentLesson])

  // Calculate progress
  useEffect(() => {
    if (assistantContent) {
      const conceptIds = assistantContent.concepts.map((c) => c.id)
      const completedCount = conceptIds.filter((id) => completedConcepts.includes(id)).length
      setProgress(conceptIds.length > 0 ? (completedCount / conceptIds.length) * 100 : 0)
    }
  }, [assistantContent, completedConcepts])

  if (!assistantContent || !currentLesson) {
    return null
  }

  // Width and transition for the sidebar
  const sidebarWidth = 360
  const sidebarStyle = {
    width: `${sidebarWidth}px`,
    transform: isOpen ? "translateX(0)" : `translateX(${sidebarWidth}px)`,
    transition: "transform 0.3s ease-in-out",
  }

  // Handle button position when sidebar is closed
  const buttonStyle = {
    position: "absolute" as const,
    left: isOpen ? "12px" : "-48px",
    transition: "left 0.3s ease-in-out",
  }

  return (
    <div
      className="fixed top-[74px] right-0 h-[calc(100vh-74px)] bg-white shadow-md z-40 flex flex-col"
      style={sidebarStyle}
    >
      {/* Header */}
      <div className="bg-primary-dark text-white p-4 flex justify-between items-center relative">
        <button
          onClick={toggleAssistant}
          className="text-white bg-primary-dark rounded-full w-10 h-10 flex items-center justify-center absolute top-4"
          style={buttonStyle}
          aria-label={isOpen ? "Close assistant" : "Open assistant"}
        >
          {isOpen ? <X size={20} /> : <BookOpen size={20} />}
        </button>

        <div className="ml-6">
          <h3 className="text-lg font-medium flex items-center">
            <LightbulbIcon className="mr-2" size={18} />
            Learning Assistant
          </h3>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-gray-200 h-2">
        <div className="bg-primary h-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-primary-dark mb-2">{assistantContent.title}</h4>
          <p className="text-gray-700">{assistantContent.introduction}</p>
        </div>

        {/* Concepts */}
        <div className="space-y-4">
          {assistantContent.concepts.map((concept) => (
            <Concept key={concept.id} concept={concept} />
          ))}
        </div>
      </div>
    </div>
  )
}

