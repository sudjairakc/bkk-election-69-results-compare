/* ③ จำนวนที่นั่งแต่ละพรรค/กลุ่ม — ปี 65 เทียบ 69 (grouped horizontal bars) */
import { CANONS, cnt65, cnt69, cc, cl } from '../lib/derive';
import { svgHelpers, chrome } from '../lib/dom';
import { FF } from '../lib/util';

export function renderBar(): void {
  const svg = document.getElementById('chartBar') as unknown as SVGSVGElement;
  svg.innerHTML = '';
  const CH = chrome();
  const { mk, txt } = svgHelpers(svg);
  const W = +svg.getAttribute('width')!;
  const LX = 180, RX = W - 80, TOP = 20, rowH = 64, barH = 19, gap = 6;
  const H = TOP + CANONS.length * rowH + 16;
  svg.setAttribute('height', String(H));
  mk('rect', { width: W, height: H, fill: CH.bg });
  const max = Math.max(1, ...CANONS.map((c) => Math.max(cnt65[c] || 0, cnt69[c] || 0)));
  const scale = (v: number) => (v / max) * (RX - LX);
  CANONS.forEach((c, i) => {
    const yTop = TOP + i * rowH + 8, color = cc(c), v5 = cnt65[c] || 0, v9 = cnt69[c] || 0, d = v9 - v5;
    txt(LX - 14, yTop + barH + gap / 2, cl(c), { 'text-anchor': 'end', 'dominant-baseline': 'middle', 'font-size': '12.5', fill: CH.fg, 'font-family': FF, 'font-weight': '700' });
    // 65
    const w5 = v5 ? Math.max(scale(v5), 2) : 0;
    mk('rect', { x: LX, y: yTop, width: w5, height: barH, fill: color, opacity: '0.38', rx: 3 });
    txt(LX - 6, yTop + barH / 2, '65', { 'text-anchor': 'end', 'dominant-baseline': 'middle', 'font-size': '9', fill: CH.sub, 'font-family': FF });
    txt(LX + w5 + 7, yTop + barH / 2, String(v5), { 'dominant-baseline': 'middle', 'font-size': '11.5', fill: CH.sub, 'font-family': FF, 'font-weight': '700' });
    // 69
    const y2 = yTop + barH + gap, w9 = v9 ? Math.max(scale(v9), 2) : 0;
    mk('rect', { x: LX, y: y2, width: w9, height: barH, fill: color, rx: 3 });
    txt(LX - 6, y2 + barH / 2, '69', { 'text-anchor': 'end', 'dominant-baseline': 'middle', 'font-size': '9', fill: CH.sub, 'font-family': FF });
    txt(LX + w9 + 7, y2 + barH / 2, String(v9), { 'dominant-baseline': 'middle', 'font-size': '11.5', fill: color, 'font-family': FF, 'font-weight': '700' });
    if (d !== 0) txt(LX + w9 + 7 + String(v9).length * 7 + 8, y2 + barH / 2, (d > 0 ? '+' : '') + d, { 'dominant-baseline': 'middle', 'font-size': '10.5', fill: d > 0 ? CH.up : CH.down, 'font-family': FF, 'font-weight': '700' });
  });
}
