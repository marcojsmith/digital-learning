export interface Lesson {
  id: string
  title: string
  content: string
  subject: string
  progress: "completed" | "in-progress" | "not-started"
  quiz?: Quiz
  nextLesson?: string
  prevLesson?: string
}

export interface Quiz {
  question: string
  options: {
    text: string
    correct: boolean
  }[]
}

export interface Subject {
  id: string
  name: string
  icon: string
  lessons: string[] // Lesson IDs
}

export interface User {
  name: string
  avatar: string
}

export interface ChatMessage {
  text: string
  type: "user" | "ai" | "typing"
}

