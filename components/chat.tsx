"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import type {
    ChatMessage,
    Lesson,
    LessonQuiz,
    LlmContext,
    ChatAction,
    LessonDatabase,
    StudentProfile
} from "@/types"
import { getChatLessonDatabase, getInitialStudentProfile } from "@/lib/data-service";
import { Send, Mic } from "lucide-react"
import { logger } from '@/lib/logger'; // Import the logger
interface ChatProps {
  onAction: (action: ChatAction) => void;
  simulatedMessage: { text: string; id: number } | null;
  onSimulatedMessageProcessed: () => void;
}

// Define a type for the expected API response structure
interface LlmApiResponse {
    responseText: string;
    action?: ChatAction | null;
    contextUpdates?: Partial<LlmContext> | null; // Use Partial for flexibility
    flagsPreviousMessageAsInappropriate?: boolean | null;
    error?: string; // Include potential error field
}


export default function Chat({ onAction, simulatedMessage, onSimulatedMessageProcessed }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: "Hello! I'm your math tutor. I can help you learn about numbers, operations, and more. What would you like to learn today?", type: "ai" },
  ])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatDb, setChatDb] = useState<LessonDatabase | null>(null);

  const [llmContext, setLlmContext] = useState<LlmContext>({
    studentProfile: null,
    currentLesson: null, currentQuiz: null, progressHistory: [], recentInteractions: [],
    // Use Sets for efficient lookups, convert to array for API
    conceptsIntroduced: new Set<string>(),
    conceptsMastered: new Set<string>(),
    conceptsStruggling: new Set<string>(),
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
        setIsProcessing(true);
        try {
            const [profile, database] = await Promise.all([
                getInitialStudentProfile(),
                getChatLessonDatabase()
            ]);
            setLlmContext(prev => ({
                ...prev,
                studentProfile: profile,
                recentInteractions: [] // Clear history on initial load
            }));
            setChatDb(database);
        } catch (error) {
            logger.error("Error fetching initial chat data", { ...(error instanceof Error ? { message: error.message, stack: error.stack, name: error.name } : { error }), component: 'Chat' });
            setMessages(prev => [...prev, { text: "Error loading chat data.", type: 'ai' }]);
        } finally {
            setIsProcessing(false);
        }
    };
    fetchData();
  }, []);


  const setCurrentLesson = useCallback((lessonId: string) => {
    if (!chatDb) return;
    const lessonData = chatDb[lessonId];
    if (!lessonData) {
        logger.warn(`Lesson data not found in chatDb for ID: ${lessonId}`, { component: 'Chat', lessonId });
        return;
    }
    setLlmContext((prev: LlmContext) => {
        const newIntroduced = new Set(prev.conceptsIntroduced);
        lessonData.concepts?.forEach((concept: string) => newIntroduced.add(concept));
        return {
            ...prev,
            currentLesson: { id: lessonId, data: lessonData, startTime: new Date(), progressPercentage: 0 },
            currentQuiz: null, // Reset quiz when lesson changes
            conceptsIntroduced: newIntroduced
        };
    });
  }, [chatDb]);

  const setCurrentQuiz = useCallback((lessonId: string, quizId: string) => {
    if (!chatDb) return;
    const lesson = chatDb[lessonId];
    const quizData = lesson?.quizzes?.find((q: LessonQuiz) => q.id === quizId);
    if (!lesson || !quizData) {
        logger.warn(`Quiz data not found in chatDb for lesson ${lessonId}, quiz ${quizId}`, { component: 'Chat', lessonId, quizId });
        return;
    }
    setLlmContext((prev: LlmContext) => ({
        ...prev,
        // Ensure currentLesson is set if navigating directly to a quiz (might need adjustment)
        currentLesson: prev.currentLesson?.id === lessonId ? prev.currentLesson : { id: lessonId, data: lesson, startTime: new Date(), progressPercentage: 0 },
        currentQuiz: { id: quizId, data: quizData, startTime: new Date(), attempts: 0, answers: {}, correctCount: 0 }
    }));
  }, [chatDb]);

  // Scroll effect
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // ========================================================================
  // Core Message Processing Logic - Calls API Route
  // ========================================================================
  const processSubmission = useCallback(async (messageText: string) => {
    if (!messageText || isProcessing || !chatDb) return;

    setIsProcessing(true);
    const userMessage: ChatMessage = { text: messageText, type: "user" };
    setMessages((prev) => [...prev, userMessage]);

    // Add user message to interactions history *before* API call
    setLlmContext(prev => ({
        ...prev,
        recentInteractions: [...prev.recentInteractions, { user: messageText }]
    }));

    const typingMessage: ChatMessage = { text: "Assistant is typing...", type: "typing" };
    setMessages((prev) => [...prev, typingMessage]);

    // --- Define variables for API results ---
    let responseText: string = "Sorry, something went wrong. Please try again."; // Default error message
    let action: ChatAction | null = null;
    let contextUpdates: Partial<LlmContext> | null = null;
    let flagsPreviousMessageAsInappropriate: boolean | null = null;

    // --- Call the API Route ---
    try {
        // Prepare availableLessons from chatDb
        const availableLessons = chatDb ? Object.entries(chatDb).reduce((acc, [id, lesson]) => {
            acc[id] = lesson.title;
            return acc;
        }, {} as Record<string, string>) : {};

        // Get currentLessonData if a lesson is active
        const currentLessonData = llmContext.currentLesson?.id ? chatDb?.[llmContext.currentLesson.id] : null;

        // Prepare serializable context for the API
        const serializableLlmContext = {
            studentProfile: llmContext.studentProfile,
            currentLesson: llmContext.currentLesson ? { id: llmContext.currentLesson.id } : null,
            currentQuiz: llmContext.currentQuiz ? { id: llmContext.currentQuiz.id } : null,
            conceptsIntroduced: Array.from(llmContext.conceptsIntroduced),
            conceptsMastered: Array.from(llmContext.conceptsMastered),
            conceptsStruggling: Array.from(llmContext.conceptsStruggling),
            progressHistory: llmContext.progressHistory, // Assuming these are serializable
            recentInteractions: llmContext.recentInteractions, // Assuming these are serializable
        };


        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentUserMessage: messageText,
                currentLlmContext: serializableLlmContext,
                availableLessons: availableLessons,
                currentLessonData: currentLessonData // Send full data if available
            }),
        });

        const apiResponse: LlmApiResponse = await res.json();

        if (!res.ok || apiResponse.error) {
            logger.error(`API Error (${res.status})`, { error: apiResponse.error || res.statusText, status: res.status, component: 'Chat' });
            responseText = `Error: ${apiResponse.error || res.statusText || "Unknown API error"}`;
        } else {
            responseText = apiResponse.responseText || "Received empty response from assistant.";
            action = apiResponse.action || null;
            contextUpdates = apiResponse.contextUpdates || null;
            flagsPreviousMessageAsInappropriate = apiResponse.flagsPreviousMessageAsInappropriate || null;

            // --- Update LLM Context based on API response ---
            setLlmContext(prev => {
                if (!contextUpdates) {
                    return prev; // No updates from API
                }
                const newContext = { ...prev };
                // Update concepts (handle potential array format from API)
                if (contextUpdates.conceptsMastered && Array.isArray(contextUpdates.conceptsMastered)) {
                    const updatedMastered = new Set(prev.conceptsMastered);
                    contextUpdates.conceptsMastered.forEach(concept => updatedMastered.add(concept));
                    newContext.conceptsMastered = updatedMastered;
                }
                 if (contextUpdates.conceptsStruggling && Array.isArray(contextUpdates.conceptsStruggling)) {
                    const updatedStruggling = new Set(prev.conceptsStruggling);
                    contextUpdates.conceptsStruggling.forEach(concept => updatedStruggling.add(concept));
                    newContext.conceptsStruggling = updatedStruggling;
                }
                 if (contextUpdates.conceptsIntroduced && Array.isArray(contextUpdates.conceptsIntroduced)) {
                    const updatedIntroduced = new Set(prev.conceptsIntroduced);
                    contextUpdates.conceptsIntroduced.forEach(concept => updatedIntroduced.add(concept));
                    newContext.conceptsIntroduced = updatedIntroduced;
                }
                // Add more context update logic here if needed (e.g., studentProfile)
                return newContext;
            });
        }

    } catch (error) {
        logger.error("Failed to fetch from chat API", { ...(error instanceof Error ? { message: error.message, stack: error.stack, name: error.name } : { error }), component: 'Chat' });
        responseText = "Failed to connect to the assistant. Please check your connection and try again.";
    } finally {
        // Remove typing indicator regardless of success/failure
        setMessages((prev) => prev.filter((msg) => msg.type !== "typing"));
    }
    // --- End API Call Logic ---

    // --- Process API Results (Runs *after* finally) ---

    // Handle inappropriate flag
     if (flagsPreviousMessageAsInappropriate) {
        setMessages(prevMessages => {
            let lastUserMessageIndex = -1;
            for (let i = prevMessages.length - 1; i >= 0; i--) {
                if (prevMessages[i].type === 'user') {
                    lastUserMessageIndex = i;
                    break;
                }
            }
            if (lastUserMessageIndex !== -1) {
                return prevMessages.map((msg, index) =>
                    index === lastUserMessageIndex ? { ...msg, isInappropriate: true } : msg
                );
            }
            return prevMessages;
        });
    }

    // Add AI response message
    const aiMessage: ChatMessage = { text: responseText, type: "ai" };
    setMessages((prev) => [...prev, aiMessage]);

    // Add AI response to interactions history *after* API call and state update
    // Note: We might need to refine what exactly constitutes the 'ai_response' object
    // based on how buildChatHistory formats it on the backend.
    // For now, storing the core parts.
    setLlmContext(prev => ({
        ...prev,
        recentInteractions: [...prev.recentInteractions, { ai_response: { responseText, action, contextUpdates, flagsPreviousMessageAsInappropriate } }]
    }));

     // Handle actions that modify local context *after* API call & context updates
     // These ensure the local state matches the intended state after an action
     if (action?.type === 'showLessonOverview' && action.payload?.lessonId) {
         setCurrentLesson(action.payload.lessonId);
     } else if (action?.type === 'showQuiz' && action.payload?.lessonId && action.payload?.quizId) {
         setCurrentQuiz(action.payload.lessonId, action.payload.quizId);
     } else if (action?.type === 'completeLesson') {
         // Clear lesson/quiz locally after completion action is confirmed by API
         setLlmContext((prev: LlmContext) => ({ ...prev, currentLesson: null, currentQuiz: null }));
     }

    // Trigger external action handler if needed (e.g., for UI changes in parent)
    if (action) {
      onAction(action); // Call the prop function passed from the parent
    }

    // Always set processing to false at the very end
    setIsProcessing(false);
    // --- End Processing API Results ---

  }, [isProcessing, chatDb, llmContext, onAction, setCurrentLesson, setCurrentQuiz]); // Dependencies for useCallback

  // ========================================================================
  // Handle Actual User Input Submission
  // ========================================================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = inputValue.trim();
    if (messageText) {
        processSubmission(messageText); // Call the core logic
        setInputValue(""); // Clear input after submission attempt
    }
  };

  // ========================================================================
  // Handle Simulated Message Submission from UI Actions (e.g., button clicks)
  // ========================================================================
  useEffect(() => {
    // Process simulated messages (e.g., from button clicks like "Next Activity")
    if (simulatedMessage && !isProcessing) {
        logger.info(`Processing simulated user message`, { component: 'Chat', messageText: simulatedMessage.text });
        processSubmission(simulatedMessage.text)
            .then(() => {
                onSimulatedMessageProcessed(); // Notify parent that processing is done
            })
            .catch((error) => {
                logger.error("Error processing simulated message", { ...(error instanceof Error ? { message: error.message, stack: error.stack, name: error.name } : { error }), component: 'Chat' });
                // Add error message to chat?
                setMessages(prev => [...prev, { text: "Error processing action.", type: 'ai' }]);
                onSimulatedMessageProcessed(); // Still notify parent on error
            });
    }
  }, [simulatedMessage, isProcessing, processSubmission, onSimulatedMessageProcessed]); // Added dependencies

  // --- JSX Structure (remains largely the same) ---
  return (
    <div className="flex flex-col h-full border-l bg-white">
        {!chatDb && (
            <div className="flex items-center justify-center h-full">
                <p>Loading chat...</p>
            </div>
        )}
        {chatDb && (
            <>
                <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-2 bg-light-gray">
                {messages.map((message, index) => (
                    <div
                    key={`${message.type}-${index}-${message.text.slice(0, 10)}`} // Slightly more robust key
                    className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${
                        message.type === "user"
                        ? "bg-user-msg text-[#0c5460] self-end rounded-br-sm"
                        : message.type === "typing"
                            ? "bg-transparent text-gray-500 italic self-start border-none shadow-none"
                            : "bg-ai-msg text-dark-gray self-start rounded-bl-sm border border-medium-gray"
                    } ${message.type === 'user' && message.isInappropriate ? 'border-2 border-red-500' : ''}`} // Enhanced border
                    >
                    {message.type === 'typing' ? (
                        <div className="flex space-x-1">
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    ) : (
                        message.text
                    )}
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
                    disabled={isProcessing || !chatDb}
                    className="flex-grow p-2 border border-medium-gray rounded-full outline-none focus:border-primary text-sm disabled:bg-gray-100"
                />
                <button
                    type="submit"
                    disabled={isProcessing || !chatDb || !inputValue.trim()} // Disable if input is empty
                    className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <Send size={16} />
                </button>
                <button
                    type="button"
                    disabled={isProcessing || !chatDb} // Keep Mic enabled even if input empty for potential future use
                    className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors disabled:bg-gray-400"
                    title="Voice input (not implemented)" // Add title for clarity
                >
                    <Mic size={16} />
                </button>
                </form>
            </>
        )}
    </div>
  )
}
