# Plan: Fix LLM Payload Issue and Optimize Prompt

**Objective:** Address the issue where the Gemini LLM sometimes fails to include the mandatory `payload` object (with required IDs) in its JSON response for specific actions like `showLessonOverview`, despite instructions.

**Approach:** Implement a two-pronged solution by strengthening the prompt instructions and adding server-side validation, with an optional third phase to optimize the prompt structure.

---

## Phase 1: Strengthen System Prompt (`lib/prompts/system-prompt.ts`)

**Goal:** Make the instructions for the LLM even clearer regarding the mandatory payload requirement.

**Steps:**

1.  **Add Negative Example:** Directly below the existing "CORRECT Output" examples for actions requiring payloads, add a new "INCORRECT Output (Missing Payload)" example. This example should mirror the error observed in the logs (e.g., an action object with `"type": "showLessonOverview"` but no `payload` field). Explicitly state why it's incorrect.
    *   *Example Addition:*
        ```markdown
        **Scenario: User wants to start lesson 1 (e.g., "show lesson 1")**
        *   **Input Context:** ...
        *   **CORRECT Output:** ... (Existing example) ...
        *   **INCORRECT Output (Missing Payload):**
            ```json
            {
              "responseText": "Okay, here is the overview for lesson 1.",
              "action": {
                "type": "showLessonOverview"
                // PAYLOAD OBJECT IS MISSING - THIS IS WRONG!
              },
              "reasoning": "The user wants to see lesson 1.",
              "contextUpdates": null,
              "flagsPreviousMessageAsInappropriate": null
            }
            ```
            *(Reason Incorrect: The `payload` object with `lessonId` is missing, which is mandatory for `showLessonOverview`)*
        ```
2.  **Reinforce Rule:** Add a final, strongly worded sentence just before the closing backtick (`) of the `SYSTEM_PROMPT_TEXT` constant, re-emphasizing the absolute requirement of the payload for `showLessonOverview`, `showQuiz`, and `completeLesson`.
    *   *Example Addition:*
        ```typescript
        // ... existing prompt text ...
        Ensure your entire output is valid JSON. **CRITICAL REMINDER: The 'payload' object within 'action' is NON-NEGOTIABLE and MUST be included with the correct IDs for 'showLessonOverview', 'showQuiz', and 'completeLesson' actions.**
        `; // Closing backtick
        ```

---

## Phase 2: Implement Post-Processing Validation (`app/api/chat/route.ts`)

**Goal:** Add a server-side check to verify the LLM's response structure *before* sending it to the frontend, ensuring the payload rules are met.

**Steps:**

1.  **Locate Insertion Point:** Find the line `console.log("Successfully parsed Gemini JSON response.");` (around line 180).
2.  **Add Validation Logic:** Immediately after the line above, insert the following validation checks:
    ```typescript
    // --- Start Validation Logic ---
    const requiredPayloadActions = ['showLessonOverview', 'showQuiz', 'completeLesson'];
    const action = parsedResponse.action; // Assuming parsedResponse holds the parsed JSON

    if (action && requiredPayloadActions.includes(action.type)) {
      if (!action.payload) {
        console.error(`Validation Error: Action '${action.type}' requires a payload, but it was missing.`);
        throw new Error(`LLM response action '${action.type}' missing required payload.`);
      }

      if ((action.type === 'showLessonOverview' || action.type === 'completeLesson') && (!action.payload.lessonId || typeof action.payload.lessonId !== 'string')) {
         console.error(`Validation Error: Action '${action.type}' payload missing or invalid 'lessonId'. Payload:`, action.payload);
         throw new Error(`LLM response payload for '${action.type}' missing required 'lessonId'.`);
      }

      if (action.type === 'showQuiz' && (!action.payload.lessonId || typeof action.payload.lessonId !== 'string' || !action.payload.quizId || typeof action.payload.quizId !== 'string')) {
         console.error(`Validation Error: Action '${action.type}' payload missing or invalid 'lessonId' or 'quizId'. Payload:`, action.payload);
         throw new Error(`LLM response payload for '${action.type}' missing required 'lessonId' or 'quizId'.`);
      }
      console.log(`Validation Passed for action type: ${action.type}`);
    }
    // --- End Validation Logic ---

    // Existing line: Return the parsed JSON object
    return NextResponse.json(parsedResponse);
    ```
3.  **Error Handling:** Confirm that the existing `catch (error)` block (around line 191) will catch errors thrown by this new validation logic and return a 500 status with a clear message (e.g., "LLM API call failed: LLM response action 'showLessonOverview' missing required payload.").

---

## Phase 3 (Optional but Recommended): Refactor Prompt Examples

**Goal:** Reduce the size of the request sent to the LLM, improve code readability in `route.ts`, and potentially minimize LLM confusion by reducing the amount of static example data sent repeatedly.

**Rationale:** The current `route.ts` includes a large number of hardcoded input/output examples directly in the `parts` array. This significantly increases the token count for every API call, potentially increasing costs and latency. It also makes the route handler code harder to read and maintain.

**Steps:**

1.  **Create New File:** Create `lib/prompts/prompt-examples.ts`.
2.  **Move Examples:** Cut the hardcoded example strings (lines 93-120 in the current `route.ts`) and paste them into the new file. Structure them as an exported array of objects, using template literals for consistency. A suggested structure that preserves the input/output turn sequence:
    ```typescript
    // lib/prompts/prompt-examples.ts
    export const PROMPT_EXAMPLE_TURNS = [
      {
        input: `{/* JSON string for input example 1 */}`, // Use template literal
        output: `{/* JSON string for output example 1 */}` // Use template literal
      },
      // ... other input/output pairs ...
    ];
    ```
3.  **Import Examples:** In `app/api/chat/route.ts`, import the examples:
    ```typescript
    import { PROMPT_EXAMPLE_TURNS } from '@/lib/prompts/prompt-examples';
    ```
4.  **Update `parts` Array:** Modify the `parts` array construction (lines 91-130) to use the imported examples instead of hardcoded strings, ensuring the alternating input/output structure is maintained.
    ```typescript
    // app/api/chat/route.ts
    const exampleParts = PROMPT_EXAMPLE_TURNS.flatMap(turn => [
        { text: `input: ${turn.input}` },
        { text: `output: ${turn.output}` }
    ]);

    const parts = [
        { text: systemPromptText },
        ...exampleParts,
        // The dynamic input part remains the same
        {
          text: `input: ${JSON.stringify({
            currentUserMessage,
            currentLlmContext,
            availableLessons,
            currentLessonData
          })}`
        },
        { text: "output: " }
    ];
    ```

---

## Implementation Order

1.  Implement Phase 1 (Prompt Enhancement).
2.  Implement Phase 2 (Code Validation).
3.  Test the changes thoroughly.
4.  Consider implementing Phase 3 (Refactoring) for optimization and maintainability.

---

## Mermaid Diagram

```mermaid
graph TD
    subgraph Prompt Enhancement (lib/prompts/system-prompt.ts)
        P1[Current Prompt] --> P2[Add Negative Example for Missing Payload];
        P2 --> P3[Add Final Reinforcement Sentence];
        P3 --> P4[Updated Prompt];
    end

    subgraph Code Validation (app/api/chat/route.ts)
        C1[Parse JSON Response] --> C2{Action Requires Payload?};
        C2 -- Yes --> C3{Payload Exists?};
        C2 -- No --> C7[Return Response];
        C3 -- Yes --> C4{Required IDs Exist?};
        C3 -- No --> C5[Throw/Log Payload Missing Error];
        C4 -- Yes --> C7;
        C4 -- No --> C6[Throw/Log ID Missing Error];
        C5 --> C8[Catch Block Handles Error];
        C6 --> C8;
    end

    subgraph Optional Refactor (route.ts & new file)
        R1[Identify Hardcoded Examples] --> R2[Move Examples to prompt-examples.ts];
        R2 --> R3[Import Examples in route.ts];
        R3 --> R4[Update 'parts' Array Construction];
    end

    A[Start] --> P1;
    P4 --> A;
    A --> C1;
    C7 --> Z[End/Test];
    C8 --> Z;
    A --> R1[Consider Refactoring];
    R4 --> A;