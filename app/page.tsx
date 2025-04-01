"use client"

import { useState, useEffect } from "react"
import { useMobile } from "@/hooks/use-mobile"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import LessonContent from "@/components/lesson-content"
import Chat from "@/components/chat"
import { Menu } from "lucide-react"
import { getSubjects, getLessons } from "@/lib/data-service"
import type { Subject, Lesson, ChatAction } from "@/types"

/**
 * The main page component for the Digital Learning Platform.
 * Manages the overall layout, data fetching, and state for lesson display,
 * quiz interaction, sidebar visibility, and chat communication.
 *
 * @returns {JSX.Element} The rendered home page.
 */
export default function Home() {
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [currentQuizIdToShow, setCurrentQuizIdToShow] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [subjectsData, setSubjectsData] = useState<Subject[]>([]);
  const [lessonsData, setLessonsData] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulatedMessageToSend, setSimulatedMessageToSend] = useState<{ text: string; id: number } | null>(null);
  const [generatedLessonContent, setGeneratedLessonContent] = useState<string | null>(null);

  const isMobile = useMobile()

  /**
   * Fetches initial subject and lesson data on component mount.
   */
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [subjectsRes, lessonsRes] = await Promise.all([
            getSubjects(),
            getLessons()
        ]);
        setSubjectsData(subjectsRes);
        setLessonsData(lessonsRes);
        setCurrentQuizIdToShow(null);
      } catch (err) {
        console.error("Failed to load lesson data:", err);
        setError("Failed to load learning materials. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  /**
   * Updates the URL hash when the current lesson changes.
   */
  useEffect(() => {
    if (!isLoading && currentLessonId && lessonsData.some(l => l.id === currentLessonId)) {
         window.location.hash = `#${currentLessonId}`;
    } else if (!isLoading && !currentLessonId) {
        // Clear hash if no lesson selected (optional: could use history API)
    }
  }, [currentLessonId, isLoading, lessonsData]);

  /**
   * Toggles the visibility of the sidebar, especially on mobile.
   * Adds/removes a class to the body for potential global styling adjustments.
   */
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
    if (!sidebarOpen) {
      document.body.classList.add("sidebar-open")
    } else {
      document.body.classList.remove("sidebar-open")
    }
  }

  /**
   * Handles the selection of a lesson from the sidebar.
   * Triggers a chat action to show the lesson overview and scrolls to the top.
   * Closes the sidebar on mobile if it was open.
   *
   * @param {string} lessonId - The ID of the selected lesson.
   */
  const handleLessonSelect = (lessonId: string) => {
    if (lessonsData.some(l => l.id === lessonId)) {
        handleChatAction({ actionType: 'showLessonOverview', lessonId: lessonId, quizId: null });
        window.scrollTo(0, 0)
        if (isMobile && sidebarOpen) {
            toggleSidebar();
        }
    }
  }

  /**
   * Marks a lesson as completed in the local state.
   *
   * @param {string} lessonId - The ID of the lesson to mark as complete.
   */
  const handleLessonComplete = (lessonId: string) => {
    setLessonsData((prev) =>
      prev.map((lesson) => (lesson.id === lessonId ? { ...lesson, progress: "completed" as const } : lesson)),
    )
    setCurrentQuizIdToShow(null); // Ensure no quiz is shown after completion
  }

  /**
   * Processes actions received from the Chat component.
   * Updates the page state based on the action type (e.g., showing lessons, quizzes, generated content).
   *
   * @param {ChatAction} action - The action object received from the chat.
   */
  const handleChatAction = (action: ChatAction) => {
    console.log("Chat Action Received in page.tsx:", action);
    switch (action.actionType) {
        case "showLessonOverview":
            if (action.lessonId && lessonsData.some(l => l.id === action.lessonId)) {
                setCurrentLessonId(action.lessonId);
                setGeneratedLessonContent(null);
                setCurrentQuizIdToShow(null);
            } else {
                 console.warn("showLessonOverview action received without valid lessonId", { action });
            }
            break;
        case "showQuiz":
            if (action.lessonId && action.quizId) {
                const targetLesson = lessonsData.find(l => l.id === action.lessonId);
                if (targetLesson && targetLesson.quizzes.some(q => q.id === action.quizId)) {
                    if (currentLessonId !== action.lessonId) {
                        setCurrentLessonId(action.lessonId);
                    }
                    setGeneratedLessonContent(null);
                    setCurrentQuizIdToShow(action.quizId);
                } else {
                    console.warn(`Attempted to show non-existent quiz: ${action.lessonId}/${action.quizId}`, { action });
                }
            } else {
                 console.warn("showQuiz action received without valid lessonId or quizId", { action });
            }
            break;
        case "completeLesson":
             if (action.lessonId) {
                handleLessonComplete(action.lessonId);
             } else {
                  console.warn("completeLesson action received without valid lessonId", { action });
             }
            break;
        case "returnToLessonOverview":
            if (action.lessonId && lessonsData.some(l => l.id === action.lessonId)) {
                 if (currentLessonId !== action.lessonId) {
                    setCurrentLessonId(action.lessonId);
                 }
                 setGeneratedLessonContent(null);
                 setCurrentQuizIdToShow(null);
            } else {
                 console.warn("returnToLessonOverview action received without valid lessonId", { action });
            }
            break;
        case "generateFullLesson":
            console.log("[generateFullLesson] Received action:", JSON.stringify(action, null, 2));
            if (action.lessonMarkdownContent) {
                console.log("[generateFullLesson] lessonMarkdownContent received (snippet):", action.lessonMarkdownContent.substring(0, 100) + '...');
                setGeneratedLessonContent(action.lessonMarkdownContent);
                setCurrentLessonId(null);
                setCurrentQuizIdToShow(null);
                console.log("[generateFullLesson] Stored generated content and cleared currentLessonId.");
            } else {
                 console.warn("[generateFullLesson] Failed: lessonMarkdownContent is missing.", { action });
            }
            break;
        default:
             console.log("Unhandled chat action type:", action.actionType, { action });
             }
    }

  /**
   * Sets the state to trigger sending a simulated user message via the Chat component.
   *
   * @param {string} message - The message text to simulate.
   */
  const handleSimulateUserMessage = (message: string) => {
      console.log(`Queueing simulated message: "${message}"`);
      setSimulatedMessageToSend({ text: message, id: Date.now() }); // Use timestamp as unique ID
  };

  /**
   * Clears the simulated message state, typically called by the Chat component
   * after it has processed the message.
   */
  const handleSimulatedMessageProcessed = () => {
      console.log("Simulated message processed, clearing state.");
      setSimulatedMessageToSend(null);
  };

  const currentLesson = currentLessonId ? lessonsData.find((lesson) => lesson.id === currentLessonId) : null;

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-600">{error}</div>;
  }

  /**
   * Extracts the main title (H1) from a Markdown string.
   *
   * @param {string} markdown - The Markdown content.
   * @returns {string} The extracted title or a default fallback.
   */
  const extractTitleFromMarkdown = (markdown: string): string => {
    const lines = markdown.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('# ')) {
        return trimmedLine.substring(2).trim();
      }
    }
    return "Generated Lesson"; // Fallback if no H1 found
  };

  /**
   * Renders the main content area based on the current state.
   * Priorities:
   * 1. Dynamically generated lesson content.
   * 2. Currently selected lesson (with or without quiz).
   * 3. Welcome message if no lesson is selected or generated.
   *
   * @returns {JSX.Element} The main content element.
   */
  const renderMainContent = () => {
    // Priority 1: Display dynamically generated content if available
    if (generatedLessonContent) {
        const extractedTitle = extractTitleFromMarkdown(generatedLessonContent);

        // Create a temporary Lesson object for display
        const generatedLesson: Lesson = {
            id: 'generated-lesson', // Temporary ID
            title: extractedTitle,
            contentMarkdown: generatedLessonContent,
            concepts: [],
            subject: 'Generated',
            progress: 'not-started',
            quizzes: [],
        };
        return (
            <LessonContent
                key={`generated-lesson-${Date.now()}`} // Use timestamp for unique key
                lesson={generatedLesson}
                allLessons={lessonsData}
                currentQuizIdToShow={null}
                onSimulateUserMessage={handleSimulateUserMessage}
                onLessonComplete={() => { /* No completion for generated */ }}
            />
        );
    }
    // Priority 2: Display the currently selected lesson if no generated content
    else if (currentLesson) {
        return (
            <LessonContent
                key={`${currentLessonId}-${currentQuizIdToShow}`}
                lesson={currentLesson}
                allLessons={lessonsData}
                currentQuizIdToShow={currentQuizIdToShow}
                onSimulateUserMessage={handleSimulateUserMessage}
                onLessonComplete={handleLessonComplete}
            />
        );
    }
    // Priority 3: Show welcome message if nothing else is selected/generated
    else {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl font-semibold mb-4">Welcome!</h1>
                <p>Select a lesson from the left sidebar or ask the assistant to start.</p>
            </div>
        );
    }
  };

  return (
    <>
      <Header user={{ name: "Student Name", avatar: "S" }} />

      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed z-[1100] top-20 left-4 w-11 h-11 bg-primary text-white border-none rounded-full shadow-md flex items-center justify-center text-2xl"
          aria-label="Toggle Menu"
        >
          <Menu size={24} />
        </button>
      )}

      <div className={`flex min-h-[calc(100vh-74px)] ${isMobile ? "flex-col" : ""}`}>
        <Sidebar
          subjects={subjectsData}
          lessons={lessonsData}
          currentLessonId={currentLessonId}
          onLessonSelect={handleLessonSelect}
          isMobile={isMobile}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />

        <main
          className="flex-grow p-10 transition-all"
          role="main"
          style={{
            paddingRight: isMobile ? "10px" : "370px",
          }}
        >
          {renderMainContent()}
        </main>

        <div className="fixed right-0 top-[74px] bottom-0 w-[360px] z-40 hidden md:block">
             <Chat
                onAction={handleChatAction}
                simulatedMessage={simulatedMessageToSend}
                activeLessonId={currentLessonId}
                onSimulatedMessageProcessed={handleSimulatedMessageProcessed}
             />
        </div>

      </div>

      {isMobile && sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleSidebar} />}
    </>
  )
}
