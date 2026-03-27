/** Compare user answers: lowercase, trim, strip trailing punctuation, collapse spaces */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]+$/u, '')
    .replace(/\s+/gu, ' ');
}
