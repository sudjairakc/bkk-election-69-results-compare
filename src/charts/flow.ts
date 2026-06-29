/* ① ที่นั่งเปลี่ยนมือ (seat) + ② คนเดิม (person) — Sankey-style flow charts
   plus the click-through detail drawer. */
import type { FlowNode } from '../lib/types';
import {
  META, S_P65, S_P69, S_FLOWS, PR_P65, PR_P69, PERSON_FLOWS,
  pinfo, partyEq, dget, esc, fmt, voteTag,
} from '../lib/derive';
import { svgHelpers, chrome, type Chrome } from '../lib/dom';
import { showHTML, moveTip, hideTip } from '../lib/tooltip';

type Mode = 'seat' | 'person';
interface FlowCfg {
  svgId: string;
  P65: FlowNode[];
  P69: FlowNode[];
  FLOWS: any[];
  mode: Mode;
}

const NW = 24, UNIT = 10, GAP = 15, LX = 215, RX = 740, TOP = 58;

function render(cfg: FlowCfg, CH: Chrome): void {
  const svg = document.getElementById(cfg.svgId) as unknown as SVGSVGElement;
  const W = +svg.getAttribute('width')!, H = +svg.getAttribute('height')!;
  const { mk, txt } = svgHelpers(svg);
  const layout = (ps: FlowNode[], x: number) => {
    const m: Record<string, FlowNode & { x: number; y: number; h: number }> = {};
    let y = TOP;
    ps.forEach((p) => { const h = p.count * UNIT; m[p.id] = { ...p, x, y, h }; y += h + GAP; });
    return m;
  };
  const L = layout(cfg.P65, LX), R = layout(cfg.P69, RX);

  mk('rect', { width: W, height: H, fill: CH.bg });
  txt(LX + NW / 2, TOP - 22, 'ปี ' + META.yearLeft, { 'text-anchor': 'middle', fill: CH.axis, 'font-size': '18', 'font-family': 'BKKDraft5, SaoChingcha, sans-serif', 'font-weight': '700' });
  txt(RX + NW / 2, TOP - 22, 'ปี ' + META.yearRight, { 'text-anchor': 'middle', fill: CH.axis, 'font-size': '18', 'font-family': 'BKKDraft5, SaoChingcha, sans-serif', 'font-weight': '700' });
  mk('line', { x1: LX - 2, y1: TOP - 15, x2: LX + NW + 2, y2: TOP - 15, stroke: CH.axisLine, 'stroke-width': '1' });
  mk('line', { x1: RX - 2, y1: TOP - 15, x2: RX + NW + 2, y2: TOP - 15, stroke: CH.axisLine, 'stroke-width': '1' });

  const LU: Record<string, number> = {}, RU: Record<string, number> = {};
  cfg.P65.forEach((p) => (LU[p.id] = 0));
  cfg.P69.forEach((p) => (RU[p.id] = 0));
  const fg = mk('g', {});
  const flows: { path: SVGElement; f: any; fn: FlowNode; tn: FlowNode }[] = [];
  cfg.FLOWS.forEach((f) => {
    const fn = L[f.from], tn = R[f.to];
    if (!fn || !tn) return;
    const fh = f.v * UNIT;
    const y1a = fn.y + LU[f.from], y1b = y1a + fh, y2a = tn.y + RU[f.to], y2b = y2a + fh;
    LU[f.from] += fh; RU[f.to] += fh;
    const x1 = LX + NW, x2 = RX, cp1 = x1 + (x2 - x1) * 0.45, cp2 = x1 + (x2 - x1) * 0.55;
    const d = `M${x1},${y1a}C${cp1},${y1a} ${cp2},${y2a} ${x2},${y2a}L${x2},${y2b}C${cp2},${y2b} ${cp1},${y1b} ${x1},${y1b}Z`;
    const path = mk('path', { d, fill: fn.color, opacity: '0.48', cursor: 'pointer' }, fg);
    flows.push({ path, f, fn, tn });
  });

  flows.forEach(({ path, f, fn, tn }) => {
    const fromL = cfg.P65.find((p) => p.id === f.from)!.label;
    const toL = cfg.P69.find((p) => p.id === f.to)!.label;
    const unit = cfg.mode === 'seat' ? 'เขต' : 'คน';
    const names: string[] = cfg.mode === 'seat' ? f.d : f.people.map((p: any) => p.name);
    path.addEventListener('mouseenter', (e) => {
      flows.forEach((o) => o.path.setAttribute('opacity', '0.08'));
      path.setAttribute('opacity', '0.8');
      showHTML(
        e as MouseEvent,
        `<b style="color:${fn.color}">${esc(fromL)}</b><span style="color:#888"> → </span><b style="color:${tn.color}">${esc(toL)}</b><br><span style="color:#888;font-size:11px">${f.v} ${unit} · คลิกเพื่อดูรายละเอียด</span><br><span style="color:#888;font-size:11.5px;line-height:1.6">${esc(names.join(' · '))}</span>`
      );
    });
    path.addEventListener('mousemove', (e) => moveTip(e as MouseEvent));
    path.addEventListener('mouseleave', () => {
      flows.forEach((o) => o.path.setAttribute('opacity', '0.48'));
      hideTip();
    });
    path.addEventListener('click', (e) => {
      e.stopPropagation();
      hideTip();
      openPanel(cfg.mode, f, fn, tn, fromL, toL);
    });
  });

  function drawNode(n: FlowNode & { x: number; y: number; h: number }, isLeft: boolean) {
    mk('rect', { x: n.x, y: n.y, width: NW, height: Math.max(n.h, 4), fill: n.color, rx: 4 });
    const my = n.y + n.h / 2, hasSub = !!n.sub, mainY = hasSub ? my - 9 : my;
    const tx = isLeft ? n.x - 11 : n.x + NW + 11, anc = isLeft ? 'end' : 'start';
    txt(tx, mainY, n.label, { 'text-anchor': anc, 'dominant-baseline': 'middle', 'font-size': '13.5', fill: CH.nodeText, 'font-family': 'SaoChingcha, sans-serif', 'font-weight': '700' });
    if (hasSub) txt(tx, my + 10, n.sub!, { 'text-anchor': anc, 'dominant-baseline': 'middle', 'font-size': '11', fill: n.color, 'font-family': 'SaoChingcha, sans-serif' });
    const cx = isLeft ? n.x + NW + 7 : n.x - 7, canc = isLeft ? 'start' : 'end';
    txt(cx, my, `${n.count}`, { 'text-anchor': canc, 'dominant-baseline': 'middle', 'font-size': '11', fill: n.color, 'font-family': 'SaoChingcha, sans-serif', 'font-weight': '700' });
  }
  cfg.P65.forEach((p) => drawNode(L[p.id], true));
  cfg.P69.forEach((p) => drawNode(R[p.id], false));
  txt(W / 2, H - 12, 'hover ดูรายชื่อ · คลิกที่เส้นเพื่อดูรายละเอียด', { 'text-anchor': 'middle', fill: CH.foot, 'font-size': '11', 'font-family': 'SaoChingcha, sans-serif' });
}

/* ---------- detail drawer ---------- */
function $(id: string): HTMLElement { return document.getElementById(id) as HTMLElement; }

function openPanel(mode: Mode, f: any, fn: FlowNode, tn: FlowNode, fromL: string, toL: string): void {
  $('panelFlow').innerHTML = `<span style="color:${fn.color}">${esc(fromL)}</span><span class="arr">→</span><span style="color:${tn.color}">${esc(toL)}</span>`;
  let cards = '';
  if (mode === 'seat') {
    $('panelKind').textContent = 'เขตเปลี่ยนมือ · เทียบรายเขต';
    let same = 0, nw = 0;
    cards = f.d
      .map((name: string) => {
        const r = dget(name);
        if (!r) return `<div class="dcard"><div class="dname">${esc(name)}</div><div class="legend-note">ไม่พบข้อมูล</div></div>`;
        const ps = !!(r.c65 && r.c69 && r.c65 === r.c69);
        ps ? same++ : nw++;
        const pty = partyEq(r.p65, r.p69!);
        return `<div class="dcard"><div class="dname">${esc(name)}</div>
        <div class="drow"><span class="dyr">${esc(META.yearLeft)}</span><span class="dparty" style="color:${fn.color}">${esc(r.p65)}</span><span class="dperson">${esc(r.c65)}</span><span class="dvotes">${fmt(r.v65)}</span></div>
        <div class="drow"><span class="dyr">${esc(META.yearRight)}</span><span class="dparty" style="color:${tn.color}">${esc(r.p69)}</span><span class="dperson">${esc(r.c69)}</span><span class="dvotes">${fmt(r.v69)}</span></div>
        <div class="tags"><span class="tag ${ps ? 'same' : 'diff'}">${ps ? 'คนเดิม' : 'คนใหม่'}</span><span class="tag ${pty ? 'same' : 'diff'}">${pty ? 'พรรค/กลุ่มเดิม' : 'เปลี่ยนพรรค/กลุ่ม'}</span>${voteTag(r.v65, r.v69)}</div></div>`;
      })
      .join('');
    $('panelMeta').innerHTML = `<span>${f.v} เขต</span><span style="color:#46d27e">คนเดิม ${same}</span><span style="color:#ff8a3d">คนใหม่ ${nw}</span>`;
    $('panelBody').innerHTML = `<div class="legend-note">แต่ละเขต: พรรค/กลุ่ม · ชื่อผู้ชนะ · คะแนน — ป้ายบอกว่าเป็นคนเดิมหรือคนใหม่</div>` + cards;
  } else {
    $('panelKind').textContent = 'คนเดิม · รายคน';
    const samePty = partyEq(f.from, f.to);
    cards = f.people
      .map(
        (p: any) => `<div class="dcard"><div class="dname">${esc(p.name)} <span class="dist">เขต${esc(p.district)}</span></div>
        <div class="drow"><span class="dyr">${esc(META.yearLeft)}</span><span class="dparty" style="color:${fn.color}">${esc(fromL)}</span><span class="dvotes">${fmt(p.v65)}</span></div>
        <div class="drow"><span class="dyr">${esc(META.yearRight)}</span><span class="dparty" style="color:${tn.color}">${esc(toL)}</span><span class="dvotes">${fmt(p.v69)}</span></div>
        <div class="tags"><span class="tag ${samePty ? 'same' : 'diff'}">${samePty ? 'พรรค/กลุ่มเดิม' : 'เปลี่ยนพรรค/กลุ่ม'}</span>${voteTag(p.v65, p.v69)}</div></div>`
      )
      .join('');
    $('panelMeta').innerHTML = `<span>${f.v} คน</span><span style="color:${samePty ? '#46d27e' : '#ff8a3d'}">${samePty ? 'อยู่ที่เดิม' : 'ย้ายพรรค/กลุ่ม'}</span>`;
    $('panelBody').innerHTML = `<div class="legend-note">คนเดียวกันที่ชนะทั้งสองปี — เทียบคะแนน ปี ${esc(META.yearLeft)} → ปี ${esc(META.yearRight)}</div>` + cards;
  }
  $('panel').classList.add('open');
  $('scrim').classList.add('open');
}

function closePanel(): void {
  $('panel').classList.remove('open');
  $('scrim').classList.remove('open');
}

/** Wire drawer close interactions (call once) */
export function initFlowPanel(): void {
  $('panelClose').addEventListener('click', closePanel);
  $('scrim').addEventListener('click', closePanel);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
}

/** (Re)draw both flow charts — call on first paint and on theme change */
export function renderFlows(): void {
  const CH = chrome();
  (document.getElementById('chartSeat') as HTMLElement).innerHTML = '';
  (document.getElementById('chartPerson') as HTMLElement).innerHTML = '';
  render({ svgId: 'chartSeat', P65: S_P65, P69: S_P69, FLOWS: S_FLOWS, mode: 'seat' }, CH);
  render({ svgId: 'chartPerson', P65: PR_P65, P69: PR_P69, FLOWS: PERSON_FLOWS, mode: 'person' }, CH);
}
