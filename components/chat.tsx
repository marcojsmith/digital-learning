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

interface ChatProps {
  onAction: (action: ChatAction) => void;
  // New props for simulating messages
  simulatedMessage: { text: string; id: number } | null;
  onSimulatedMessageProcessed: () => void;
}

export default function Chat({ onAction, simulatedMessage, onSimulatedMessageProcessed }: ChatProps) { // Added new props
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
    conceptsIntroduced: new Set(), conceptsMastered: new Set(), conceptsStruggling: new Set(),
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
        setIsProcessing(true); // Indicate loading
        try {
            const [profile, database] = await Promise.all([
                getInitialStudentProfile(),
                getChatLessonDatabase()
            ]);
            setLlmContext(prev => ({ ...prev, studentProfile: profile }));
            setChatDb(database);
        } catch (error) {
            console.error("Error fetching initial chat data:", error);
            setMessages(prev => [...prev, { text: "Error loading chat data.", type: 'ai' }]);
        } finally {
            setIsProcessing(false); // Finish loading
        }
    };
    fetchData();
  }, []);


  const setCurrentLesson = useCallback((lessonId: string) => {
    if (!chatDb) return;
    const lessonData = chatDb[lessonId];
    if (!lessonData) {
        console.warn(`Lesson data not found in chatDb for ID: ${lessonId}`);
        return;
    }
    setLlmContext((prev: LlmContext) => {
        const newIntroduced = new Set(prev.conceptsIntroduced);
        lessonData.concepts?.forEach((concept: string) => newIntroduced.add(concept));
        return {
            ...prev,
            currentLesson: { id: lessonId, data: lessonData, startTime: new Date(), progressPercentage: 0 },
            currentQuiz: null,
            conceptsIntroduced: newIntroduced
        };
    });
  }, [chatDb]);

  const setCurrentQuiz = useCallback((lessonId: string, quizId: string) => {
    if (!chatDb) return;
    const lesson = chatDb[lessonId];
    const quizData = lesson?.quizzes?.find((q: LessonQuiz) => q.id === quizId);
    if (!lesson || !quizData) {
        console.warn(`Quiz data not found in chatDb for lesson ${lessonId}, quiz ${quizId}`);
        return;
    }
    setLlmContext((prev: LlmContext) => ({
        ...prev,
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
  // Core Message Processing Logic (Extracted)
  // ========================================================================
  const processSubmission = useCallback(async (messageText: string) => {
    if (!messageText || isProcessing || !chatDb) return;

    setIsProcessing(true);
    const userMessage: ChatMessage = { text: messageText, type: "user" };
    setMessages((prev) => [...prev, userMessage]);

    const typingMessage: ChatMessage = { text: "Assistant is typing...", type: "typing" };
    setMessages((prev) => [...prev, typingMessage]);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setMessages((prev) => prev.filter((msg) => msg.type !== "typing"));

    let responseText: string = "Sorry, I didn't understand that. Can you rephrase?";
    let action: ChatAction | null = null;
    const lowerMsg = messageText.toLowerCase();

    const currentLessonState = llmContext.currentLesson;
    const currentQuizState = llmContext.currentQuiz;
    const currentLessonData = currentLessonState?.data;

    // --- Dynamic Simulation Logic ---
    if (lowerMsg.includes('help')) {
        responseText = "I can help you learn! Try commands like 'start lesson', 'show first quiz', 'next activity', 'previous activity', 'next lesson', 'previous lesson', or 'back to overview'.";
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        responseText = "Hello there! Ready to learn? Ask me anything about the lessons or say 'start lesson'.";
    }
    // Lesson Start/Navigation
    else if (lowerMsg.includes('start') || lowerMsg.includes('begin') || lowerMsg.includes('learn')) {
        const firstLessonId = Object.keys(chatDb)[0] || "lesson1";
        const targetLesson = chatDb[firstLessonId];
        if (targetLesson) {
            responseText = `Great! Let's start with '${targetLesson.title}'. I'll display the lesson overview.`;
            action = { type: "showLessonOverview", payload: { lessonId: firstLessonId } };
            setCurrentLesson(firstLessonId);
        } else {
            responseText = "Sorry, I couldn't find the first lesson data.";
        }
    } else if (lowerMsg.includes('next lesson')) {
        if (currentLessonData?.nextLesson && chatDb[currentLessonData.nextLesson]) {
            const nextLessonId = currentLessonData.nextLesson;
            const nextLessonTitle = chatDb[nextLessonId]?.title || 'the next lesson';
            responseText = `Okay, moving to the next lesson: '${nextLessonTitle}'.`;
            action = { type: "showLessonOverview", payload: { lessonId: nextLessonId } };
            setCurrentLesson(nextLessonId);
        } else if (currentLessonState) {
            responseText = "You've reached the end of the available lessons!";
        } else {
            responseText = "You need to start a lesson first before moving to the next one.";
        }
    } else if (lowerMsg.includes('previous lesson')) {
        if (currentLessonData?.prevLesson && chatDb[currentLessonData.prevLesson]) {
            const prevLessonId = currentLessonData.prevLesson;
            const prevLessonTitle = chatDb[prevLessonId]?.title || 'the previous lesson';
            responseText = `Okay, going back to the previous lesson: '${prevLessonTitle}'.`;
            action = { type: "showLessonOverview", payload: { lessonId: prevLessonId } };
            setCurrentLesson(prevLessonId);
        } else if (currentLessonState) {
            responseText = "You are already on the first lesson.";
        } else {
            responseText = "You need to start a lesson first before going to the previous one.";
        }
    }
    // Quiz Navigation/Interaction (Requires a lesson to be active)
    else if (currentLessonState) {
        const lessonId = currentLessonState.id;
        const quizzes = currentLessonData?.quizzes || [];
        const currentQuizId = currentQuizState?.id;

        if (lowerMsg.includes('first quiz') || lowerMsg.includes('start quiz')) {
            if (quizzes.length > 0) {
                const firstQuizId = quizzes[0].id;
                responseText = `Okay, here's the first activity for this lesson: ${quizzes[0].title}`;
                action = { type: "showQuiz", payload: { lessonId, quizId: firstQuizId } };
                setCurrentQuiz(lessonId, firstQuizId);
            } else {
                responseText = "This lesson doesn't seem to have any quizzes.";
            }
        } else if (lowerMsg.includes('next activity') || lowerMsg.includes('next quiz')) { // Handle "next activity" from button
            if (!currentQuizId) { // If no quiz active, treat as "first quiz"
                 if (quizzes.length > 0) {
                    const firstQuizId = quizzes[0].id;
                    responseText = `Okay, starting with the first activity: ${quizzes[0].title}`;
                    action = { type: "showQuiz", payload: { lessonId, quizId: firstQuizId } };
                    setCurrentQuiz(lessonId, firstQuizId);
                } else {
                    responseText = "This lesson doesn't seem to have any quizzes to start.";
                }
            } else if (quizzes.length > 0) { // If quiz active, find next
                const currentQuizIndex = quizzes.findIndex(q => q.id === currentQuizId);
                if (currentQuizIndex < quizzes.length - 1) {
                    const nextQuiz = quizzes[currentQuizIndex + 1];
                    responseText = `Okay, moving to the next activity: ${nextQuiz.title}`;
                    action = { type: "showQuiz", payload: { lessonId, quizId: nextQuiz.id } };
                    setCurrentQuiz(lessonId, nextQuiz.id);
                } else {
                    responseText = `You've finished the last activity for this lesson! Try 'next lesson'${currentLessonData?.nextLesson ? '' : ' (though there might not be one)'} or 'complete lesson'.`;
                }
            } else {
                 responseText = "There are no quizzes in this lesson.";
            }
        } else if (lowerMsg.includes('previous activity') || lowerMsg.includes('previous quiz')) { // Handle "previous activity"
            if (!currentQuizId) {
                responseText = "You need to be doing an activity to go back. Try 'show first quiz'.";
            } else if (quizzes.length > 0) {
                const currentQuizIndex = quizzes.findIndex(q => q.id === currentQuizId);
                if (currentQuizIndex > 0) {
                    const prevQuiz = quizzes[currentQuizIndex - 1];
                    responseText = `Okay, going back to the previous activity: ${prevQuiz.title}`;
                    action = { type: "showQuiz", payload: { lessonId, quizId: prevQuiz.id } };
                    setCurrentQuiz(lessonId, prevQuiz.id);
                } else {
                    // If on the first quiz, go back to overview
                    responseText = "You are on the first activity. Going back to the lesson overview.";
                    action = { type: "showLessonOverview", payload: { lessonId } };
                    setLlmContext((prev: LlmContext) => ({ ...prev, currentQuiz: null }));
                }
            } else {
                 responseText = "There are no quizzes to go back to in this lesson.";
            }
        } else if (lowerMsg.includes('return to lesson overview') || lowerMsg.includes('back to overview')) {
            responseText = `Returning to the overview for lesson: ${currentLessonData?.title}.`;
            action = { type: "showLessonOverview", payload: { lessonId } };
            setLlmContext((prev: LlmContext) => ({ ...prev, currentQuiz: null }));
        } else if (lowerMsg.includes('complete lesson')) {
            responseText = `Great job completing the lesson: ${currentLessonData?.title}! What would you like to do next? Try 'next lesson'.`;
            action = { type: "completeLesson", payload: { lessonId } };
            setLlmContext((prev: LlmContext) => ({ ...prev, currentLesson: null, currentQuiz: null }));
        }
        else {
             responseText = `I can help with '${currentLessonData?.title}'. You can ask for the 'first quiz', 'next activity', 'previous activity', 'next lesson', 'previous lesson', or 'back to overview'.`;
        }
    }
    // Fallback if no lesson is active and command isn't general
    else {
        responseText = "Please start a lesson first. Try saying 'start lesson'.";
    }
    // --- End Simulation Logic ---

    const aiMessage: ChatMessage = { text: responseText, type: "ai" };
    setMessages((prev) => [...prev, aiMessage]);

    if (action) {
      onAction(action);
    }

    setIsProcessing(false);

  }, [isProcessing, chatDb, llmContext, onAction, setCurrentLesson, setCurrentQuiz]); // Added dependencies

  // ========================================================================
  // Handle Actual User Input Submission
  // ========================================================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = inputValue.trim();
    if (messageText) {
        processSubmission(messageText); // Call the extracted logic
        setInputValue(""); // Clear input after submission attempt
    }
  };

  // ========================================================================
  // Handle Simulated Message Submission from UI Actions
  // ========================================================================
  useEffect(() => {
    if (simulatedMessage && !isProcessing) { // Only process if not already processing
        console.log(`Simulating user message: "${simulatedMessage.text}"`);
        processSubmission(simulatedMessage.text)
            .then(() => {
                onSimulatedMessageProcessed(); // Notify parent that processing is done
            })
            .catch((error) => {
                console.error("Error processing simulated message:", error);
                onSimulatedMessageProcessed(); // Still notify parent on error
            });
    }
  }, [simulatedMessage, isProcessing, processSubmission, onSimulatedMessageProcessed]); // Added dependencies

  // --- JSX Structure (remains the same) ---
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
                    key={`${message.type}-${index}`} // Use a more robust key
                    className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${
                        message.type === "user"
                        ? "bg-user-msg text-[#0c5460] self-end rounded-br-sm"
                        : message.type === "typing"
                            ? "bg-transparent text-gray-500 italic self-start border-none shadow-none"
                            : "bg-ai-msg text-dark-gray self-start rounded-bl-sm border border-medium-gray"
                    }`}
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
                    disabled={isProcessing || !chatDb}
                    className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors disabled:bg-gray-400"
                >
                    <Send size={16} />
                </button>
                <button
                    type="button"
                    disabled={isProcessing || !chatDb}
                    className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors disabled:bg-gray-400"
                >
                    <Mic size={16} />
                </button>
                </form>
            </>
        )}
    </div>
  )
}
