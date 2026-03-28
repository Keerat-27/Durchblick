/** Content categories for Lesen (reading) — not grammar topics. */
export const LESEN_CATEGORIES = [
  'Kultur',
  'Technologie',
  'Sport',
  'Reisen',
  'Alltag',
  'Politik',
  'Natur',
  'Geschichte',
] as const;

export type LesenCategory = (typeof LESEN_CATEGORIES)[number];

export type DailyLesenTheme = {
  /** Short headline shown in UI and sent to the model as the passage angle */
  theme: string;
  category: LesenCategory;
};

/**
 * 50 real-world German reading angles. Each row maps to one content category.
 * Order is stable — the daily index picks by date, not by array shuffle.
 */
export const DAILY_LESEN_THEMES: readonly DailyLesenTheme[] = [
  { theme: 'Elektroautos in Deutschland', category: 'Technologie' },
  { theme: 'Das Oktoberfest', category: 'Kultur' },
  { theme: 'Klimaschutz in der EU', category: 'Politik' },
  { theme: 'Die Bundesliga', category: 'Sport' },
  { theme: 'Bahnfahren und das 49-Euro-Ticket', category: 'Reisen' },
  { theme: 'Pfand und Mülltrennung', category: 'Alltag' },
  { theme: 'Der Nationalpark Schwarzwald', category: 'Natur' },
  { theme: 'Die Wiedervereinigung', category: 'Geschichte' },
  { theme: 'Start-ups in Berlin', category: 'Technologie' },
  { theme: 'Weihnachtsmärkte in Deutschland', category: 'Kultur' },
  { theme: 'Handball und die Bundesliga', category: 'Sport' },
  { theme: 'Wandern in den Alpen', category: 'Reisen' },
  { theme: 'Kita und Elternzeit', category: 'Alltag' },
  { theme: 'Wolfsrückkehr und Naturschutz', category: 'Natur' },
  { theme: 'Das Kaiserreich und der Erste Weltkrieg', category: 'Geschichte' },
  { theme: 'Künstliche Intelligenz am Arbeitsplatz', category: 'Technologie' },
  { theme: 'Das Bauhaus und moderne Architektur', category: 'Kultur' },
  { theme: 'Die Olympischen Spiele und Deutschland', category: 'Sport' },
  { theme: 'Urlaub an der Nordsee', category: 'Reisen' },
  { theme: 'Supermärkte und regionale Produkte', category: 'Alltag' },
  { theme: 'Hochwasser und Starkregen', category: 'Natur' },
  { theme: 'Die Weimarer Republik', category: 'Geschichte' },
  { theme: 'Windkraft und Energiewende', category: 'Technologie' },
  { theme: 'Klassische Musik in Leipzig und Wien', category: 'Kultur' },
  { theme: 'Skisport im Winter', category: 'Sport' },
  { theme: 'Städtetrip nach Prag oder Wien', category: 'Reisen' },
  { theme: 'Wohnen in der Großstadt', category: 'Alltag' },
  { theme: 'Die EU-Agrarpolitik', category: 'Politik' },
  { theme: 'Das Wattenmeer', category: 'Natur' },
  { theme: 'Nationalsozialismus und Erinnerungskultur', category: 'Geschichte' },
  { theme: 'Cybersicherheit für Privatpersonen', category: 'Technologie' },
  { theme: 'Karneval am Rhein', category: 'Kultur' },
  { theme: 'Die Tour de France und Radsport', category: 'Sport' },
  { theme: 'Fähren in Skandinavien', category: 'Reisen' },
  { theme: 'Öffentlicher Nahverkehr in Deutschland', category: 'Alltag' },
  { theme: 'Bundestagswahl und Koalitionen', category: 'Politik' },
  { theme: 'Bienen und Landwirtschaft', category: 'Natur' },
  { theme: 'Die DDR im Alltag', category: 'Geschichte' },
  { theme: 'Smartphones und Digitales Deutschland', category: 'Technologie' },
  { theme: 'Museen und Kulturförderung', category: 'Kultur' },
  { theme: 'Tennis und Wimbledon', category: 'Sport' },
  { theme: 'Camping und Vanlife', category: 'Reisen' },
  { theme: 'Krankenversicherung und Arztbesuch', category: 'Alltag' },
  { theme: 'Migration und Integration', category: 'Politik' },
  { theme: 'Wälder und nachhaltige Forstwirtschaft', category: 'Natur' },
  { theme: 'Martin Luther und die Reformation', category: 'Geschichte' },
  { theme: 'Recycling und Kreislaufwirtschaft', category: 'Technologie' },
  { theme: 'Literatur und der Deutsche Buchpreis', category: 'Kultur' },
  { theme: 'Formel 1 und Motorsport', category: 'Sport' },
  { theme: 'Die Donau und Flusskreuzfahrten', category: 'Reisen' },
] as const;

function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Calendar day in local timezone — same string for the whole day. */
export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${m}-${day}`;
}

/**
 * Deterministic daily theme from the local calendar date (stable all day for one user).
 */
export function getDailyLesenTheme(d: Date = new Date()): DailyLesenTheme {
  const n = DAILY_LESEN_THEMES.length;
  const idx = fnv1a32(localDateKey(d)) % n;
  return DAILY_LESEN_THEMES[idx]!;
}
