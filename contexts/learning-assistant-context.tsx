"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import ReactConfetti from 'react-confetti';
import type { Lesson } from "@/types";

// Constants for localStorage keys
const LOCAL_STORAGE_PREFIX = "learningAssistant";
const IS_OPEN_KEY = `${LOCAL_STORAGE_PREFIX}.isOpen`;
const COMPLETED_CONCEPTS_KEY = `${LOCAL_STORAGE_PREFIX}.completedConcepts`;
const EXPANDED_CONCEPTS_KEY = `${LOCAL_STORAGE_PREFIX}.expandedConcepts`;
const NOTES_KEY = `${LOCAL_STORAGE_PREFIX}.notes`;

// Constants for UI behavior
const CONFETTI_DURATION_MS = 5000; // 5 seconds

/**
 * Defines the shape of the Learning Assistant context data and actions.
 */
interface LearningAssistantContextType {
  isOpen: boolean
  /** Toggles the visibility of the learning assistant sidebar. */
  toggleAssistant: () => void;
  currentLesson: Lesson | null
  /** Sets the currently active lesson. */
  setCurrentLesson: (lesson: Lesson | null) => void; // Allow setting to null
  completedConcepts: string[]
  /** Marks a specific concept within the current lesson as completed. */
  markConceptComplete: (conceptId: string) => void;
  activeConceptId: string | null
  /** Sets the currently active/focused concept ID. */
  setActiveConceptId: (id: string | null) => void;
  expandedConcepts: string[]
  /** Toggles the expanded/collapsed state of a specific concept. */
  toggleConceptExpanded: (id: string) => void;
  notes: Record<string, string>
  /** Updates the user's note for a specific concept. */
  updateNote: (conceptId: string, note: string) => void;
}

/**
 * React Context for managing the state and actions of the Learning Assistant feature.
 * Provides lesson progress tracking, concept management, notes, and UI state.
 */
const LearningAssistantContext = createContext<LearningAssistantContextType | undefined>(undefined);

/**
 * Provider component for the Learning Assistant Context.
 * Manages the state persistence (localStorage) and provides context value to children.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The child components to wrap.
 */
export function LearningAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentLesson, setCurrentLessonInternal] = useState<Lesson | null>(null); // Renamed internal setter
  const [completedConcepts, setCompletedConcepts] = useState<string[]>([]);
  const [activeConceptId, setActiveConceptId] = useState<string | null>(null);
  const [expandedConcepts, setExpandedConcepts] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  // Load state from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load assistant state
      const savedIsOpen = localStorage.getItem(IS_OPEN_KEY);
      if (savedIsOpen !== null) {
        setIsOpen(savedIsOpen === "true");
      }

      // Load completed concepts
      const savedCompletedConcepts = localStorage.getItem(COMPLETED_CONCEPTS_KEY);
      if (savedCompletedConcepts) {
        setCompletedConcepts(JSON.parse(savedCompletedConcepts));
      }

      // Load expanded concepts
      const savedExpandedConcepts = localStorage.getItem(EXPANDED_CONCEPTS_KEY);
      if (savedExpandedConcepts) {
        setExpandedConcepts(JSON.parse(savedExpandedConcepts));
      }

      // Load notes
      const savedNotes = localStorage.getItem(NOTES_KEY);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(IS_OPEN_KEY, isOpen.toString());
      localStorage.setItem(COMPLETED_CONCEPTS_KEY, JSON.stringify(completedConcepts));
      localStorage.setItem(EXPANDED_CONCEPTS_KEY, JSON.stringify(expandedConcepts));
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    }
  }, [isOpen, completedConcepts, expandedConcepts, notes]);


  // Effect to check for lesson completion and trigger confetti
  useEffect(() => {
    if (currentLesson && currentLesson.concepts.length > 0) {
      const allConceptsComplete = currentLesson.concepts.every((concept) =>
        completedConcepts.includes(concept) // concept is already the ID string
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
      }, CONFETTI_DURATION_MS); // Use constant
      return () => clearTimeout(timer); // Cleanup timer on unmount or if effect re-runs
    }
  }, [showConfetti]);

  // Memoize context actions using useCallback to prevent unnecessary re-renders
  const toggleAssistant = useCallback(() => setIsOpen((prev) => !prev), []);

  const markConceptComplete = useCallback((conceptId: string) => {
    setCompletedConcepts((prev) => (prev.includes(conceptId) ? prev : [...prev, conceptId]));
  }, []);

  const toggleConceptExpanded = useCallback((id: string) => {
    setExpandedConcepts((prev) => (prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]));
  }, []);

  const updateNote = useCallback((conceptId: string, note: string) => {
    setNotes((prev) => ({
      ...prev,
      [conceptId]: note,
    }));
  }, []);

  // Renamed internal setter, provide stable setCurrentLesson function
  const setCurrentLesson = useCallback((lesson: Lesson | null) => {
      setCurrentLessonInternal(lesson);
      // Optionally reset related state when lesson changes
      // setActiveConceptId(null);
      // setCompletedConcepts([]); // Decide if progress should reset
  }, []);

  return (
    <LearningAssistantContext.Provider
      value={{
        isOpen,
        toggleAssistant,
        currentLesson,
        setCurrentLesson, // Use the stable callback version
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

/**
 * Custom hook to consume the LearningAssistantContext.
 * Provides a convenient way to access the context values and actions.
 * Throws an error if used outside of a LearningAssistantProvider.
 * @returns {LearningAssistantContextType} The context value.
 */
export const useLearningAssistant = (): LearningAssistantContextType => {
  const context = useContext(LearningAssistantContext);
  if (context === undefined) {
    throw new Error("useLearningAssistant must be used within a LearningAssistantProvider");
  }
  return context;
};


