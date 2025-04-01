# LLM Input Example: User Answers Quiz

This file contains an example JSON input object to send to the LLM when the user provides an answer to an active quiz (e.g., "quizA" within "lesson1").

```json
{
  "currentUserMessage": "I think it's 5",
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
          {
            "id": "quizA",
            "title": "Number Recognition",
            "type": "multiple-choice",
            "concepts": ["number_identity"],
            "items": [
              {
                "question": "What number comes after 4?",
                "options": [
                  { "text": "3", "correct": false },
                  { "text": "5", "correct": true },
                  { "text": "6", "correct": false }
                ]
              }
            ]
          }
        ],
        "nextLesson": "lesson2",
        "prevLesson": null
      },
      "startTime": "2025-03-31T08:05:00.000Z",
      "progressPercentage": 0
    },
    "currentQuiz": {
      "id": "quizA",
      "data": {
         "id": "quizA",
         "title": "Number Recognition",
         "type": "multiple-choice",
         "concepts": ["number_identity"],
         "items": [
           {
             "question": "What number comes after 4?",
             "options": [
               { "text": "3", "correct": false },
               { "text": "5", "correct": true },
               { "text": "6", "correct": false }
             ]
           }
         ]
      },
      "startTime": "2025-03-31T08:08:00.000Z",
      "attempts": 0,
      "answers": {},
      "correctCount": 0
    },
    "progressHistory": [],
    "recentInteractions": [
      { "user": "Let's begin" },
      { "ai_response": { "responseText": "Great! Let's begin...", "action": { "type": "displayLessonContent", "payload": { "lessonId": "lesson1" } } } },
      { "user": "Okay, show me the first activity" },
      { "ai_response": { "responseText": "Okay, here's the first activity...", "action": { "type": "showQuiz", "payload": { "lessonId": "lesson1", "quizId": "quizA" } } } }
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
      {
        "id": "quizA",
        "title": "Number Recognition",
        "type": "multiple-choice",
        "concepts": ["number_identity"],
        "items": [
          {
            "question": "What number comes after 4?",
            "options": [
              { "text": "3", "correct": false },
              { "text": "5", "correct": true },
              { "text": "6", "correct": false }
            ]
          }
        ]
      }
    ],
    "nextLesson": "lesson2",
    "prevLesson": null
  }
}

## Expected LLM Response

```json
{
  "responseText": "Yes, that's correct! 5 comes after 4. Great job!",
  "contextUpdates": {
    "conceptsMastered": [
      "number_identity"
    ]
  }
}