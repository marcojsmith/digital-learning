# LLM Test Input: Navigate to Previous Lesson

**Scenario:** User is currently in `lesson2` and asks to return to the previous lesson (`lesson1`).

**Expected LLM Action:** `showLessonOverview` with `payload: { lessonId: "lesson1" }`.

```json
{
  "currentUserMessage": "previous lesson",
  "currentLlmContext": {
    "studentProfile": {
      "name": "Alex",
      "grade": 5,
      "age": 10,
      "learningStyle": "Visual",
      "challenges": []
    },
    "currentLesson": {
      "id": "lesson2",
      "data": {
        "id": "lesson2",
        "title": "Basic Addition",
        "description": "Learning simple addition.",
        "concepts": ["addition", "sum"],
        "subject": "Math",
        "progress": "in-progress",
        "quizzes": [
           { "id": "quizC", "title": "Add 1", "type": "multiple-choice", "concepts": ["addition"], "items": [] }
        ],
        "nextLesson": "lesson3",
        "prevLesson": "lesson1"
      },
      "startTime": "2025-03-31T10:20:00.000Z",
      "progressPercentage": 10
    },
    "currentQuiz": null,
    "progressHistory": [],
    "recentInteractions": [
      { "user": "Let's begin" },
      { "ai_response": { "action": { "type": "showLessonOverview", "payload": { "lessonId": "lesson1" } } } },
      { "user": "Okay, show me the first activity" },
      { "ai_response": { "action": { "type": "showQuiz", "payload": { "lessonId": "lesson1", "quizId": "quizA" } } } },
      { "user": "I think it's 5" },
      { "ai_response": { "responseText": "Yes, that's correct! 5 comes after 4. Great job!", "contextUpdates": { "conceptsMastered": ["number_identity"] } } },
      { "user": "next lesson please" },
      { "ai_response": { "action": { "type": "showLessonOverview", "payload": { "lessonId": "lesson2" } } } }
    ],
    "conceptsIntroduced": ["counting", "number_identity", "addition", "sum"],
    "conceptsMastered": ["number_identity"],
    "conceptsStruggling": []
  },
  "availableLessons": {
    "lesson1": "Introduction to Numbers",
    "lesson2": "Basic Addition",
    "lesson3": "Counting Objects"
  },
  "currentLessonData": {
     "id": "lesson2",
     "title": "Basic Addition",
     "description": "Learning simple addition.",
     "concepts": ["addition", "sum"],
     "subject": "Math",
     "progress": "in-progress",
     "quizzes": [
        { "id": "quizC", "title": "Add 1", "type": "multiple-choice", "concepts": ["addition"], "items": [] }
     ],
     "nextLesson": "lesson3",
     "prevLesson": "lesson1"
  }
}
```

## Expected LLM Response

```json
{
  "responseText": "Okay, going back to the previous lesson: 'Introduction to Numbers'.",
  "action": {
    "type": "showLessonOverview",
    "payload": {
      "lessonId": "lesson1"
    }
  }
}
```