export const TOPICS = [
  { id: 'Konjunktiv II', label: 'Konjunktiv II' },
  { id: 'Relativsätze', label: 'Relativsätze' },
  { id: 'Wechselpräpositionen', label: 'Wechselpräpositionen' },
  { id: 'Passiv', label: 'Passiv' },
  { id: 'Kasus (Akkusativ/Dativ)', label: 'Kasus' },
  { id: 'Adjektivdeklination', label: 'Adjektivdeklination' },
  { id: 'Modalverben', label: 'Modalverben' },
  { id: 'Trennbare Verben', label: 'Trennbare Verben' },
  { id: 'Genitiv', label: 'Genitiv' },
] as const;

export type TopicId = (typeof TOPICS)[number]['id'];

export const LEVELS = ['A1', 'A2', 'B1', 'B2'] as const;
export type Level = (typeof LEVELS)[number];

/** How many questions to draw per generated set (same topic + level). */
export const SET_SIZE_OPTIONS = [3, 5, 8] as const;
export type SetSize = (typeof SET_SIZE_OPTIONS)[number];
