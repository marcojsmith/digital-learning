import type { Lesson, Subject } from "@/types"

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
  {
    id: "lesson1",
    title: "Addition",
    subject: "math",
    progress: "completed",
    content: `
      <p>Addition is the process of combining two or more numbers together to find their <strong>sum</strong>. When we add numbers, we are essentially counting how many objects we have in total.</p>
      <p>For example, if you have 2 apples and someone gives you 3 more apples, you would use addition to find out that you now have 5 apples in total: 2 + 3 = 5.</p>
      <img src="https://via.placeholder.com/450x280/2a9d8f/ffffff?text=Addition+Example" alt="Illustration of addition with apples" class="lesson-image">
      <p>The plus sign (<strong>+</strong>) is used to show addition. The numbers being added are called <strong>addends</strong>.</p>
    `,
    quiz: {
      question: "What is <strong>2 + 3</strong>?",
      options: [
        { text: "4", correct: false },
        { text: "5", correct: true },
        { text: "6", correct: false },
      ],
    },
    nextLesson: "lesson2",
  },
  {
    id: "lesson2",
    title: "Subtraction",
    subject: "math",
    progress: "in-progress",
    content: `
      <p>Subtraction is taking away one number from another to find the <strong>difference</strong>. When we subtract, we are finding out how many are left after removing some objects.</p>
      <p>For example, if you have 5 oranges and you eat 2 of them, you would use subtraction to find out that you have 3 oranges left: 5 - 2 = 3.</p>
      <img src="https://via.placeholder.com/450x280/e9c46a/264653?text=Subtraction+Example" alt="Illustration of subtraction with oranges" class="lesson-image">
      <p>The minus sign (<strong>-</strong>) is used to show subtraction. The number being subtracted is called the <strong>subtrahend</strong>, the number you're subtracting from is called the <strong>minuend</strong>.</p>
    `,
    quiz: {
      question: "What is <strong>5 - 2</strong>?",
      options: [
        { text: "2", correct: false },
        { text: "3", correct: true },
        { text: "4", correct: false },
      ],
    },
    prevLesson: "lesson1",
    nextLesson: "lesson5",
  },
  {
    id: "lesson5",
    title: "Multiplication",
    subject: "math",
    progress: "not-started",
    content: `
      <p>Multiplication is like repeated addition. It's a quick way to add the same number multiple times.</p>
      <p>For example, 3 x 4 means adding 3 four times (3 + 3 + 3 + 3) or adding 4 three times (4 + 4 + 4). Both equal 12.</p>
      <img src="https://via.placeholder.com/450x280/f4a261/ffffff?text=Multiplication+Example" alt="Multiplication Illustration" class="lesson-image">
      <p>The numbers being multiplied are called <strong>factors</strong>, and the result is called the <strong>product</strong>. The symbol 'x' or sometimes '*' is used.</p>
    `,
    quiz: {
      question: "What is <strong>3 x 4</strong>?",
      options: [
        { text: "7", correct: false },
        { text: "12", correct: true },
        { text: "1", correct: false },
      ],
    },
    prevLesson: "lesson2",
    nextLesson: "lesson6",
  },
  {
    id: "lesson6",
    title: "Division",
    subject: "math",
    progress: "not-started",
    content: `
      <p>Division is splitting a number into equal groups. It's the opposite of multiplication.</p>
      <p>For example, 12 ÷ 4 asks how many groups of 4 are in 12. The answer is 3.</p>
      <img src="https://via.placeholder.com/450x280/e76f51/ffffff?text=Division+Example" alt="Division Illustration" class="lesson-image">
      <p>The number being divided is the <strong>dividend</strong>, the number dividing it is the <strong>divisor</strong>, and the result is the <strong>quotient</strong>. The symbol '÷' or '/' is used.</p>
    `,
    quiz: {
      question: "What is <strong>12 ÷ 4</strong>?",
      options: [
        { text: "3", correct: true },
        { text: "8", correct: false },
        { text: "16", correct: false },
      ],
    },
    prevLesson: "lesson5",
    nextLesson: "lesson3",
  },
  {
    id: "lesson3",
    title: "Plants",
    subject: "science",
    progress: "not-started",
    content: `
      <p>Plants are living organisms belonging to the kingdom Plantae. They are essential for life on Earth.</p>
      <p>Most plants perform <strong>photosynthesis</strong>, using sunlight, water, and carbon dioxide to create their own food (sugar) and release oxygen.</p>
      <img src="https://via.placeholder.com/450x280/2a9d8f/ffffff?text=Plant+Parts" alt="Illustration of a plant with labeled parts" class="lesson-image">
      <p>Key parts often include roots (absorb water/nutrients), stems (support), leaves (photosynthesis), flowers (reproduction), and fruits (contain seeds).</p>
    `,
    quiz: {
      question: "What process do plants use to make food?",
      options: [
        { text: "Respiration", correct: false },
        { text: "Photosynthesis", correct: true },
        { text: "Absorption", correct: false },
      ],
    },
    prevLesson: "lesson6",
    nextLesson: "lesson4",
  },
  {
    id: "lesson4",
    title: "Animals",
    subject: "science",
    progress: "not-started",
    content: `
      <p>Animals are multicellular organisms from the kingdom Animalia. Unlike plants, they cannot make their own food and must consume other organisms (plants or other animals) for energy.</p>
      <p>Animals exhibit diverse forms, habitats, and behaviors. They are broadly classified into vertebrates (with backbones) and invertebrates (without backbones).</p>
      <img src="https://via.placeholder.com/450x280/e9c46a/264653?text=Animal+Diversity" alt="Illustration of various animals" class="lesson-image">
      <p>Major groups include mammals, birds, reptiles, amphibians, fish, insects, mollusks, and more.</p>
    `,
    quiz: {
      question: "Which group do animals belong to?",
      options: [
        { text: "Plantae", correct: false },
        { text: "Animalia", correct: true },
        { text: "Fungi", correct: false },
      ],
    },
    prevLesson: "lesson3",
    nextLesson: "lesson7",
  },
  {
    id: "lesson7",
    title: "Weather",
    subject: "science",
    progress: "not-started",
    content: `
      <p>Weather refers to the state of the atmosphere at a particular place and time, including temperature, humidity, precipitation (rain, snow), wind, and cloud cover.</p>
      <p>It is driven by differences in air pressure, temperature, and moisture, often influenced by the sun's energy.</p>
      <img src="https://via.placeholder.com/450x280/f4a261/ffffff?text=Weather+Symbols" alt="Weather symbols illustration" class="lesson-image">
      <p>Meteorologists study weather patterns to make forecasts. Common weather phenomena include rain, sunshine, storms, fog, and wind.</p>
    `,
    quiz: {
      question: "What term describes rain, snow, or hail falling from clouds?",
      options: [
        { text: "Humidity", correct: false },
        { text: "Precipitation", correct: true },
        { text: "Temperature", correct: false },
      ],
    },
    prevLesson: "lesson4",
    nextLesson: "lesson8",
  },
  {
    id: "lesson8",
    title: "Grammar Basics",
    subject: "language",
    progress: "not-started",
    content: `
      <p>Grammar is the set of rules governing how words are combined to form sentences in a language.</p>
      <p>Key components include parts of speech (nouns, verbs, adjectives, adverbs, etc.), sentence structure (subject, predicate), punctuation (periods, commas), and tense (past, present, future).</p>
      <img src="https://via.placeholder.com/450x280/e76f51/ffffff?text=Sentence+Structure" alt="Grammar illustration" class="lesson-image">
      <p>Understanding grammar helps us communicate clearly and effectively in writing and speaking.</p>
    `,
    quiz: {
      question: "What part of speech describes an action or state of being?",
      options: [
        { text: "Noun", correct: false },
        { text: "Adjective", correct: false },
        { text: "Verb", correct: true },
      ],
    },
    prevLesson: "lesson7",
    nextLesson: "lesson9",
  },
  {
    id: "lesson9",
    title: "Reading Comprehension",
    subject: "language",
    progress: "not-started",
    content: `
      <p>Reading comprehension is the ability to read text, process it, and understand its meaning.</p>
      <p>It involves identifying the main idea, understanding vocabulary in context, making inferences, understanding sequence, and recognizing details.</p>
      <img src="https://via.placeholder.com/450x280/2a9d8f/ffffff?text=Reading+a+Book" alt="Reading illustration" class="lesson-image">
      <p>Strong reading comprehension is crucial for learning and understanding information from various sources.</p>
    `,
    quiz: {
      question: "What is the main goal of reading comprehension?",
      options: [
        { text: "Reading quickly", correct: false },
        { text: "Understanding the meaning", correct: true },
        { text: "Memorizing words", correct: false },
      ],
    },
    prevLesson: "lesson8",
  },
]

