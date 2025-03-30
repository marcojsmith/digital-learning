import type { AssistantData } from "@/types/assistant"

export const assistantData: AssistantData[] = [
  {
    lessonId: "lesson1",
    title: "Addition",
    introduction:
      "Let's explore addition together! Addition is the process of combining numbers to find their sum. I'll guide you through the key concepts and provide helpful examples.",
    concepts: [
      {
        id: "lesson1-concept1",
        title: "Understanding Addends and Sum",
        description: 'In addition, the numbers being added are called "addends", and the result is called the "sum".',
        example: "2 + 3 = 5\nHere, 2 and 3 are addends, and 5 is the sum.",
        tip: "Think of addition as combining groups of objects together.",
      },
      {
        id: "lesson1-concept2",
        title: "Addition Properties",
        description:
          "Addition has the commutative property, which means you can add numbers in any order and get the same result.",
        example: "4 + 3 = 7 is the same as 3 + 4 = 7",
      },
      {
        id: "lesson1-concept3",
        title: "Mental Math Strategies",
        description: "Breaking numbers apart can make addition easier.",
        example: "To add 8 + 7, you can think of it as 8 + 2 + 5 = 10 + 5 = 15",
        quiz: {
          question: "What is 9 + 6?",
          options: [
            { id: "a", text: "13", correct: false, explanation: "Not quite. Try again!" },
            {
              id: "b",
              text: "15",
              correct: true,
              explanation: "Correct! You can think of this as 9 + 1 + 5 = 10 + 5 = 15",
            },
            { id: "c", text: "16", correct: false, explanation: "That's not right. Try again!" },
          ],
        },
      },
    ],
  },
  {
    lessonId: "lesson2",
    title: "Subtraction",
    introduction:
      "Let's explore subtraction together! Subtraction is finding the difference between numbers. I'll help you understand the key concepts with examples.",
    concepts: [
      {
        id: "lesson2-concept1",
        title: "Understanding Minuend, Subtrahend, and Difference",
        description:
          'In subtraction, the number being subtracted from is the "minuend", the number being subtracted is the "subtrahend", and the result is the "difference".',
        example: "8 - 3 = 5\nHere, 8 is the minuend, 3 is the subtrahend, and 5 is the difference.",
        tip: "Think of subtraction as taking away or finding what's left.",
      },
      {
        id: "lesson2-concept2",
        title: "Subtraction as the Inverse of Addition",
        description: "Subtraction undoes addition. If a + b = c, then c - b = a.",
        example: "If 4 + 5 = 9, then 9 - 5 = 4",
      },
      {
        id: "lesson2-concept3",
        title: "Mental Math for Subtraction",
        description: "For subtraction, you can count up from the smaller number to the larger number.",
        example: "To find 12 - 9, count up from 9 to 12: 9→10 (1), 10→11 (2), 11→12 (3). So 12 - 9 = 3",
        quiz: {
          question: "What is 15 - 7?",
          options: [
            { id: "a", text: "7", correct: false, explanation: "Not quite. Try again!" },
            { id: "b", text: "8", correct: true, explanation: "Correct! 15 - 7 = 8" },
            { id: "c", text: "9", correct: false, explanation: "That's not right. Try again!" },
          ],
        },
      },
    ],
  },
  {
    lessonId: "lesson5",
    title: "Multiplication",
    introduction:
      "Let's explore multiplication together! Multiplication is a quick way to add the same number multiple times. I'll help you understand the key concepts.",
    concepts: [
      {
        id: "lesson5-concept1",
        title: "Multiplication as Repeated Addition",
        description: "Multiplication is a shortcut for adding the same number multiple times.",
        example: "3 × 4 = 12\nThis is the same as 4 + 4 + 4 = 12",
        tip: "Think of multiplication as creating multiple equal groups.",
      },
      {
        id: "lesson5-concept2",
        title: "Factors and Products",
        description:
          'In multiplication, the numbers being multiplied are called "factors", and the result is the "product".',
        example: "5 × 6 = 30\nHere, 5 and 6 are factors, and 30 is the product.",
      },
      {
        id: "lesson5-concept3",
        title: "Commutative Property",
        description: "Multiplication has the commutative property, which means you can multiply numbers in any order.",
        example: "3 × 7 = 21 is the same as 7 × 3 = 21",
        quiz: {
          question: "What is 6 × 4?",
          options: [
            { id: "a", text: "18", correct: false, explanation: "Not quite. Try again!" },
            { id: "b", text: "24", correct: true, explanation: "Correct! 6 × 4 = 24" },
            { id: "c", text: "30", correct: false, explanation: "That's not right. Try again!" },
          ],
        },
      },
    ],
  },
  {
    lessonId: "lesson6",
    title: "Division",
    introduction:
      "Let's explore division together! Division is about splitting into equal groups. I'll help you understand the key concepts with examples.",
    concepts: [
      {
        id: "lesson6-concept1",
        title: "Division Terminology",
        description:
          'In division, the number being divided is the "dividend", the number dividing it is the "divisor", and the result is the "quotient".',
        example: "12 ÷ 4 = 3\nHere, 12 is the dividend, 4 is the divisor, and 3 is the quotient.",
        tip: "Think of division as splitting into equal groups or finding how many equal groups can be made.",
      },
      {
        id: "lesson6-concept2",
        title: "Division as the Inverse of Multiplication",
        description: "Division undoes multiplication. If a × b = c, then c ÷ b = a.",
        example: "If 5 × 7 = 35, then 35 ÷ 7 = 5",
      },
      {
        id: "lesson6-concept3",
        title: "Division with Remainders",
        description:
          'Sometimes division doesn\'t result in a whole number. The amount left over is called the "remainder".',
        example: "17 ÷ 5 = 3 remainder 2\nThis means 17 = (5 × 3) + 2",
        quiz: {
          question: "What is 20 ÷ 3?",
          options: [
            { id: "a", text: "6 remainder 2", correct: true, explanation: "Correct! 20 ÷ 3 = 6 remainder 2" },
            { id: "b", text: "6", correct: false, explanation: "Not quite. Don't forget the remainder!" },
            { id: "c", text: "7", correct: false, explanation: "That's not right. Try again!" },
          ],
        },
      },
    ],
  },
  {
    lessonId: "lesson3",
    title: "Plants",
    introduction:
      "Let's explore the fascinating world of plants! Plants are essential for life on Earth. I'll help you understand their key parts and processes.",
    concepts: [
      {
        id: "lesson3-concept1",
        title: "Photosynthesis",
        description:
          "Photosynthesis is the process plants use to make their own food using sunlight, water, and carbon dioxide.",
        example: "During photosynthesis:\nSunlight + Water + Carbon Dioxide → Glucose (sugar) + Oxygen",
        tip: "Photosynthesis happens mainly in the leaves, which contain chlorophyll that gives plants their green color.",
      },
      {
        id: "lesson3-concept2",
        title: "Plant Parts and Functions",
        description: "Plants have specialized parts that help them survive and reproduce.",
        example:
          "- Roots: Absorb water and nutrients from soil\n- Stem: Supports the plant and transports materials\n- Leaves: Main site of photosynthesis\n- Flowers: Reproductive structures",
      },
      {
        id: "lesson3-concept3",
        title: "Plant Life Cycle",
        description: "Plants go through various stages in their life cycle, from seed to mature plant.",
        example: "Seed → Germination → Seedling → Mature Plant → Flowering → Seed Production",
        quiz: {
          question: "Which plant part is primarily responsible for absorbing water and nutrients?",
          options: [
            {
              id: "a",
              text: "Leaves",
              correct: false,
              explanation: "Leaves are mainly for photosynthesis, not absorption from soil.",
            },
            {
              id: "b",
              text: "Roots",
              correct: true,
              explanation: "Correct! Roots absorb water and nutrients from the soil.",
            },
            {
              id: "c",
              text: "Flowers",
              correct: false,
              explanation: "Flowers are for reproduction, not absorbing nutrients.",
            },
          ],
        },
      },
    ],
  },
  // Add data for other lessons as needed
  {
    lessonId: "lesson4",
    title: "Animals",
    introduction:
      "Let's explore the amazing world of animals! Animals are diverse and fascinating creatures. I'll help you understand key concepts about animal classification and characteristics.",
    concepts: [
      {
        id: "lesson4-concept1",
        title: "Animal Classification",
        description: "Animals are classified into different groups based on their characteristics.",
        example:
          "- Mammals: Have fur/hair and produce milk (dogs, humans)\n- Birds: Have feathers and lay eggs (eagles, penguins)\n- Reptiles: Have scales and lay eggs (snakes, turtles)\n- Amphibians: Live in water and land (frogs, salamanders)\n- Fish: Have gills and live in water (salmon, sharks)",
        tip: "Vertebrates have backbones, while invertebrates don't.",
      },
      {
        id: "lesson4-concept2",
        title: "Animal Adaptations",
        description: "Animals have special features that help them survive in their environments.",
        example:
          "- Camouflage: Animals blend in with their surroundings\n- Migration: Animals travel to find food or better climate\n- Hibernation: Animals sleep during winter to conserve energy",
      },
      {
        id: "lesson4-concept3",
        title: "Food Chains and Webs",
        description: "Food chains show how energy flows from one organism to another in an ecosystem.",
        example: "Sun → Plants → Herbivores → Carnivores\nFor example: Sun → Grass → Rabbit → Fox",
        quiz: {
          question: "Which group of animals has feathers and typically lays eggs?",
          options: [
            { id: "a", text: "Mammals", correct: false, explanation: "Mammals have fur or hair, not feathers." },
            { id: "b", text: "Birds", correct: true, explanation: "Correct! Birds have feathers and lay eggs." },
            { id: "c", text: "Reptiles", correct: false, explanation: "Reptiles have scales, not feathers." },
          ],
        },
      },
    ],
  },
]

