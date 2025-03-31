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


export default function Home() {
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [currentQuizIdToShow, setCurrentQuizIdToShow] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [subjectsData, setSubjectsData] = useState<Subject[]>([]);
  const [lessonsData, setLessonsData] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State for simulated message
  const [simulatedMessageToSend, setSimulatedMessageToSend] = useState<{ text: string; id: number } | null>(null);

  const isMobile = useMobile()

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

  useEffect(() => {
    if (!isLoading && currentLessonId && lessonsData.some(l => l.id === currentLessonId)) {
         window.location.hash = `#${currentLessonId}`;
    } else if (!isLoading && !currentLessonId) {
        // Clear hash if no lesson selected
        // history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  }, [currentLessonId, isLoading, lessonsData]);


  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
    if (!sidebarOpen) {
      document.body.classList.add("sidebar-open")
    } else {
      document.body.classList.remove("sidebar-open")
    }
  }

  const handleLessonSelect = (lessonId: string) => {
    if (lessonsData.some(l => l.id === lessonId)) {
        handleChatAction({ type: 'showLessonOverview', payload: { lessonId } });
        window.scrollTo(0, 0)
        if (isMobile && sidebarOpen) {
            toggleSidebar();
        }
    }
  }

  const handleLessonComplete = (lessonId: string) => {
    setLessonsData((prev) =>
      prev.map((lesson) => (lesson.id === lessonId ? { ...lesson, progress: "completed" as const } : lesson)),
    )
    setCurrentQuizIdToShow(null);
  }

  const handleChatAction = (action: ChatAction) => {
    console.log("Chat Action Received in page.tsx:", action);
    switch (action.type) {
        case "showLessonOverview":
            // Add check for payload existence
            if (action.payload?.lessonId && lessonsData.some(l => l.id === action.payload.lessonId)) {
                setCurrentLessonId(action.payload.lessonId);
                setCurrentQuizIdToShow(null);
            } else {
                 console.warn("showLessonOverview action received without valid payload.lessonId");
            }
            break;
        case "showQuiz":
            // Add check for payload and nested properties
            if (action.payload?.lessonId && action.payload?.quizId) {
                const targetLesson = lessonsData.find(l => l.id === action.payload.lessonId);
                if (targetLesson && targetLesson.quizzes.some(q => q.id === action.payload.quizId)) {
                    if (currentLessonId !== action.payload.lessonId) {
                        setCurrentLessonId(action.payload.lessonId);
                    }
                    setCurrentQuizIdToShow(action.payload.quizId);
                } else {
                    console.warn(`Attempted to show non-existent quiz: ${action.payload.lessonId}/${action.payload.quizId}`);
                }
            } else {
                 console.warn("showQuiz action received without valid payload.lessonId or payload.quizId");
            }
            break;
        case "completeLesson":
             // Add check for payload existence
             if (action.payload?.lessonId) {
                handleLessonComplete(action.payload.lessonId);
             } else {
                  console.warn("completeLesson action received without valid payload.lessonId");
             }
            break;
        case "returnToLessonOverview":
            // Add check for payload existence
            if (action.payload?.lessonId && lessonsData.some(l => l.id === action.payload.lessonId)) {
                 if (currentLessonId !== action.payload.lessonId) {
                    setCurrentLessonId(action.payload.lessonId);
                 }
                 setCurrentQuizIdToShow(null);
            } else {
                 console.warn("returnToLessonOverview action received without valid payload.lessonId");
            }
            break;
        default:
            console.log("Unhandled chat action type:", action.type);
    }
  };

  // Removed handleNavigateRequest and handleShowQuiz

  // New handler to set the simulated message state
  const handleSimulateUserMessage = (message: string) => {
      console.log(`Queueing simulated message: "${message}"`);
      setSimulatedMessageToSend({ text: message, id: Date.now() }); // Use timestamp as unique ID
  };

  // New handler to clear the simulated message state after processing
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

  const renderMainContent = () => {
    if (!currentLesson) {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl font-semibold mb-4">Welcome!</h1>
                <p>Select a lesson from the left sidebar or ask the assistant to start.</p>
            </div>
        );
    } else {
        return (
            <LessonContent
                key={`${currentLessonId}-${currentQuizIdToShow}`}
                lesson={currentLesson}
                allLessons={lessonsData}
                currentQuizIdToShow={currentQuizIdToShow}
                onSimulateUserMessage={handleSimulateUserMessage} // Pass new handler
                onLessonComplete={handleLessonComplete}
                // Removed onNavigateRequest and onShowQuiz
            />
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
             {/* Pass new props to Chat */}
             <Chat
                onAction={handleChatAction}
                simulatedMessage={simulatedMessageToSend}
                onSimulatedMessageProcessed={handleSimulatedMessageProcessed}
             />
        </div>

      </div>

      {isMobile && sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleSidebar} />}
    </>
  )
}
