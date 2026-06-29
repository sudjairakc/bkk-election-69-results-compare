/* ⑥ คะแนนผู้ชนะรายเขต 65 → 69 (dumbbell), sortable */
import { ROWS, canon, cc, fmt } from '../lib/derive';
import { svgHelpers, chrome } from '../lib/dom';
import { FF } from '../lib/util';
import { showTip, moveTip, hideTip } from '../lib/tooltip';

let dbSort: 'id' | 'v69' | 'delta' = 'id';

export function renderDumbbell(): void {
  const svg = document.getElementById('chartDumbbell') as unknown as SVGSVGElement;
  svg.innerHTML = '';
  const CH = chrome();
  const { mk, txt } = svgHelpers(svg);
  const W = +svg.getAttribute('width')!;
  let rows = ROWS.filter((r) => r.v65 != null && r.v69 != null);
  if (dbSort === 'id') rows.sort((a, b) => a.id - b.id);
  else if (dbSort === 'v69') rows.sort((a, b) => (b.v69 || 0) - (a.v69 || 0));
  else rows.sort((a, b) => (b.dv || 0) - (a.dv || 0));
  const LX = 120, RX = W - 95, TOP = 34, rowH = 22;
  const H = TOP + rows.length * rowH + 18;
  svg.setAttribute('height', String(H));
  mk('rect', { width: W, height: H, fill: CH.bg });
  const max = Math.max(1, ...rows.map((r) => Math.max(r.v65 || 0, r.v69 || 0)));
  const x = (v: number) => LX + (v / max) * (RX - LX);
  for (let g = 0; g <= 50000; g += 10000) {
    if (g > max) break;
    const gx = x(g);
    mk('line', { x1: gx, y1: TOP - 10, x2: gx, y2: H - 14, stroke: CH.line, 'stroke-width': '1', 'stroke-dasharray': '2 4' });
    txt(gx, TOP - 16, g / 1000 + 'k', { 'text-anchor': 'middle', 'font-size': '9', fill: CH.sub, 'font-family': FF });
  }
  rows.forEach((r, i) => {
    const y = TOP + i * rowH + rowH / 2, x1 = x(r.v65!), x2 = x(r.v69!), up = (r.dv || 0) >= 0;
    txt(LX - 10, y, r.district, { 'text-anchor': 'end', 'dominant-baseline': 'middle', 'font-size': '10.5', fill: CH.fg, 'font-family': FF });
    mk('line', { x1, y1: y, x2, y2: y, stroke: up ? CH.up : CH.down, opacity: '0.5', 'stroke-width': '2.5' });
    mk('circle', { cx: x1, cy: y, r: '4', fill: cc(canon(r.p65)), stroke: CH.bgSolid, 'stroke-width': '1.5' });
    mk('circle', { cx: x2, cy: y, r: '4.5', fill: cc(canon(r.p69 || '')), stroke: CH.bgSolid, 'stroke-width': '1.5' });
    txt(RX + 10, y, (up ? '+' : '') + fmt(r.dv), { 'dominant-baseline': 'middle', 'font-size': '9.5', fill: up ? CH.up : CH.down, 'font-family': FF, 'font-weight': '700' });
    const hit = mk('rect', { x: '0', y: y - rowH / 2, width: W, height: rowH, fill: 'transparent', cursor: 'pointer' });
    hit.addEventListener('mouseenter', (e) => showTip(e as MouseEvent, r));
    hit.addEventListener('mousemove', (e) => moveTip(e as MouseEvent));
    hit.addEventListener('mouseleave', hideTip);
  });
}

/** Wire sort buttons (call once) */
export function initDumbbell(): void {
  document.querySelectorAll<HTMLButtonElement>('.ctrl-btn[data-sort]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ctrl-btn[data-sort]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      dbSort = btn.dataset.sort as 'id' | 'v69' | 'delta';
      renderDumbbell();
    });
  });
}
