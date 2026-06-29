/* ⑦b party breakdown of returning (คนเดิม) vs new (คนใหม่) winners */
import type { CanonSlice } from '../lib/types';
import { ROWS, tallyCanon, esc } from '../lib/derive';
import { textOn } from '../lib/util';
import { showHTML, moveTip, hideTip } from '../lib/tooltip';

function bkBlock(title: string, items: CanonSlice[], total: number): string {
  const segs = items
    .map((it) => {
      const w = (it.n / total) * 100, pct = Math.round(w);
      return `<span class="seg" data-label="${esc(it.label)}" data-n="${it.n}" data-total="${total}" data-pct="${pct}" data-color="${it.color}" style="width:${w}%;background:${it.color};color:${textOn(it.color)}">${w >= 15 ? esc(it.label) + ' ' + it.n : w >= 7 ? it.n : ''}</span>`;
    })
    .join('');
  const chips = items
    .map((it) => {
      const pct = Math.round((it.n / total) * 100);
      return `<span class="bk-chip" data-label="${esc(it.label)}" data-n="${it.n}" data-total="${total}" data-pct="${pct}" data-color="${it.color}"><span class="sw" style="background:${it.color}"></span>${esc(it.label)} <b>${it.n}</b> <span style="color:var(--sub)">(${pct}%)</span></span>`;
    })
    .join('');
  return `<div class="bk"><div class="bk-h">${title}</div><div class="stack">${segs}</div><div class="bk-legend">${chips}</div></div>`;
}

export function renderBreakdown(): void {
  const same = ROWS.filter((r) => r.samePerson);
  const nw = ROWS.filter((r) => !r.samePerson);
  const sameBy = tallyCanon(same, (r) => r.p65);
  const newBy = tallyCanon(nw, (r) => r.p69);
  const host = document.getElementById('ppBreak') as HTMLElement;
  const pcS = Math.round(((newBy[0]?.n || 0) / nw.length) * 100);
  host.innerHTML =
    bkBlock('คนเดิม ' + same.length + ' คน — เดิม (ปี 65) สังกัดพรรค/กลุ่มใด', sameBy, same.length) +
    bkBlock('คนใหม่ ' + nw.length + ' คน — มาใหม่ (ปี 69) พรรค/กลุ่มใด', newBy, nw.length) +
    `<div class="bk-take">หน้าใหม่เกือบทั้งหมดมาจาก <b style="color:${newBy[0].color}">${esc(newBy[0].label)}</b> — ${newBy[0].n} จาก ${nw.length} คน (${pcS}%) · ส่วนผู้ชนะเดิมที่รักษาเก้าอี้ไว้ได้มีฐานใหญ่สุดคือ <b style="color:${sameBy[0].color}">${esc(sameBy[0].label)}</b> ${sameBy[0].n} คน — สะท้อนว่าแรงส่งของพรรคใหม่มาจาก “หน้าใหม่” ขณะที่พรรคฐานเดิมพึ่ง “ตัวบุคคล” เดิม</div>`;
  host.querySelectorAll<HTMLElement>('.seg,.bk-chip').forEach((el) => {
    const html = `<b style="color:${el.dataset.color}">${esc(el.dataset.label)}</b><br><span style="font-size:12.5px">สูตร: ${el.dataset.n} ÷ ${el.dataset.total} = <b>${el.dataset.pct}%</b></span>`;
    el.addEventListener('mouseenter', (e) => showHTML(e, html));
    el.addEventListener('mousemove', moveTip);
    el.addEventListener('mouseleave', hideTip);
  });
}
