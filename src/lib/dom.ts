/* SVG element helpers + theme-aware color palette */
import { NS } from './util';

type Attrs = Record<string, string | number>;

/** Returns `mk` (create+append element) and `txt` (create text node) bound to one <svg> */
export function svgHelpers(svg: SVGSVGElement) {
  const mk = (tag: string, a?: Attrs, par?: Element): SVGElement => {
    const e = document.createElementNS(NS, tag) as SVGElement;
    if (a) for (const k in a) e.setAttribute(k, String(a[k]));
    (par || svg).appendChild(e);
    return e;
  };
  const txt = (x: number, y: number, s: string, a?: Attrs): SVGElement => {
    const t = mk('text', { x, y, ...(a || {}) });
    t.textContent = s;
    return t;
  };
  return { mk, txt };
}

export interface Chrome {
  bg: string; bgSolid: string; fg: string; axis: string; line: string; sub: string;
  up: string; down: string; axisLine: string; nodeText: string; foot: string;
}

export function isDark(): boolean {
  return (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark';
}

/** Theme palette used by every SVG chart (read live from <html data-theme>) */
export function chrome(): Chrome {
  const d = isDark();
  return {
    bg: 'transparent', /* let the ambient background bleed through the chart */
    bgSolid: d ? '#0e0e0e' : '#f6f6f8', /* opaque bg color — for marker separation strokes */
    fg: d ? '#fff' : '#16161c',
    axis: d ? '#999' : '#555',
    line: d ? '#333' : '#cfcfcf',
    sub: d ? '#888' : '#999',
    up: d ? '#46d27e' : '#2e9e5b',
    down: d ? '#ff6b67' : '#d23b37',
    axisLine: d ? '#444' : '#bbb',
    nodeText: d ? '#fff' : '#16161c',
    foot: d ? '#555' : '#aaa',
  };
}
