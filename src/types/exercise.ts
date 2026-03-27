import type { Level } from '../data/topics';

type BaseExercise = {
  levels: Level[];
  instruction: string;
  explanation: string;
};

export type ExerciseFillBlank = BaseExercise & {
  type: 'fill_blank';
  sentence: string;
  hint?: string;
  answer: string;
};

export type ExerciseMultipleChoice = BaseExercise & {
  type: 'multiple_choice';
  sentence: string;
  options: string[];
  correct_index: number;
};

export type ExerciseErrorCorrection = BaseExercise & {
  type: 'error_correction';
  wrong_sentence: string;
  answer: string;
  error_word: string;
  correct_word: string;
};

export type Exercise =
  | ExerciseFillBlank
  | ExerciseMultipleChoice
  | ExerciseErrorCorrection;
