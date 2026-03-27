import type { TopicId } from './topics';
import type { Exercise } from '../types/exercise';

export const EXERCISE_BANK: Record<TopicId, Exercise[]> = {
  'Konjunktiv II': [
    {
      levels: ['B1', 'B2'],
      type: 'fill_blank',
      instruction: 'Complete the sentence with the correct Konjunktiv II form.',
      sentence: 'Wenn ich mehr Zeit ___, würde ich jeden Tag Deutsch üben.',
      hint: 'Auxiliary for würde + infinitive clause',
      answer: 'hätte',
      explanation:
        'Konjunktiv II of haben is hätte. Wenn-clauses use Konjunktiv II for unreal present conditions.',
    },
    {
      levels: ['A1', 'A2', 'B1', 'B2'],
      type: 'multiple_choice',
      instruction: 'Choose the correct verb form.',
      sentence: 'Ich wünschte, ich ___ fliegen können.',
      options: ['könnte', 'kann', 'konnte', 'könnt'],
      correct_index: 0,
      explanation:
        'After wünschte, German uses Konjunktiv II: könnte, not the present kann.',
    },
    {
      levels: ['B1', 'B2'],
      type: 'error_correction',
      instruction: 'Correct the grammatical mistake.',
      wrong_sentence: 'Wenn er reich wäre, kauft er sofort ein Haus.',
      answer: 'Wenn er reich wäre, würde er sofort ein Haus kaufen.',
      error_word: 'kauft er',
      correct_word: 'würde er ... kaufen',
      explanation:
        'In unreal wenn-clauses, the main clause typically uses würde + infinitive instead of present tense.',
    },
  ],
  Relativsätze: [
    {
      levels: ['A1', 'A2', 'B1', 'B2'],
      type: 'fill_blank',
      instruction: 'Fill in the correct relative pronoun.',
      sentence: 'Der Mann, ___ dort steht, ist mein Lehrer.',
      hint: 'Masculine singular nominative',
      answer: 'der',
      explanation:
        'Der Mann is masculine; the relative pronoun in the nominative (subject of steht) is der.',
    },
    {
      levels: ['B1', 'B2'],
      type: 'multiple_choice',
      instruction: 'Pick the correct relative pronoun.',
      sentence: 'Das Buch, ___ ich gerade lese, ist sehr spannend.',
      options: ['das', 'welches', 'was', 'deren'],
      correct_index: 0,
      explanation:
        'For neuter nouns (das Buch), the relative pronoun is das in the accusative (ich lese das Buch).',
    },
    {
      levels: ['B1', 'B2'],
      type: 'error_correction',
      instruction: 'Fix the punctuation / relative clause.',
      wrong_sentence: 'Die Frau die ich kenne kommt aus Berlin.',
      answer: 'Die Frau, die ich kenne, kommt aus Berlin.',
      error_word: 'Frau die',
      correct_word: 'Frau, die',
      explanation:
        'Non-defining relative clauses are set off with commas: Die Frau, die ich kenne, ...',
    },
  ],
  Wechselpräpositionen: [
    {
      levels: ['A1', 'A2', 'B1', 'B2'],
      type: 'fill_blank',
      instruction:
        'Choose the correct preposition and case (one word for the blank).',
      sentence: 'Wir laufen ___ den Park. (movement into)',
      hint: 'Wechselpräposition + Akkusativ for motion into',
      answer: 'in den',
      explanation:
        'Motion into an enclosed space uses in + Akkusativ: in den Park.',
    },
    {
      levels: ['B1', 'B2'],
      type: 'multiple_choice',
      instruction: 'Where does the picture hang?',
      sentence: 'Das Bild hängt ___ Wand.',
      options: ['an der', 'auf der', 'in der', 'vor der'],
      correct_index: 0,
      explanation:
        'Vertical surfaces (Wand) use an + Dativ for position: an der Wand.',
    },
    {
      levels: ['B1', 'B2'],
      type: 'error_correction',
      instruction: 'Correct the case after the two-way preposition.',
      wrong_sentence: 'Ich lege das Buch auf dem Tisch.',
      answer: 'Ich lege das Buch auf den Tisch.',
      error_word: 'auf dem',
      correct_word: 'auf den',
      explanation:
        'legen implies movement onto a surface, so use auf + Akkusativ, not Dativ.',
    },
  ],
  Passiv: [
    {
      levels: ['A1', 'A2', 'B1', 'B2'],
      type: 'fill_blank',
      instruction: 'Use the Präteritum passive.',
      sentence: 'Das Haus ___ letztes Jahr gebaut.',
      hint: 'werden in Präteritum + Partizip II',
      answer: 'wurde',
      explanation:
        'Präteritum of werden is wurde; passive is wurde + Partizip II.',
    },
    {
      levels: ['A1', 'B1', 'B2'],
      type: 'multiple_choice',
      instruction: 'Choose the correct passive form.',
      sentence: 'Der Brief ___ gestern geschrieben.',
      options: ['wurde', 'ist', 'wird', 'hat'],
      correct_index: 0,
      explanation:
        'Process passive in past narrative often uses wurde + Partizip II: wurde geschrieben.',
    },
    {
      levels: ['B2'],
      type: 'error_correction',
      instruction: 'Use a natural German passive.',
      wrong_sentence: 'Die Tür ist von dem Kind geöffnet.',
      answer: 'Die Tür wurde von dem Kind geöffnet.',
      error_word: 'ist',
      correct_word: 'wurde',
      explanation:
        'Vorgangspassiv for a completed action in the past typically uses wurde, not ist, with öffnen.',
    },
  ],
  'Kasus (Akkusativ/Dativ)': [
    {
      levels: ['A1', 'A2', 'B1', 'B2'],
      type: 'fill_blank',
      instruction: 'Use the correct object case after helfen.',
      sentence: 'Kannst du ___ bitte helfen? (the child – das Kind)',
      hint: 'helfen takes dative',
      answer: 'dem Kind',
      explanation: 'helfen always governs the dative: dem Kind.',
    },
    {
      levels: ['A1', 'A2', 'B1', 'B2'],
      type: 'multiple_choice',
      instruction: 'Choose the correct article + noun.',
      sentence: 'Er gibt ___ Frau einen Kuss.',
      options: ['der', 'die', 'den', 'dem'],
      correct_index: 0,
      explanation:
        'geben + person as indirect object: dative der Frau (die Frau → der in Dativ).',
    },
    {
      levels: ['A1', 'A2', 'B1'],
      type: 'error_correction',
      instruction: 'Fix the article for a direct object feminine noun.',
      wrong_sentence: 'Ich sehe den Frau im Café.',
      answer: 'Ich sehe die Frau im Café.',
      error_word: 'den Frau',
      correct_word: 'die Frau',
      explanation:
        'Feminine accusative of die Frau is die, not den.',
    },
  ],
  Adjektivdeklination: [
    {
      levels: ['A1', 'B1', 'B2'],
      type: 'fill_blank',
      instruction: 'Fill in the correct ending (with article if needed).',
      sentence: 'Mit ___ kleinen Hund spielt sie im Garten.',
      hint: 'definite article dative masculine',
      answer: 'dem',
      explanation:
        'Mit takes dative; masculine is dem kleinen Hund (weak ending -en after dem).',
    },
    {
      levels: ['A1', 'B1', 'B2'],
      type: 'multiple_choice',
      instruction: 'Pick the correct phrase.',
      sentence: 'Das ist ___ interessantes Buch.',
      options: ['ein', 'eines', 'einem', 'einen'],
      correct_index: 0,
      explanation:
        'Neuter nominative after ist: ein interessantes Buch (ein + strong -es on the adjective).',
    },
    {
      levels: ['A1', 'B1', 'B2'],
      type: 'error_correction',
      instruction: 'Correct the adjective ending.',
      wrong_sentence: 'Sie trägt eine roten Mantel.',
      answer: 'Sie trägt einen roten Mantel.',
      error_word: 'eine roten',
      correct_word: 'einen roten',
      explanation:
        'Mantel is masculine accusative; indefinite article is einen with mixed ending -en on the adjective.',
    },
  ],
  Modalverben: [
    {
      levels: ['A1', 'A2', 'B1', 'B2'],
      type: 'fill_blank',
      instruction: 'Choose the correct modal verb.',
      sentence: 'Hier ___ du nicht rauchen.',
      hint: 'permission / prohibition',
      answer: 'darfst',
      explanation: 'Informal prohibition: Du darfst nicht ... (dürfen negated).',
    },
    {
      levels: ['A1', 'A2', 'B1'],
      type: 'multiple_choice',
      instruction: 'Which modal fits best?',
      sentence: 'Morgen ___ ich früher nach Hause gehen.',
      options: ['muss', 'kann', 'will', 'soll'],
      correct_index: 0,
      explanation: 'External obligation fits muss: I have to go home earlier.',
    },
    {
      levels: ['B1', 'B2'],
      type: 'error_correction',
      instruction: 'Fix the word order with a modal.',
      wrong_sentence: 'Ich kann gut sehr schwimmen.',
      answer: 'Ich kann sehr gut schwimmen.',
      error_word: 'gut sehr',
      correct_word: 'sehr gut',
      explanation:
        'Adverbs of degree usually precede the adverb they modify: sehr gut.',
    },
  ],
  'Trennbare Verben': [
    {
      levels: ['A1', 'A2', 'B1', 'B2'],
      type: 'fill_blank',
      instruction: 'Conjugate the separable verb correctly.',
      sentence: 'Jeden Morgen ___ ich um sieben Uhr auf.',
      hint: 'aufstehen, present ich',
      answer: 'stehe',
      explanation: 'Separable prefix auf goes to the end: Ich stehe ... auf.',
    },
    {
      levels: ['A1', 'A2', 'B1'],
      type: 'multiple_choice',
      instruction: 'Complete the question.',
      sentence: 'Wann ___ du das Licht ___?',
      options: ['machst … an', 'anmachst …', 'machst an …', 'an … machst'],
      correct_index: 0,
      explanation:
        'In questions, V2 still applies: machst du ... an (anmachen).',
    },
    {
      levels: ['B1', 'B2'],
      type: 'error_correction',
      instruction: 'Fix the separable verb in a main clause.',
      wrong_sentence: 'Ich anrufe dich morgen früh.',
      answer: 'Ich rufe dich morgen früh an.',
      error_word: 'anrufe',
      correct_word: 'rufe ... an',
      explanation:
        'In main clauses the prefix separates: rufe ... an, not anrufe.',
    },
  ],
  Genitiv: [
    {
      levels: ['A1', 'B1', 'B2'],
      type: 'fill_blank',
      instruction: 'Use the genitive article/possessive.',
      sentence: 'Das ist das Auto ___ Nachbarn.',
      hint: 'masculine singular genitive with definite article',
      answer: 'des',
      explanation:
        'Masculine genitive of der Nachbar is des Nachbarn (with n-suffix on weak/masculine nouns).',
    },
    {
      levels: ['A1', 'B1', 'B2'],
      type: 'multiple_choice',
      instruction: 'Choose the correct genitive form.',
      sentence: 'Die Farbe ___ Autos gefällt mir.',
      options: ['des', 'dem', 'den', 'der'],
      correct_index: 0,
      explanation: 'Neuter singular genitive: des Autos.',
    },
    {
      levels: ['A1', 'A2', 'B1', 'B2'],
      type: 'error_correction',
      instruction: 'Fix the preposition + case.',
      wrong_sentence: 'Wegen dem Regen bleiben wir zu Hause.',
      answer: 'Wegen des Regens bleiben wir zu Hause.',
      error_word: 'Wegen dem Regen',
      correct_word: 'Wegen des Regens',
      explanation:
        'wegen takes genitive in standard German: des Regens (masculine genitive).',
    },
  ],
};
