# LLM Test Input: Start Specific Lesson

**Scenario:** No lesson is currently active. User asks to start a specific lesson by ID or name (e.g., "lesson2" / "Basic Addition").

**Expected LLM Action:** `actionType: 'displayLessonContent'`, `lessonId: 'lesson2'`.

```json
{
  "currentUserMessage": "Start lesson2",
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
```

## Expected LLM Response

```json
{
  "responseText": "Okay, let's start the 'Basic Addition' lesson. Here's the overview.",
  "actionType": "displayLessonContent",
  "lessonId": "lesson2",
  "quizId": null,
  "flagsPreviousMessageAsInappropriate": false
}
```