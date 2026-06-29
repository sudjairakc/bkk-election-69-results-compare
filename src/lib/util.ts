/* Small framework-free helpers shared across charts */

export const NS = 'http://www.w3.org/2000/svg';
export const FF = 'SaoChingcha, sans-serif';

/** HTML-escape a value for safe innerHTML interpolation */
export function esc(s: unknown): string {
  return (s == null ? '' : String(s)).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
}

/** Thousands-separated number, or en-dash when null */
export function fmt(n: number | null | undefined): string {
  return n == null ? '–' : Number(n).toLocaleString('en-US');
}

/** Pick a readable text color (#111 / #fff) for a given hex background */
export function textOn(hex: string): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#111' : '#fff';
}
