"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { ChatMessage } from "@/types"
import { Send, Mic, ChevronUp, HelpCircle } from "lucide-react"

export default function Chat({ currentLessonId }: { currentLessonId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: "Hello! I'm your learning assistant. Ask me about the lessons!", type: "ai" },
  ])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: ChatMessage = { text: inputValue, type: "user" }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Show typing indicator
    const typingMessage: ChatMessage = { text: "Assistant is typing...", type: "typing" }
    setMessages((prev) => [...prev, typingMessage])

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => prev.filter((msg) => msg.type !== "typing"))

      const lowerMessage = inputValue.toLowerCase()
      let response = "I can help with questions about the current lessons. Could you be more specific?"

      // Simple keyword matching based on current lesson
      if (currentLessonId === "lesson1" || lowerMessage.includes("add") || lowerMessage.includes("sum")) {
        response =
          "Addition involves combining numbers. For instance, 2 (addend) + 3 (addend) = 5 (sum). Do you have a specific addition question?"
      } else if (currentLessonId === "lesson2" || lowerMessage.includes("subtract") || lowerMessage.includes("minus")) {
        response =
          "Subtraction finds the difference between numbers, like 5 (minuend) - 2 (subtrahend) = 3 (difference). What would you like to know about subtraction?"
      } else if (currentLessonId === "lesson3" || lowerMessage.includes("plant")) {
        response =
          "Plants typically make their food using photosynthesis with sunlight, water, and CO2. They have roots, stems, and leaves. What about plants interests you?"
      } else if (currentLessonId === "lesson4" || lowerMessage.includes("animal")) {
        response =
          "Animals belong to the Animalia kingdom and get energy by eating other organisms. They are very diverse! Any specific animal group you want to discuss?"
      } else if (currentLessonId === "lesson5" || lowerMessage.includes("multiply")) {
        response = "Multiplication is repeated addition. 3 (factor) x 4 (factor) = 12 (product). Ask me more!"
      } else if (currentLessonId === "lesson6" || lowerMessage.includes("divide")) {
        response =
          "Division splits a number into equal parts. 12 (dividend) ÷ 4 (divisor) = 3 (quotient). Any division concepts you're curious about?"
      } else if (lowerMessage.includes("help")) {
        response = `I can help with the current lesson. Try asking about addition, subtraction, plants, animals, or other topics covered!`
      } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
        response = "Hello there! Ready to learn? Ask me anything about the lessons."
      }

      const aiMessage: ChatMessage = { text: response, type: "ai" }
      setMessages((prev) => [...prev, aiMessage])
    }, 1500)
  }

  return (
    <div
      className={`fixed bottom-0 right-6 w-[360px] max-w-[calc(100%-50px)] bg-white rounded-t-lg shadow-lg z-50 transition-transform duration-300 ${
        isOpen ? "transform-none" : "transform translate-y-[calc(100%-48px)]"
      }`}
    >
      <div
        className="bg-primary-dark text-white p-3 rounded-t-lg flex justify-between items-center cursor-pointer h-12"
        onClick={toggleChat}
      >
        <h3 className="text-base font-medium flex items-center">
          <HelpCircle className="mr-2 opacity-90" size={18} />
          Learning Assistant
        </h3>
        <button
          className={`bg-transparent border-none text-white text-xl cursor-pointer transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-label="Toggle Chat Window"
        >
          <ChevronUp size={20} />
        </button>
      </div>

      <div className="h-[350px] flex flex-col">
        <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-2 bg-light-gray">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${
                message.type === "user"
                  ? "bg-user-msg text-[#0c5460] self-end rounded-br-sm"
                  : message.type === "typing"
                    ? "bg-transparent text-gray-500 italic self-start border-none shadow-none"
                    : "bg-ai-msg text-dark-gray self-start rounded-bl-sm border border-medium-gray"
              }`}
            >
              {message.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex p-3 border-t border-medium-gray bg-white gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question..."
            className="flex-grow p-2 border border-medium-gray rounded-full outline-none focus:border-primary text-sm"
          />
          <button
            type="submit"
            className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors"
          >
            <Send size={16} />
          </button>
          <button
            type="button"
            className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors"
          >
            <Mic size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}

