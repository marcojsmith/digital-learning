"use client"

import { useState } from "react"
import type { AssistantConcept } from "@/types/assistant"
import { useLearningAssistant } from "@/contexts/learning-assistant-context"
import { ChevronDown, Check, Pencil, X, LightbulbIcon } from "lucide-react"

interface ConceptProps {
  concept: AssistantConcept
}

export default function Concept({ concept }: ConceptProps) {
  const { completedConcepts, markConceptComplete, expandedConcepts, toggleConceptExpanded, notes, updateNote } =
    useLearningAssistant()

  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [noteText, setNoteText] = useState(notes[concept.id] || "")

  const isCompleted = completedConcepts.includes(concept.id)
  const isExpanded = expandedConcepts.includes(concept.id)

  const handleToggle = () => {
    toggleConceptExpanded(concept.id)
  }

  const handleOptionSelect = (optionId: string) => {
    if (selectedOption !== null) return
    setSelectedOption(optionId)
    setShowAnswer(true)

    // If the selected option is correct, mark the concept as completed
    if (concept.quiz?.options.find((o) => o.id === optionId)?.correct) {
      markConceptComplete(concept.id)
    }
  }

  const handleContinueClick = () => {
    markConceptComplete(concept.id)
  }

  const handleSaveNote = () => {
    updateNote(concept.id, noteText)
    setIsEditing(false)
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${isCompleted ? "border-green-200" : "border-gray-200"}`}>
      {/* Header */}
      <div
        className={`p-3 flex justify-between items-center cursor-pointer ${isCompleted ? "bg-green-50" : "bg-gray-50"}`}
        onClick={handleToggle}
      >
        <div className="flex items-center">
          {isCompleted && (
            <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center mr-2">
              <Check size={12} />
            </div>
          )}
          <h5 className="font-medium">{concept.title}</h5>
        </div>
        <ChevronDown className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} size={18} />
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-100">
          <p className="text-gray-700 mb-3">{concept.description}</p>

          {/* Example */}
          {concept.example && (
            <div className="bg-gray-50 p-3 rounded-md mb-3 text-sm font-mono whitespace-pre-line">
              {concept.example}
            </div>
          )}

          {/* Tip */}
          {concept.tip && (
            <div className="bg-blue-50 p-3 rounded-md mb-3 text-sm flex">
              <LightbulbIcon className="text-blue-500 mr-2 flex-shrink-0" size={18} />
              <span>{concept.tip}</span>
            </div>
          )}

          {/* Notes */}
          <div className="mt-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h6 className="text-sm font-medium text-gray-600">My Notes</h6>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-primary">
                  <Pencil size={14} />
                </button>
              ) : (
                <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-red-500">
                  <X size={14} />
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="mt-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSaveNote}
                    className="px-3 py-1 bg-primary text-white text-xs rounded-md hover:bg-primary-dark"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-3 rounded-md text-sm min-h-[40px]">
                {notes[concept.id] || <span className="text-gray-400 italic">Add notes about this concept...</span>}
              </div>
            )}
          </div>

          {/* Quiz */}
          {concept.quiz && (
            <div className="mt-4 bg-purple-50 p-3 rounded-md">
              <h6 className="font-medium mb-2 text-purple-800">Quick Check</h6>
              <p className="mb-3 text-sm">{concept.quiz.question}</p>

              <div className="space-y-2 mb-3">
                {concept.quiz.options.map((option) => {
                  const isSelected = selectedOption === option.id
                  const isCorrect = option.correct
                  let className = "p-2 border rounded-md text-sm cursor-pointer"

                  if (isSelected) {
                    className += isCorrect ? " bg-green-100 border-green-300" : " bg-red-100 border-red-300"
                  } else if (showAnswer && isCorrect) {
                    className += " bg-green-50 border-green-200"
                  } else {
                    className += " bg-white border-gray-200 hover:border-gray-300"
                  }

                  if (showAnswer) {
                    className += " cursor-default"
                  }

                  return (
                    <div
                      key={option.id}
                      className={className}
                      onClick={() => (showAnswer ? null : handleOptionSelect(option.id))}
                    >
                      {option.text}
                      {showAnswer && isSelected && <div className="mt-1 text-xs italic">{option.explanation}</div>}
                    </div>
                  )
                })}
              </div>

              {!isCompleted && !showAnswer && (
                <div className="mt-2 text-xs text-gray-500 italic">Select an answer to check your understanding</div>
              )}
            </div>
          )}

          {/* Continue Button - only show if not completed and no quiz */}
          {!isCompleted && !concept.quiz && (
            <button
              onClick={handleContinueClick}
              className="mt-3 w-full py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Mark as Understood
            </button>
          )}
        </div>
      )}
    </div>
  )
}

