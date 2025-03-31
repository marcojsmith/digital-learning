# LLM Input Example: Start First Lesson

This file contains an example JSON input object to send to the LLM when the user indicates they want to start the first lesson, and no lesson is currently active.

```json
{
  "currentUserMessage": "Let's begin",
  "currentLlmContext": {
    "studentProfile": {
      "name": "Alex",
      "grade": 5,
      "age": 10,
      "learningStyle": "Visual",
      "challenges": []
    },
    "currentLesson": null,
    "currentQuiz": null,
    "progressHistory": [],
    "recentInteractions": [],
    "conceptsIntroduced": [],
    "conceptsMastered": [],
    "conceptsStruggling": []
  },
  "availableLessons": {
    "lesson1": "Introduction to Numbers",
    "lesson2": "Basic Addition",
    "lesson3": "Counting Objects"
  },
  "currentLessonData": null
}

## Expected LLM Response

```json
{
  "responseText": "Great! Let's begin with lesson 'Introduction to Numbers'. I'll bring up the overview.",
  "action": {
    "type": "showLessonOverview",
    "payload": { "lessonId": "lesson1" }
  }
}