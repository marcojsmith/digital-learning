# LLM Test Input: Request Next Quiz at End of Lesson

**Scenario:** User is in `lesson1` and has just completed the last quiz (`quizB`). They ask for the next activity.

**Expected LLM Action:** `null` or `generalResponse`, with `responseText` indicating no more quizzes in this lesson.

```json
{
  "currentUserMessage": "next activity",
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
      "progressPercentage": 90
    },
    "currentQuiz": {
       "id": "quizB",
       "data": { "id": "quizB", "title": "Counting Practice", "type": "list", "concepts": ["counting"], "items": [] },
       "startTime": "2025-03-31T10:22:00.000Z",
       "attempts": 1,
       "answers": {},
       "correctCount": 0
    },
    "progressHistory": [],
    "recentInteractions": [
      { "user": "Let's begin" },
      { "ai_response": { "action": { "type": "displayLessonContent", "payload": { "lessonId": "lesson1" } } } },
      { "user": "Okay, show me the first activity" },
      { "ai_response": { "action": { "type": "showQuiz", "payload": { "lessonId": "lesson1", "quizId": "quizA" } } } },
      { "user": "I think it's 5" },
      { "ai_response": { "responseText": "Yes, that's correct! 5 comes after 4. Great job!", "contextUpdates": { "conceptsMastered": ["number_identity"] } } },
      { "user": "show quiz B" },
      { "ai_response": { "action": { "type": "showQuiz", "payload": { "lessonId": "lesson1", "quizId": "quizB" } } } }
    ],
    "conceptsIntroduced": ["counting", "number_identity"],
    "conceptsMastered": ["number_identity"],
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
  "responseText": "You've finished the last activity ('Counting Practice') for this lesson! You can try the 'next lesson' or 'complete lesson'."
}