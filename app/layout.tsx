import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { LearningAssistantProvider } from "@/contexts/learning-assistant-context"

/**
 * Metadata for the application.
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export const metadata: Metadata = {
  title: "Enhanced Learning Platform",
  description: "A digital learning platform for students",
}

export default function RootLayout({
/**
 * The root layout component for the application.
 *
 * Wraps the entire application with necessary providers and base HTML structure.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child elements to render within the layout.
 * @returns {JSX.Element} The root layout structure.
 */
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