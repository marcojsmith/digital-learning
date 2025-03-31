# LLM Test Input: Navigate to Next Lesson

**Scenario:** User is currently in `lesson1` and asks to proceed to the next lesson (`lesson2`).

**Expected LLM Action:** `actionType: 'showLessonOverview'`, `lessonId: 'lesson2'`.

```json
{
  "currentUserMessage": "next lesson please",
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
      "progressPercentage": 50
    },
    "currentQuiz": null,
    "progressHistory": [],
    "recentInteractions": [
      { "user": "Let's begin" },
      { "ai_response": { "action": { "type": "showLessonOverview", "payload": { "lessonId": "lesson1" } } } },
      { "user": "Okay, show me the first activity" },
      { "ai_response": { "action": { "type": "showQuiz", "payload": { "lessonId": "lesson1", "quizId": "quizA" } } } },
      { "user": "I think it's 5" },
      { "ai_response": { "responseText": "Yes, that's correct! 5 comes after 4. Great job!", "contextUpdates": { "conceptsMastered": ["number_identity"] } } }
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
  "responseText": "Okay, moving on to the next lesson: 'Basic Addition'.",
  "actionType": "showLessonOverview",
  "lessonId": "lesson2",
  "quizId": null,
  "flagsPreviousMessageAsInappropriate": false
}