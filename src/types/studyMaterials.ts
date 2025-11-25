export type GeneratedContent = {
  summary: string;
  flashcards: Array<{ question: string; answer: string }>;
  mcqs: Array<{ question: string; options: string[]; correctAnswer: number }>;
  trueFalse: Array<{ statement: string; answer: boolean }>;
  definitions: Array<{ term: string; definition: string }>;
  kidsExplanation: string;
  professionalExplanation: string;
};
