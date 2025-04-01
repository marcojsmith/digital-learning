import type { Lesson, Subject, LessonQuiz } from "@/types"

// Note: This data structure matches the updated types/index.ts

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

export const lessons: Lesson[] = [
  // Lesson 1 - Updated with multiple quizzes from example
  {
    id: "lesson1",
    // lessonId: "numbersTo100k", // Keep original ID if needed, but use "lesson1" consistently
    title: "Numbers 0 to 100,000", // Updated title
    subject: "math",
    progress: "completed", // Keep progress state
    contentMarkdown: `This lesson focuses on understanding and working with numbers up to 100,000. You will learn to identify numbers represented by place value, complete number expansions, and understand the place value of each digit in a number.`, // Simplified description
    concepts: ["place value", "number expansion", "reading numbers"],
    quizzes: [ // Array of quizzes
        {
            "id": "quiz1", // Keep original quiz ID structure
            "title": "Complete the following additions:",
            "type": "list",
            "concepts": ["place value addition"],
            "items": [
                { "letter": "a", "question": "90 000 + 5000 + 600 + 10 + 8 = ", "answer": "95,618" },
                { "letter": "b", "question": "70 000 + 3000 + 400 + 90 + 1 = ", "answer": "73,491" },
                { "letter": "c", "question": "50 000 + 4000 + 300 + 10 = ", "answer": "54,310" },
                { "letter": "d", "question": "90 000 + 4000 + 80 + 7 = ", "answer": "94,087" },
                { "letter": "e", "question": "90 000 + 9 = ", "answer": "90,009" }
            ]
        },
        {
            "id": "quiz2",
            "title": "Complete the place value table:",
            "type": "table",
            "concepts": ["identifying place value"],
            "headers": ["", "Number", "Ten thousands", "Thousands", "Hundreds", "Tens", "Units"],
            "rows": [
                { "letter": "a", "number": "92 578", "tenThousands": "9", "thousands": "2", "hundreds": "5", "tens": "7", "units": "8" },
                { "letter": "b", "number": "38 201", "tenThousands": "3", "thousands": "8", "hundreds": "2", "tens": "0", "units": "1" },
                { "letter": "c", "number": "40 002", "tenThousands": "4", "thousands": "0", "hundreds": "0", "tens": "0", "units": "2" },
                { "letter": "d", "number": "31 420", "tenThousands": "3", "thousands": "1", "hundreds": "4", "tens": "2", "units": "0" },
                { "letter": "e", "number": "90 706", "tenThousands": "9", "thousands": "0", "hundreds": "7", "tens": "0", "units": "6" }
            ]
        },
        {
            "id": "quiz3",
            "title": "Complete the following expansions:",
            "type": "expansions",
            "concepts": ["number expansion"],
            "items": [
                { "letter": "a", "number": "91 742", "expansion": "9 ten thousands + 1 thousand + 7 hundreds + 4 tens + 2 units", "isExample": true },
                { "letter": "b", "number": "82 293", "expansion": "8 ten thousands + 2 thousands + 2 hundreds + 9 tens + 3 units" },
                { "letter": "c", "number": "99 999", "expansion": "9 ten thousands + 9 thousands + 9 hundreds + 9 tens + 9 units" },
                { "letter": "d", "number": "70 004", "expansion": "7 ten thousands + 0 thousands + 0 hundreds + 0 tens + 4 units" },
                { "letter": "e", "number": "65 005", "expansion": "6 ten thousands + 5 thousands + 0 hundreds + 0 tens + 5 units" }
            ]
        }
    ],
    nextLesson: "lesson2", // Keep navigation links
  },
  // Lesson 2 - Keep original structure for now, add quiz array
  {
    id: "lesson2",
    title: "Subtraction",
    subject: "math",
    progress: "in-progress",
    contentMarkdown: `
      <p>Subtraction is taking away one number from another to find the <strong>difference</strong>. When we subtract, we are finding out how many are left after removing some objects.</p>
      <p>For example, if you have 5 oranges and you eat 2 of them, you would use subtraction to find out that you have 3 oranges left: 5 - 2 = 3.</p>
      <p>The minus sign (<strong>-</strong>) is used to show subtraction. The number being subtracted is called the <strong>subtrahend</strong>, the number you're subtracting from is called the <strong>minuend</strong>.</p>
    `,
    concepts: ["subtraction", "difference", "minuend", "subtrahend"],
    quizzes: [
      {
        id: "quiz1", // Only one quiz for this lesson
        title: "Subtraction Quiz",
        type: "multiple-choice",
        concepts: ["subtraction"],
        question: "What is <strong>5 - 2</strong>?",
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
  // Lesson 5 - Keep original structure, add quiz array
  {
    id: "lesson5",
    title: "Multiplication",
    subject: "math",
    progress: "not-started",
    contentMarkdown: `
      <p>Multiplication is like repeated addition. It's a quick way to add the same number multiple times.</p>
      <p>For example, 3 x 4 means adding 3 four times (3 + 3 + 3 + 3) or adding 4 three times (4 + 4 + 4). Both equal 12.</p>
      <p>The numbers being multiplied are called <strong>factors</strong>, and the result is called the <strong>product</strong>. The symbol 'x' or sometimes '*' is used.</p>
    `,
    concepts: ["multiplication", "factors", "product", "repeated addition"],
    quizzes: [
      {
        id: "quiz1",
        title: "Multiplication Quiz",
        type: "multiple-choice",
        concepts: ["multiplication"],
        question: "What is <strong>3 x 4</strong>?",
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
   // Lesson 6 - Keep original structure, add quiz array
  {
    id: "lesson6",
    title: "Division",
    subject: "math",
    progress: "not-started",
    contentMarkdown: `
      <p>Division is splitting a number into equal groups. It's the opposite of multiplication.</p>
      <p>For example, 12 ÷ 4 asks how many groups of 4 are in 12. The answer is 3.</p>
      <p>The number being divided is the <strong>dividend</strong>, the number dividing it is the <strong>divisor</strong>, and the result is the <strong>quotient</strong>. The symbol '÷' or '/' is used.</p>
    `,
    concepts: ["division", "dividend", "divisor", "quotient", "equal groups"],
    quizzes: [
      {
        id: "quiz1",
        title: "Division Quiz",
        type: "multiple-choice",
        concepts: ["division"],
        question: "What is <strong>12 ÷ 4</strong>?",
        options: [
          { text: "3", correct: true },
          { text: "8", correct: false },
          { text: "16", correct: false },
        ],
      } as LessonQuiz
    ],
    prevLesson: "lesson5",
    nextLesson: "lesson3",
  },
  // Lesson 3 - Keep original structure, add quiz array
  {
    id: "lesson3",
    title: "Plants",
    subject: "science",
    progress: "not-started",
    contentMarkdown: `
      <p>Plants are living organisms belonging to the kingdom Plantae. They are essential for life on Earth.</p>
      <p>Most plants perform <strong>photosynthesis</strong>, using sunlight, water, and carbon dioxide to create their own food (sugar) and release oxygen.</p>
      <p>Key parts often include roots (absorb water/nutrients), stems (support), leaves (photosynthesis), flowers (reproduction), and fruits (contain seeds).</p>
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
  // Lesson 4 - Keep original structure, add quiz array
  {
    id: "lesson4",
    title: "Animals",
    subject: "science",
    progress: "not-started",
    contentMarkdown: `
      <p>Animals are multicellular organisms from the kingdom Animalia. Unlike plants, they cannot make their own food and must consume other organisms (plants or other animals) for energy.</p>
      <p>Animals exhibit diverse forms, habitats, and behaviors. They are broadly classified into vertebrates (with backbones) and invertebrates (without backbones).</p>
      <p>Major groups include mammals, birds, reptiles, amphibians, fish, insects, mollusks, and more.</p>
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
  // Lesson 7 - Keep original structure, add quiz array
  {
    id: "lesson7",
    title: "Weather",
    subject: "science",
    progress: "not-started",
    contentMarkdown: `
      <p>Weather refers to the state of the atmosphere at a particular place and time, including temperature, humidity, precipitation (rain, snow), wind, and cloud cover.</p>
      <p>It is driven by differences in air pressure, temperature, and moisture, often influenced by the sun's energy.</p>
      <p>Meteorologists study weather patterns to make forecasts. Common weather phenomena include rain, sunshine, storms, fog, and wind.</p>
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
  // Lesson 8 - Keep original structure, add quiz array
  {
    id: "lesson8",
    title: "Grammar Basics",
    subject: "language",
    progress: "not-started",
    contentMarkdown: `
      <p>Grammar is the set of rules governing how words are combined to form sentences in a language.</p>
      <p>Key components include parts of speech (nouns, verbs, adjectives, adverbs, etc.), sentence structure (subject, predicate), punctuation (periods, commas), and tense (past, present, future).</p>
      <p>Understanding grammar helps us communicate clearly and effectively in writing and speaking.</p>
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
  // Lesson 9 - Keep original structure, add quiz array
  {
    id: "lesson9",
    title: "Reading Comprehension",
    subject: "language",
    progress: "not-started",
    contentMarkdown: `
      <p>Reading comprehension is the ability to read text, process it, and understand its meaning.</p>
      <p>It involves identifying the main idea, understanding vocabulary in context, making inferences, understanding sequence, and recognizing details.</p>
      <p>Strong reading comprehension is crucial for learning and understanding information from various sources.</p>
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
  },
]