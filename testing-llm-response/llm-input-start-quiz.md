# LLM Input Example: Start First Quiz

This file contains an example JSON input object to send to the LLM when the user, currently in an active lesson (e.g., "lesson1"), asks to start the first quiz/activity.

```json
{
  "currentUserMessage": "Okay, show me the first activity",
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
          { "id": "quizA", "title": "Number Recognition", "type": "multiple-choice", "concepts": ["number_identity"], "items": [] }
        ],
        "nextLesson": "lesson2",
        "prevLesson": null
      },
      "startTime": "2025-03-31T08:05:00.000Z",
      "progressPercentage": 0
    },
    "currentQuiz": null,
    "progressHistory": [],
    "recentInteractions": [
      { "user": "Let's begin" },
      { "ai_response": { } }
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
      { "id": "quizA", "title": "Number Recognition", "type": "multiple-choice", "concepts": ["number_identity"], "items": [] }
    ],
    "nextLesson": "lesson2",
    "prevLesson": null
  }
}

## Expected LLM Response

```json
{
  "responseText": "Okay, here's the first activity for this lesson: 'Number Recognition'.",
  "action": {
    "type": "showQuiz",
    "payload": {
      "lessonId": "lesson1",
      "quizId": "quizA"
    }
  }
}