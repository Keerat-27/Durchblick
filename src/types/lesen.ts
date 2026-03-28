export type LesenMultipleChoiceQuestion = {
  type: 'multiple_choice';
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

export type LesenFillBlankQuestion = {
  type: 'fill_blank';
  question: string;
  answer: string;
  explanation: string;
};

export type LesenQuestion =
  | LesenMultipleChoiceQuestion
  | LesenFillBlankQuestion;

export type LesenGeneratedSet = {
  passage: string;
  questions: LesenQuestion[];
};
