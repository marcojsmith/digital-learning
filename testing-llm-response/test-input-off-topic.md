# LLM Test Input: Off-Topic Question

**Scenario:** User is currently in `lesson1` and asks an off-topic question unrelated to math tutoring.

**Expected LLM Action:** `null` or `generalResponse`, with `responseText` politely declining or redirecting back to the lesson.

```json
{
  "currentUserMessage": "What's the weather like today?",
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
      "progressPercentage": 20
    },
    "currentQuiz": null,
    "progressHistory": [],
    "recentInteractions": [
      { "user": "Let's begin" },
      { "ai_response": { "action": { "type": "showLessonOverview", "payload": { "lessonId": "lesson1" } } } }
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
  "responseText": "I'm here to help you learn math! Let's focus on our 'Introduction to Numbers' lesson. What would you like to do next?"
}