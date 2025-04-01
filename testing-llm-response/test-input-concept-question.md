# LLM Test Input: Ask About Concept

**Scenario:** User is in `lesson1`, `quizA` is active. User asks about a concept relevant to the lesson/quiz ("number_identity").

**Expected LLM Action:** `null` or `generalResponse`, with `responseText` explaining the concept.

```json
{
  "currentUserMessage": "What does number identity mean?",
  "currentLlmContext": {
    "studentProfile": {
      "name": "Alex",
      "grade": 5,
      "age": 10,
      "learningStyle": "Visual",
      "challenges": []
    },
    "currentLesson": {
      "id": "lesson1",
      "data": {
        "id": "lesson1",
        "title": "Introduction to Numbers",
        "description": "An introduction to basic numbers.",
        "concepts": ["counting", "number_identity"],
        "subject": "Math",
        "progress": "in-progress",
        "quizzes": [
          { "id": "quizA", "title": "Number Recognition", "type": "multiple-choice", "concepts": ["number_identity"], "items": [ { "question": "What number comes after 4?", "options": [ { "text": "3", "correct": false }, { "text": "5", "correct": true }, { "text": "6", "correct": false } ] } ] },
          { "id": "quizB", "title": "Counting Practice", "type": "list", "concepts": ["counting"], "items": [] }
        ],
        "nextLesson": "lesson2",
        "prevLesson": null
      },
      "startTime": "2025-03-31T10:15:00.000Z",
      "progressPercentage": 15
    },
    "currentQuiz": {
       "id": "quizA",
       "data": { "id": "quizA", "title": "Number Recognition", "type": "multiple-choice", "concepts": ["number_identity"], "items": [ { "question": "What number comes after 4?", "options": [ { "text": "3", "correct": false }, { "text": "5", "correct": true }, { "text": "6", "correct": false } ] } ] },
       "startTime": "2025-03-31T10:18:00.000Z",
       "attempts": 0,
       "answers": {},
       "correctCount": 0
    },
    "progressHistory": [],
    "recentInteractions": [
      { "user": "Let's begin" },
      { "ai_response": { "action": { "type": "displayLessonContent", "payload": { "lessonId": "lesson1" } } } },
      { "user": "Okay, show me the first activity" },
      { "ai_response": { "action": { "type": "showQuiz", "payload": { "lessonId": "lesson1", "quizId": "quizA" } } } }
    ],
    "conceptsIntroduced": ["counting", "number_identity"],
    "conceptsMastered": [],
    "conceptsStruggling": []
  },
  "availableLessons": {
    "lesson1": "Introduction to Numbers",
    "lesson2": "Basic Addition",
    "lesson3": "Counting Objects"
  },
  "currentLessonData": {
    "id": "lesson1",
    "title": "Introduction to Numbers",
    "description": "An introduction to basic numbers.",
    "concepts": ["counting", "number_identity"],
    "subject": "Math",
    "progress": "in-progress",
    "quizzes": [
      { "id": "quizA", "title": "Number Recognition", "type": "multiple-choice", "concepts": ["number_identity"], "items": [ { "question": "What number comes after 4?", "options": [ { "text": "3", "correct": false }, { "text": "5", "correct": true }, { "text": "6", "correct": false } ] } ] },
      { "id": "quizB", "title": "Counting Practice", "type": "list", "concepts": ["counting"], "items": [] }
    ],
    "nextLesson": "lesson2",
    "prevLesson": null
  }
}

## Expected LLM Response

```json
{
  "responseText": "Number identity usually refers to the idea that each number is unique and represents a specific quantity. For example, the number 5 always means five things. Does that help?"
}