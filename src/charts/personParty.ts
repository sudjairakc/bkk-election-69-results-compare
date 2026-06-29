/* ⑦ คนกรุงเทพเลือกที่ "คน" หรือ "พรรค"? — 2×2 matrix + proportion bars */
import type { Row } from '../lib/types';
import { ROWS, esc } from '../lib/derive';
import { showHTML, moveTip, hideTip } from '../lib/tooltip';

type QKey = 'ss' | 'sd' | 'ns' | 'nd';

export function renderPersonParty(): void {
  const Q: Record<QKey, Row[]> = {
    ss: ROWS.filter((r) => r.samePerson && r.sameParty),
    sd: ROWS.filter((r) => r.samePerson && !r.sameParty),
    ns: ROWS.filter((r) => !r.samePerson && r.sameParty),
    nd: ROWS.filter((r) => !r.samePerson && !r.sameParty),
  };
  const N = ROWS.length, pc = (n: number) => Math.round((n / N) * 100);
  const COL: Record<QKey, string> = { ss: '#2e9e5b', sd: '#d4660a', ns: '#1976D2', nd: '#d23b37' };
  const labs: Record<QKey, string> = { ss: 'คนเดิม · พรรคเดิม', sd: 'คนเดิม · ย้ายพรรค', ns: 'คนใหม่ · พรรคเดิม', nd: 'คนใหม่ · เปลี่ยนพรรค' };
  const cond: Record<QKey, string> = {
    ss: 'ผู้ชนะคนเดียวกัน และ กลุ่มพรรคเดียวกัน',
    sd: 'ผู้ชนะคนเดียวกัน แต่ ย้ายกลุ่มพรรค',
    ns: 'ผู้ชนะคนละคน แต่ กลุ่มพรรคเดิม',
    nd: 'ผู้ชนะคนละคน และ เปลี่ยนกลุ่มพรรค',
  };
  const cell = (key: QKey) => {
    const list = Q[key], c = COL[key];
    return `<div class="pp-cell ${key}" data-q="${key}"><div class="num" style="color:${c}">${list.length}</div><div class="pct" style="color:${c}">${pc(list.length)}%</div><div class="lab">${labs[key]}</div></div>`;
  };
  (document.getElementById('ppMatrix') as HTMLElement).innerHTML =
    `<div></div><div class="pp-col">พรรค/กลุ่มเดิม</div><div class="pp-col">เปลี่ยนพรรค/กลุ่ม</div>
     <div class="pp-row">คนเดิม</div>${cell('ss')}${cell('sd')}
     <div class="pp-row">คนใหม่</div>${cell('ns')}${cell('nd')}`;
  document.querySelectorAll<HTMLElement>('#ppMatrix .pp-cell').forEach((el) => {
    const k = el.dataset.q as QKey, list = Q[k], c = COL[k];
    const html = `<b>${labs[k]}</b><br><span style="color:#888;font-size:11px">เงื่อนไข: ${cond[k]}</span><br><span style="font-size:12.5px">สูตร: ${list.length} ÷ ${N} = <b style="color:${c}">${pc(list.length)}%</b></span><br><span style="color:#888;font-size:11.5px;line-height:1.7">${list.map((r) => esc(r.district)).join(' · ') || '–'}</span>`;
    el.style.cursor = 'help';
    el.addEventListener('mouseenter', (e) => showHTML(e, html));
    el.addEventListener('mousemove', moveTip);
    el.addEventListener('mouseleave', hideTip);
  });

  const same = Q.ss.length + Q.sd.length, nw = Q.ns.length + Q.nd.length;
  const spt = Q.ss.length + Q.ns.length, dpt = Q.sd.length + Q.nd.length;
  const person = Q.sd.length, party = Q.ns.length;
  const split = (aL: string, aV: number, aC: string, bL: string, bV: number, bC: string) => {
    const tot = aV + bV || 1, aP = Math.round((aV / tot) * 100), bP = 100 - aP;
    return `<div class="pp-split"><span style="width:${aP}%;background:${aC}">${aL} ${aP}%</span><span style="width:${bP}%;background:${bC}">${bL} ${bP}%</span></div>`;
  };
  (document.getElementById('ppSide') as HTMLElement).innerHTML =
    `<div><div class="pp-stat-h">ผู้ชนะ — คนเดิม vs คนใหม่</div>${split('คนเดิม', same, '#2e9e5b', 'คนใหม่', nw, '#9a9aa2')}<div class="pp-cap">คนเดิม ${same} เขต · คนใหม่ ${nw} เขต — ผู้ดำรงตำแหน่งเดิมกลับมาชนะ ${pc(same)}%</div></div>
    <div><div class="pp-stat-h">พรรค/กลุ่ม — เดิม vs เปลี่ยน</div>${split('พรรคเดิม', spt, '#1976D2', 'เปลี่ยนพรรค', dpt, '#FF6700')}<div class="pp-cap">พรรค/กลุ่มเดิม ${spt} เขต · เปลี่ยน ${dpt} เขต</div></div>
    <div class="pp-key"><div class="pp-stat-h">เมื่อที่นั่ง “ไม่เหมือนเดิม” — คนนำ หรือ พรรคนำ?</div>${split('เลือกที่คน', person, '#d4660a', 'เลือกที่พรรค', party, '#1976D2')}<div class="pp-note"><b style="color:#d4660a">เลือกที่คน</b> = คนเดิมชนะแม้ย้ายพรรค <b>${person}</b> เขต · <b style="color:#1976D2">เลือกที่พรรค</b> = พรรคเดิมรักษาที่นั่งด้วยผู้สมัครใหม่ <b>${party}</b> เขต<br>สัญญาณ “ตัวบุคคล” มากกว่า “พรรค” ราว ${(person / Math.max(party, 1)).toFixed(1)} เท่า · (อีก ${Q.ss.length} เขตเหมือนเดิมทั้งคู่ และ ${Q.nd.length} เขตเปลี่ยนทั้งคู่ ตีความตรง ๆ ไม่ได้)</div></div>`;

  const pp = person + party || 1;
  const splitTips = [
    `<b>คนเดิม vs คนใหม่</b><br><span style="font-size:12.5px">คนเดิม = ${same} ÷ ${N} = <b style="color:#2e9e5b">${pc(same)}%</b><br>คนใหม่ = ${nw} ÷ ${N} = <b>${pc(nw)}%</b></span>`,
    `<b>พรรค/กลุ่ม เดิม vs เปลี่ยน</b><br><span style="font-size:12.5px">พรรคเดิม = ${spt} ÷ ${N} = <b style="color:#1976D2">${pc(spt)}%</b><br>เปลี่ยน = ${dpt} ÷ ${N} = <b style="color:#FF6700">${pc(dpt)}%</b></span>`,
    `<b>คนนำ หรือ พรรคนำ</b> <span style="color:#888;font-size:11px">(ฐาน ${person}+${party}=${pp} เขต)</span><br><span style="font-size:12.5px">เลือกที่คน = ${person} ÷ ${pp} = <b style="color:#d4660a">${Math.round((person / pp) * 100)}%</b><br>เลือกที่พรรค = ${party} ÷ ${pp} = <b style="color:#1976D2">${Math.round((party / pp) * 100)}%</b><br>อัตราส่วน = ${person} ÷ ${party} = <b>${(person / Math.max(party, 1)).toFixed(1)} เท่า</b></span>`,
  ];
  document.querySelectorAll<HTMLElement>('#ppSide .pp-split').forEach((el, i) => {
    el.style.cursor = 'help';
    el.addEventListener('mouseenter', (e) => showHTML(e, splitTips[i]));
    el.addEventListener('mousemove', moveTip);
    el.addEventListener('mouseleave', hideTip);
  });
}
