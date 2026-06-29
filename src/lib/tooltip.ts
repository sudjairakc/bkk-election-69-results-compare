/* Shared floating tooltip (#tt) used by grid, dumbbell, matrix, breakdown, flows */
import type { Row } from './types';
import { esc, fmt } from './util';
import { pinfo } from './derive';

let _tt: HTMLElement | null = null;
function tt(): HTMLElement {
  return (_tt ||= document.getElementById('tt') as HTMLElement);
}

export function moveTip(e: MouseEvent): void {
  const t = tt();
  t.style.left = e.clientX + 14 + 'px';
  t.style.top = e.clientY - 12 + 'px';
}

export function showHTML(e: MouseEvent, html: string): void {
  const t = tt();
  t.innerHTML = html;
  t.style.opacity = '1';
  moveTip(e);
}

export function hideTip(): void {
  tt().style.opacity = '0';
}

/** Standard per-district tooltip body */
export function tipHTML(r: Row): string {
  return (
    `<b>${esc(r.district)}</b><br>` +
    `<span style="color:${pinfo(r.p65).color}">65 · ${esc(r.p65)}</span> — ${esc(r.c65)} (${fmt(r.v65)})<br>` +
    `<span style="color:${r.p69 ? pinfo(r.p69).color : '#888'}">69 · ${esc(r.p69 || '-')}</span> — ${esc(r.c69 || '-')} (${fmt(r.v69)})` +
    (r.dv != null ? `<br><span style="color:#888">Δ ${r.dv >= 0 ? '+' : ''}${fmt(r.dv)}</span>` : '')
  );
}

export function showTip(e: MouseEvent, r: Row): void {
  showHTML(e, tipHTML(r));
}
