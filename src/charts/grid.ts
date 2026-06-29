/* ⑤ ผังเขต ระบายสีตามพรรคผู้ชนะ (two tile grids: 65 | 69) */
import type { Row } from '../lib/types';
import { ROWS, CANONS, pinfo, cc, cl, esc } from '../lib/derive';
import { textOn } from '../lib/util';
import { showTip, moveTip, hideTip } from '../lib/tooltip';

function tile(r: Row, party: string | undefined, changed: boolean): HTMLElement {
  const color = party ? pinfo(party).color : '#888';
  const d = document.createElement('div');
  d.className = 'tile' + (changed ? ' changed' : '');
  d.style.background = color;
  d.style.color = textOn(color);
  d.innerHTML = `<span class="tn">${esc(r.district)}</span><span class="tp">${esc((party ? pinfo(party).label : '') || party || '-')}</span>`;
  d.addEventListener('mouseenter', (e) => showTip(e, r));
  d.addEventListener('mousemove', moveTip);
  d.addEventListener('mouseleave', hideTip);
  return d;
}

export function renderGrid(): void {
  const g65 = document.getElementById('grid65') as HTMLElement;
  const g69 = document.getElementById('grid69') as HTMLElement;
  g65.innerHTML = '';
  g69.innerHTML = '';
  ROWS.slice()
    .sort((a, b) => a.id - b.id)
    .forEach((r) => {
      const changed = !r.sameParty;
      g65.appendChild(tile(r, r.p65, changed));
      g69.appendChild(tile(r, r.p69, changed));
    });
  (document.getElementById('gridLegend') as HTMLElement).innerHTML = CANONS.map(
    (c) => `<div class="li"><span class="sw" style="background:${cc(c)}"></span>${esc(cl(c))}</div>`
  ).join('');
}
