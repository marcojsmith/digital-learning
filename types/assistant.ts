export interface AssistantConcept {
  id: string
  title: string
  description: string
  example?: string
  tip?: string
  quiz?: AssistantQuiz
}

export interface AssistantQuiz {
  question: string
  options: {
    id: string
    text: string
    correct: boolean
    explanation: string
  }[]
}

export interface AssistantData {
  lessonId: string
  title: string
  introduction: string
  concepts: AssistantConcept[]
}

