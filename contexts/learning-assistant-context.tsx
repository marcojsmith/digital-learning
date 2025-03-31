"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import ReactConfetti from 'react-confetti'
import type { Lesson } from "@/types"

interface LearningAssistantContextType {
  isOpen: boolean
  toggleAssistant: () => void
  currentLesson: Lesson | null
  setCurrentLesson: (lesson: Lesson) => void
  completedConcepts: string[]
  markConceptComplete: (conceptId: string) => void
  activeConceptId: string | null
  setActiveConceptId: (id: string | null) => void
  expandedConcepts: string[]
  toggleConceptExpanded: (id: string) => void
  notes: Record<string, string>
  updateNote: (conceptId: string, note: string) => void
}

const LearningAssistantContext = createContext<LearningAssistantContextType | undefined>(undefined)

export function LearningAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [completedConcepts, setCompletedConcepts] = useState<string[]>([])
  const [activeConceptId, setActiveConceptId] = useState<string | null>(null)
  const [expandedConcepts, setExpandedConcepts] = useState<string[]>([])
  const [notes, setNotes] = useState<Record<string, string>>({})

  const [showConfetti, setShowConfetti] = useState(false)
  // Load state from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load assistant state
      const savedIsOpen = localStorage.getItem("learningAssistant.isOpen")
      if (savedIsOpen !== null) {
        setIsOpen(savedIsOpen === "true")
      }

      // Load completed concepts
      const savedCompletedConcepts = localStorage.getItem("learningAssistant.completedConcepts")
      if (savedCompletedConcepts) {
        setCompletedConcepts(JSON.parse(savedCompletedConcepts))
      }

      // Load expanded concepts
      const savedExpandedConcepts = localStorage.getItem("learningAssistant.expandedConcepts")
      if (savedExpandedConcepts) {
        setExpandedConcepts(JSON.parse(savedExpandedConcepts))
      }

      // Load notes
      const savedNotes = localStorage.getItem("learningAssistant.notes")
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes))
      }
    }
  }, [])

  // Save state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("learningAssistant.isOpen", isOpen.toString())
      localStorage.setItem("learningAssistant.completedConcepts", JSON.stringify(completedConcepts))
      localStorage.setItem("learningAssistant.expandedConcepts", JSON.stringify(expandedConcepts))
      localStorage.setItem("learningAssistant.notes", JSON.stringify(notes))
    }
  }, [isOpen, completedConcepts, expandedConcepts, notes])


  // Effect to check for lesson completion and trigger confetti
  useEffect(() => {
    if (currentLesson && currentLesson.concepts.length > 0) {
      const allConceptsComplete = currentLesson.concepts.every((concept) =>
        completedConcepts.includes(concept)
      );
      if (allConceptsComplete) {
        console.log("Lesson complete! Triggering confetti."); // Added for debugging
        setShowConfetti(true);
      }
    }
  }, [completedConcepts, currentLesson]);

  // Effect to hide confetti after a delay
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000); // Hide after 5 seconds
      return () => clearTimeout(timer); // Cleanup timer on unmount or if effect re-runs
    }
  }, [showConfetti]);

  const toggleAssistant = () => setIsOpen((prev) => !prev)

  const markConceptComplete = (conceptId: string) => {
    setCompletedConcepts((prev) => (prev.includes(conceptId) ? prev : [...prev, conceptId]))
  }

  const toggleConceptExpanded = (id: string) => {
    setExpandedConcepts((prev) => (prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]))
  }

  const updateNote = (conceptId: string, note: string) => {
    setNotes((prev) => ({
      ...prev,
      [conceptId]: note,
    }))
  }

  return (
    <LearningAssistantContext.Provider
      value={{
        isOpen,
        toggleAssistant,
        currentLesson,
        setCurrentLesson,
        completedConcepts,
        markConceptComplete,
        activeConceptId,
        setActiveConceptId,
        expandedConcepts,
        toggleConceptExpanded,
        notes,
        updateNote,
      }}
    >
      {children}
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={200} />}
    </LearningAssistantContext.Provider>
  )
}


