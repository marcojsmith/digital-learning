import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { LearningAssistantProvider } from "@/contexts/learning-assistant-context"

export const metadata: Metadata = {
  title: "Enhanced Learning Platform",
  description: "A digital learning platform for students",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <LearningAssistantProvider>{children}</LearningAssistantProvider>
      </body>
    </html>
  )
}



import './globals.css'