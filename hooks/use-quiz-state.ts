"use client"

import { useState, useEffect } from "react"
import type { Lesson } from "@/types"

export function useQuizState(lesson: Lesson) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  // Reset state when lesson changes
  useEffect(() => {
    setSelectedOption(null)
    setShowFeedback(false)
    setIsCorrect(false)
  }, [lesson.id])

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return false // Already answered

    setSelectedOption(index)
    setShowFeedback(true)

    const correct = lesson.quiz?.options[index]?.correct || false
    setIsCorrect(correct)

    return correct
  }

  return {
    selectedOption,
    showFeedback,
    isCorrect,
    handleOptionSelect,
  }
}

