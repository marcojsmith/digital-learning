"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import type {
    ChatMessage,
    Lesson,
    LessonQuiz,
    LlmContext,
    ChatAction,
    ActionType,
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

interface LlmResponse {
    responseText: string;
    actionType?: string | null;
    lessonId?: string | null;
    quizId?: string | null;
    contextUpdates?: Partial<LlmContext> | null;
    lessonMarkdownContent?: string | null; // Added for generated lessons
    flagsPreviousMessageAsInappropriate?: boolean | null;
    reasoning?: string;
}

interface LlmApiResponse {
    llmResponse: LlmResponse;
    error?: string;
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
    let responseText: string = "Sorry, something went wrong. Please try again.";
    // Variables for the flattened action fields from the API response
    let actionType: string | null = null;
    let lessonId: string | null = null;
    let quizId: string | null = null;
    let contextUpdates: Partial<LlmContext> | null = null;
    let flagsPreviousMessageAsInappropriate: boolean | null = null;
    let lessonMarkdownContent: string | null = null; // Declare variable here

    // --- Call the API Route ---
    let apiResponse: LlmApiResponse = { llmResponse: { responseText: '' } };
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

        apiResponse = await res.json();
        logger.debug("Full API Response", {
            apiResponse,
            status: res.status,
            hasLlmResponse: !!apiResponse.llmResponse,
            llmResponseKeys: apiResponse.llmResponse ? Object.keys(apiResponse.llmResponse) : [],
            responseTextExists: !!apiResponse.llmResponse?.responseText,
            responseTextType: typeof apiResponse.llmResponse?.responseText,
            component: 'Chat'
        });

        if (!res.ok || apiResponse.error) {
            logger.error(`API Error (${res.status})`, { error: apiResponse.error || res.statusText, status: res.status, component: 'Chat' });
            responseText = `Error: ${apiResponse.error || res.statusText || "Unknown API error"}`;
        } else {
            const llmResponse = apiResponse.llmResponse;
            logger.debug("API Response Structure", {
                hasResponseText: llmResponse?.responseText !== undefined && llmResponse?.responseText !== null,
                responseTextValue: llmResponse?.responseText,
                responseTextLength: llmResponse?.responseText?.length,
                responseType: typeof llmResponse?.responseText,
                component: 'Chat'
            });
            responseText = llmResponse?.responseText !== undefined && llmResponse?.responseText !== null
                ? llmResponse.responseText
                : "Received empty response from assistant.";
            actionType = llmResponse?.actionType || null;
            lessonId = llmResponse?.lessonId || null;
            quizId = llmResponse?.quizId || null;
            contextUpdates = llmResponse?.contextUpdates || null;
            flagsPreviousMessageAsInappropriate = llmResponse?.flagsPreviousMessageAsInappropriate || null;
            lessonMarkdownContent = llmResponse?.lessonMarkdownContent || null; // Assign value here

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
        // Store flattened action fields in history
        recentInteractions: [...prev.recentInteractions, { ai_response: apiResponse.llmResponse }]
    }));

     // --- Handle Actions & Logging (Using Flattened Fields) ---
     if (actionType) { // Check if an action was specified
         logger.info(`Received action from API`, { component: 'Chat', actionType, lessonId, quizId });
 
         // Handle actions that modify local context *after* API call & context updates
         // These ensure the local state matches the intended state after an action
         if (actionType === 'showLessonOverview') {
             if (lessonId) {
                 logger.info(`Executing 'showLessonOverview' action`, { component: 'Chat', lessonId });
                 setCurrentLesson(lessonId); // setCurrentLesson already logs if lessonId is invalid
             } else {
                 logger.warn(`'showLessonOverview' action received without lessonId`, { component: 'Chat', actionType });
             }
         } else if (actionType === 'showQuiz') {
             if (lessonId && quizId) {
                 logger.info(`Executing 'showQuiz' action`, { component: 'Chat', lessonId, quizId });
                 setCurrentQuiz(lessonId, quizId);
             } else {
                 logger.warn(`'showQuiz' action received with missing lessonId or quizId`, { component: 'Chat', actionType, lessonId, quizId });
             }
         } else if (actionType === 'completeLesson') {
             logger.info(`Executing 'completeLesson' action`, { component: 'Chat', currentLessonId: llmContext.currentLesson?.id });
             // Clear lesson/quiz locally after completion action is confirmed by API
             setLlmContext((prev: LlmContext) => ({ ...prev, currentLesson: null, currentQuiz: null }));
         } else {
              // Handle other action types like returnToLessonOverview, showPreviousQuiz, showNextQuiz if needed
              logger.info(`Executing other action type`, { component: 'Chat', actionType, lessonId, quizId });
         }
 
         // Trigger external action handler if needed (e.g., for UI changes in parent)
         // Construct the ChatAction object according to the updated type definition
         const actionPayload: ChatAction = {
             actionType: actionType as ActionType, // Cast as ActionType from types/index.ts
             lessonId: lessonId,
             quizId: quizId,
             lessonMarkdownContent: lessonMarkdownContent // Include the markdown content in the payload
         };
         logger.info(`Calling onAction prop for UI update`, { component: 'Chat', action: actionPayload });
         onAction(actionPayload); // Call the prop function passed from the parent
     }
     // --- End Handle Actions & Logging ---

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
