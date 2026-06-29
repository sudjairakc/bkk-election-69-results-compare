/* Light/dark theme toggle. Persists to localStorage; invokes a render
   callback so theme-dependent SVG charts redraw with the new palette. */

let cur: 'dark' | 'light' = 'dark';
let onRender: (() => void) | null = null;

function apply(t: 'dark' | 'light'): void {
  cur = t;
  document.documentElement.setAttribute('data-theme', t);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = t === 'dark' ? '☀' : '☾';
  try { localStorage.setItem('bkk-theme', t); } catch (e) { /* ignore */ }
  onRender?.();
}

/** Initialise theme from storage / OS preference and wire the toggle button.
 *  @param render called after every theme change (redraw SVG charts here) */
export function initTheme(render: () => void): void {
  onRender = render;
  let initT: 'dark' | 'light' = 'dark';
  try {
    const s = localStorage.getItem('bkk-theme') as 'dark' | 'light' | null;
    initT = s || (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  } catch (e) { /* ignore */ }
  apply(initT);
  document.getElementById('themeToggle')?.addEventListener('click', () => apply(cur === 'dark' ? 'light' : 'dark'));
}
