# Plan: Implement Real LLM API Call

This plan outlines the steps to replace the simulated LLM response in the chat component with a genuine API call to the Google Gemini model.

## 1. Environment Setup

*   Create a `.env.local` file in the project root (if it doesn't exist).
*   Add the `GEMINI_API_KEY=YOUR_API_KEY_HERE` line to `.env.local`. (Replace `YOUR_API_KEY_HERE` with the actual key).
*   Ensure `.env.local` is listed in the `.gitignore` file to prevent committing the secret key.
*   Install the necessary Google Generative AI SDK package: `pnpm install @google/generative-ai`.

## 2. Create API Route (`app/api/chat/route.ts`)

*   Create a new API route file: `app/api/chat/route.ts`.
*   Implement the server-side logic within this file:
    *   Import `GoogleGenerativeAI` from `@google/generative-ai`.
    *   Read the `GEMINI_API_KEY` from `process.env`.
    *   Initialize the `genAI` client and the Gemini model (using the configuration from `reference-documentation/gemini-prompt.md`, including the JSON response schema).
    *   Define a `POST` handler function that:
        *   Receives the `currentUserMessage` and the current `llmContext` (or relevant parts of it) in the request body.
        *   Constructs the prompt payload for the Gemini API, including the system prompt (potentially loaded from `reference-documentation/system-prompt.md`) and the user-specific context (message, lesson state, available lessons, etc.), similar to the `parts` array in `gemini-prompt.md`.
        *   Calls the `model.generateContent()` method.
        *   Parses the JSON response from Gemini.
        *   Returns the parsed JSON response (containing `responseText`, `action`, `contextUpdates`, etc.) to the client.
    *   Include error handling for the API call.

## 3. Modify Chat Component (`components/chat.tsx`)

*   Update the `processSubmission` function:
    *   Remove the existing simulation logic (the large `if/else if` block, lines ~130-251).
    *   Remove the simulated delay (`await new Promise(...)` on line 117).
    *   Inside `processSubmission`, after adding the user message and typing indicator:
        *   Make a `fetch` call to the new `/api/chat` endpoint using the `POST` method.
        *   Send the `messageText` (as `currentUserMessage`) and the current `llmContext` (or necessary parts like `currentLesson`, `currentQuiz`, `availableLessons` derived from `chatDb`) in the request body as JSON.
        *   Await the JSON response from the API route.
        *   Extract `responseText`, `action`, `contextUpdates`, and `flagsPreviousMessageAsInappropriate` from the API response.
        *   Handle potential errors from the `fetch` call.
    *   Update the UI state (`messages`, potentially flagging the user message if `flagsPreviousMessageAsInappropriate` is true) based on the received `responseText`.
    *   Update the `llmContext` based on any `contextUpdates` received from the API.
    *   Call `onAction(action)` if an action is received from the API.

## Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant ChatComponent (Client)
    participant ChatAPI (/api/chat) (Server)
    participant GeminiAPI

    User->>+ChatComponent: Enters message & submits
    ChatComponent->>ChatComponent: Adds User Message to UI
    ChatComponent->>ChatComponent: Adds Typing Indicator to UI
    ChatComponent->>+ChatAPI: POST /api/chat (sends message, llmContext)
    ChatAPI->>ChatAPI: Reads API Key (process.env)
    ChatAPI->>ChatAPI: Constructs Prompt (System + User Context)
    ChatAPI->>+GeminiAPI: generateContent(prompt)
    GeminiAPI-->>-ChatAPI: JSON Response (text, action, etc.)
    ChatAPI->>ChatAPI: Parses JSON Response
    ChatAPI-->>-ChatComponent: Returns Parsed JSON Response
    ChatComponent->>ChatComponent: Removes Typing Indicator
    ChatComponent->>ChatComponent: Updates UI (AI Message, inappropriate flag?)
    ChatComponent->>ChatComponent: Updates llmContext (if contextUpdates)
    ChatComponent->>ChatComponent: Calls onAction(action) (if action)
    ChatComponent-->>-User: Displays AI Response & performs action