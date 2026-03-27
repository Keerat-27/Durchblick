import type { TopicId } from './topics';

export const WIKI_PAGE_TITLES: Record<TopicId, { en: string; de: string }> = {
  'Konjunktiv II': { en: 'German_subjunctive', de: 'Konjunktiv' },
  Relativsätze: { en: 'Relative_clause', de: 'Relativsatz' },
  Wechselpräpositionen: { en: 'German_prepositions', de: 'Präposition' },
  Passiv: { en: 'Passive_voice', de: 'Aktiv_und_Passiv_im_Deutschen' },
  'Kasus (Akkusativ/Dativ)': { en: 'Grammatical_case', de: 'Kasus' },
  Adjektivdeklination: { en: 'German_declension', de: 'Deutsche_Deklination' },
  Modalverben: { en: 'Modal_verb', de: 'Modalverb' },
  'Trennbare Verben': { en: 'Separable_verb', de: 'Trennbares_Verb' },
  Genitiv: { en: 'Genitive_case', de: 'Genitiv' },
};
