import type { Lesson, Subject, LessonQuiz } from "@/types" // Import LessonQuiz

export const subjects: Subject[] = [
  {
    id: "math",
    name: "Mathematics",
    icon: "🧮",
    lessons: ["lesson1", "lesson2", "lesson5", "lesson6"],
  },
  {
    id: "science",
    name: "Science",
    icon: "🔬",
    lessons: ["lesson3", "lesson4", "lesson7"],
  },
  {
    id: "language",
    name: "Language Arts",
    icon: "📚",
    lessons: ["lesson8", "lesson9"],
  },
]

// Removed extractText function as content is now Markdown

export const lessons: Lesson[] = [
  // Lesson 1
  {
    id: "lesson1",
    title: "Addition",
    subject: "math",
    progress: "completed",
    contentMarkdown: `
Addition is the process of combining two or more numbers together to find their **sum**. When we add numbers, we are essentially counting how many objects we have in total.

For example, if you have 2 apples and someone gives you 3 more apples, you would use addition to find out that you now have 5 apples in total: 2 + 3 = 5.

The plus sign (**+**) is used to show addition. The numbers being added are called **addends**.
    `,
    concepts: ["addition", "sum", "addends"], // Added example concepts
    quizzes: [
      {
        id: "quiz1", // Assign an ID to the quiz
        title: "Addition Quiz", // Give the quiz a title
        type: "multiple-choice", // Set type
        concepts: ["addition"], // Link concepts
        question: "What is **2 + 3**?", // Use Markdown
        options: [ // Keep options
          { text: "4", correct: false },
          { text: "5", correct: true },
          { text: "6", correct: false },
        ],
      } as LessonQuiz // Type assertion might be needed depending on TS strictness
    ],
    nextLesson: "lesson2",
  },
  // Lesson 2
  {
    id: "lesson2",
    title: "Subtraction",
    subject: "math",
    progress: "in-progress",
    contentMarkdown: `
Subtraction is taking away one number from another to find the **difference**. When we subtract, we are finding out how many are left after removing some objects.

For example, if you have 5 oranges and you eat 2 of them, you would use subtraction to find out that you have 3 oranges left: 5 - 2 = 3.

The minus sign (**-**) is used to show subtraction. The number being subtracted is called the **subtrahend**, the number you're subtracting from is called the **minuend**.
    `,
    concepts: ["subtraction", "difference", "minuend", "subtrahend"],
    quizzes: [
      {
        id: "quiz1",
        title: "Subtraction Quiz",
        type: "multiple-choice",
        concepts: ["subtraction"],
        question: "What is **5 - 2**?", // Use Markdown
        options: [
          { text: "2", correct: false },
          { text: "3", correct: true },
          { text: "4", correct: false },
        ],
      } as LessonQuiz
    ],
    prevLesson: "lesson1",
    nextLesson: "lesson5",
  },
  // Lesson 5
  {
    id: "lesson5",
    title: "Multiplication",
    subject: "math",
    progress: "not-started",
    contentMarkdown: `
Multiplication is like repeated addition. It's a quick way to add the same number multiple times.

For example, 3 x 4 means adding 3 four times (3 + 3 + 3 + 3) or adding 4 three times (4 + 4 + 4). Both equal 12.

The numbers being multiplied are called **factors**, and the result is called the **product**. The symbol 'x' or sometimes '*' is used.
    `,
    concepts: ["multiplication", "factors", "product", "repeated addition"],
    quizzes: [
      {
        id: "quiz1",
        title: "Multiplication Quiz",
        type: "multiple-choice",
        concepts: ["multiplication"],
        question: "What is **3 x 4**?", // Use Markdown
        options: [
          { text: "7", correct: false },
          { text: "12", correct: true },
          { text: "1", correct: false },
        ],
      } as LessonQuiz
    ],
    prevLesson: "lesson2",
    nextLesson: "lesson6",
  },
  // Lesson 6
  {
    id: "lesson6",
    title: "Division",
    subject: "math",
    progress: "not-started",
    contentMarkdown: `
Division is splitting a number into equal groups. It's the opposite of multiplication.

For example, 12 ÷ 4 asks how many groups of 4 are in 12. The answer is 3.

The number being divided is the **dividend**, the number dividing it is the **divisor**, and the result is the **quotient**. The symbol '÷' or '/' is used.
    `,
    concepts: ["division", "dividend", "divisor", "quotient", "equal groups"],
    quizzes: [
      {
        id: "quiz1",
        title: "Division Quiz",
        type: "multiple-choice",
        concepts: ["division"],
        question: "What is **12 ÷ 4**?", // Use Markdown
        options: [
          { text: "3", correct: true },
          { text: "8", correct: false },
          { text: "16", correct: false },
        ],
      } as LessonQuiz
    ],
    prevLesson: "lesson5",
    nextLesson: "lesson3", // Assuming cycle for example data
  },
  // Lesson 3
  {
    id: "lesson3",
    title: "Plants",
    subject: "science",
    progress: "not-started",
    contentMarkdown: `
Plants are living organisms belonging to the kingdom Plantae. They are essential for life on Earth.

Most plants perform **photosynthesis**, using sunlight, water, and carbon dioxide to create their own food (sugar) and release oxygen.

Key parts often include roots (absorb water/nutrients), stems (support), leaves (photosynthesis), flowers (reproduction), and fruits (contain seeds).
    `,
    concepts: ["plants", "photosynthesis", "roots", "stems", "leaves"],
    quizzes: [
      {
        id: "quiz1",
        title: "Plant Quiz",
        type: "multiple-choice",
        concepts: ["photosynthesis"],
        question: "What process do plants use to make food?",
        options: [
          { text: "Respiration", correct: false },
          { text: "Photosynthesis", correct: true },
          { text: "Absorption", correct: false },
        ],
      } as LessonQuiz
    ],
    prevLesson: "lesson6",
    nextLesson: "lesson4",
  },
  // Lesson 4
  {
    id: "lesson4",
    title: "Animals",
    subject: "science",
    progress: "not-started",
    contentMarkdown: `
Animals are multicellular organisms from the kingdom Animalia. Unlike plants, they cannot make their own food and must consume other organisms (plants or other animals) for energy.

Animals exhibit diverse forms, habitats, and behaviors. They are broadly classified into vertebrates (with backbones) and invertebrates (without backbones).

Major groups include mammals, birds, reptiles, amphibians, fish, insects, mollusks, and more.
    `,
    concepts: ["animals", "kingdom animalia", "vertebrates", "invertebrates"],
    quizzes: [
      {
        id: "quiz1",
        title: "Animal Quiz",
        type: "multiple-choice",
        concepts: ["animal classification"],
        question: "Which group do animals belong to?",
        options: [
          { text: "Plantae", correct: false },
          { text: "Animalia", correct: true },
          { text: "Fungi", correct: false },
        ],
      } as LessonQuiz
    ],
    prevLesson: "lesson3",
    nextLesson: "lesson7",
  },
  // Lesson 7
  {
    id: "lesson7",
    title: "Weather",
    subject: "science",
    progress: "not-started",
    contentMarkdown: `
Weather refers to the state of the atmosphere at a particular place and time, including temperature, humidity, precipitation (rain, snow), wind, and cloud cover.

It is driven by differences in air pressure, temperature, and moisture, often influenced by the sun's energy.

Meteorologists study weather patterns to make forecasts. Common weather phenomena include rain, sunshine, storms, fog, and wind.
    `,
    concepts: ["weather", "atmosphere", "temperature", "humidity", "precipitation", "wind"],
    quizzes: [
      {
        id: "quiz1",
        title: "Weather Quiz",
        type: "multiple-choice",
        concepts: ["weather terms"],
        question: "What term describes rain, snow, or hail falling from clouds?",
        options: [
          { text: "Humidity", correct: false },
          { text: "Precipitation", correct: true },
          { text: "Temperature", correct: false },
        ],
      } as LessonQuiz
    ],
    prevLesson: "lesson4",
    nextLesson: "lesson8",
  },
  // Lesson 8
  {
    id: "lesson8",
    title: "Grammar Basics",
    subject: "language",
    progress: "not-started",
    contentMarkdown: `
Grammar is the set of rules governing how words are combined to form sentences in a language.

Key components include parts of speech (nouns, verbs, adjectives, adverbs, etc.), sentence structure (subject, predicate), punctuation (periods, commas), and tense (past, present, future).

Understanding grammar helps us communicate clearly and effectively in writing and speaking.
    `,
    concepts: ["grammar", "parts of speech", "sentence structure", "punctuation", "tense"],
    quizzes: [
      {
        id: "quiz1",
        title: "Grammar Quiz",
        type: "multiple-choice",
        concepts: ["parts of speech"],
        question: "What part of speech describes an action or state of being?",
        options: [
          { text: "Noun", correct: false },
          { text: "Adjective", correct: false },
          { text: "Verb", correct: true },
        ],
      } as LessonQuiz
    ],
    prevLesson: "lesson7",
    nextLesson: "lesson9",
  },
  // Lesson 9
  {
    id: "lesson9",
    title: "Reading Comprehension",
    subject: "language",
    progress: "not-started",
    contentMarkdown: `
Reading comprehension is the ability to read text, process it, and understand its meaning.

It involves identifying the main idea, understanding vocabulary in context, making inferences, understanding sequence, and recognizing details.

Strong reading comprehension is crucial for learning and understanding information from various sources.
    `,
    concepts: ["reading comprehension", "main idea", "inference", "vocabulary in context"],
    quizzes: [
      {
        id: "quiz1",
        title: "Reading Quiz",
        type: "multiple-choice",
        concepts: ["reading comprehension"],
        question: "What is the main goal of reading comprehension?",
        options: [
          { text: "Reading quickly", correct: false },
          { text: "Understanding the meaning", correct: true },
          { text: "Memorizing words", correct: false },
        ],
      } as LessonQuiz
    ],
    prevLesson: "lesson8",
    // No next lesson for the last one
  },
]
