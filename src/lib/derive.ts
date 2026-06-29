/* ============================================================
   Single source of derived data — every chart imports from here.
   Pure functions of ELECTION; no DOM, no hard-coded results.
   ============================================================ */
import { ELECTION } from '../data/election';
import type { CanonSlice, FlowNode, PartyInfo, PersonFlow, RawRow, Row, SeatFlow } from './types';
import { esc, fmt } from './util';

export const E = ELECTION;
export const META = E.meta;
export const PARTIES = E.parties;
export const y65 = E.year65;
export const y69 = E.year69;

/* ---------- party helpers ---------- */
export function pinfo(name: string): PartyInfo {
  return PARTIES[name] || { label: name, color: '#888', canon: name };
}
export function canon(name: string): string {
  return pinfo(name).canon || name;
}
export function partyEq(a: string, b: string): boolean {
  return canon(a) === canon(b);
}

/* ---------- lookups by district ---------- */
export const by65: Record<string, RawRow> = {};
export const by69: Record<string, RawRow> = {};
y65.forEach((r) => (by65[r.district] = r));
y69.forEach((r) => (by69[r.district] = r));

interface DistDetail {
  c65: string; p65: string; v65: number;
  c69?: string; p69?: string; v69?: number;
}
export const DIST: Record<string, DistDetail> = {};
y65.forEach((r) => {
  const b = by69[r.district];
  DIST[r.district] = { c65: r.candidate, p65: r.party, v65: r.votes, c69: b?.candidate, p69: b?.party, v69: b?.votes };
});
export const dget = (n: string): DistDetail | null => DIST[n] || null;

/* ---------- node / count helpers ---------- */
function nodesOf(counts: Record<string, number>): FlowNode[] {
  return Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a] || a.localeCompare(b, 'th'))
    .map((name) => ({ id: name, ...pinfo(name), count: counts[name] }));
}
function countBy<T>(rows: T[], key: (r: T) => string): Record<string, number> {
  const c: Record<string, number> = {};
  rows.forEach((r) => {
    const k = key(r);
    c[k] = (c[k] || 0) + 1;
  });
  return c;
}
function orderIndex(nodes: FlowNode[]): Record<string, number> {
  const o: Record<string, number> = {};
  nodes.forEach((n, i) => (o[n.id] = i));
  return o;
}

/* ---------- SEAT graph (unit = districts) ---------- */
export const S_P65 = nodesOf(countBy(y65, (r) => r.party));
export const S_P69 = nodesOf(countBy(y69, (r) => r.party));
function buildSeatFlows(): SeatFlow[] {
  const m: Record<string, SeatFlow> = {};
  y65.forEach((r) => {
    const b = by69[r.district];
    if (!b) return;
    const k = r.party + '' + b.party;
    (m[k] || (m[k] = { from: r.party, to: b.party, v: 0, d: [] }));
    m[k].v++;
    m[k].d.push(r.district);
  });
  const fo = orderIndex(S_P65), to = orderIndex(S_P69);
  return Object.values(m).sort((x, y) => fo[x.from] - fo[y.from] || to[x.to] - to[y.to]);
}
export const S_FLOWS = buildSeatFlows();

/* ---------- PERSON graph (unit = incumbents who won both years) ---------- */
const HIDE = new Set((E.hidePersonFlows || []).map((p) => p[0] + '' + p[1]));
export const incumbents = y65.filter((r) => {
  const b = by69[r.district];
  return b && b.candidate === r.candidate;
});
function buildPersonFlows(): PersonFlow[] {
  const m: Record<string, PersonFlow> = {};
  incumbents.forEach((r) => {
    const b = by69[r.district];
    const k = r.party + '' + b.party;
    if (HIDE.has(k)) return;
    (m[k] || (m[k] = { from: r.party, to: b.party, v: 0, people: [] }));
    m[k].v++;
    m[k].people.push({ district: r.district, name: r.candidate, v65: r.votes, v69: b.votes });
  });
  return Object.values(m);
}
export const PERSON_FLOWS = buildPersonFlows();
export const PR_P65 = nodesOf(PERSON_FLOWS.reduce((c: Record<string, number>, f) => ((c[f.from] = (c[f.from] || 0) + f.v), c), {}));
export const PR_P69 = nodesOf(PERSON_FLOWS.reduce((c: Record<string, number>, f) => ((c[f.to] = (c[f.to] || 0) + f.v), c), {}));
(() => {
  const fo = orderIndex(PR_P65), to = orderIndex(PR_P69);
  PERSON_FLOWS.sort((x, y) => fo[x.from] - fo[y.from] || to[x.to] - to[y.to]);
})();
export const personTotal = PERSON_FLOWS.reduce((s, f) => s + f.v, 0);

/* ---------- combined per-district rows ---------- */
export const ROWS: Row[] = y65.map((r) => {
  const b = by69[r.district] || ({} as RawRow);
  return {
    id: r.district_id,
    district: r.district,
    c65: r.candidate,
    p65: r.party,
    v65: r.votes,
    c69: b.candidate,
    p69: b.party,
    v69: b.votes ?? null,
    dv: b.votes != null && r.votes != null ? b.votes - r.votes : null,
    samePerson: b.candidate != null && r.candidate === b.candidate,
    sameParty: b.party != null && partyEq(r.party, b.party),
  };
});

/* ---------- canon (merged party) meta + seat counts ---------- */
interface CanonMeta { color: string; labels: string[]; }
export const CANON: Record<string, CanonMeta> = {};
Object.values(PARTIES).forEach((info) => {
  const c = info.canon;
  const lab = info.label + (info.sub ? ' ' + info.sub : '');
  if (!CANON[c]) CANON[c] = { color: info.color, labels: [] };
  if (!CANON[c].labels.includes(lab)) CANON[c].labels.push(lab);
});
export const cl = (c: string): string => (CANON[c] ? CANON[c].labels.join(' / ') : c);
export const cc = (c: string): string => (CANON[c] ? CANON[c].color : '#888');

export const cnt65: Record<string, number> = {};
export const cnt69: Record<string, number> = {};
y65.forEach((r) => { const c = canon(r.party); cnt65[c] = (cnt65[c] || 0) + 1; });
y69.forEach((r) => { const c = canon(r.party); cnt69[c] = (cnt69[c] || 0) + 1; });
export const CANONS = [...new Set([...Object.keys(cnt65), ...Object.keys(cnt69)])].sort(
  (a, b) => Math.max(cnt69[b] || 0, cnt65[b] || 0) - Math.max(cnt69[a] || 0, cnt65[a] || 0) || cl(a).localeCompare(cl(b), 'th')
);

/** Tally a list of rows by canon party of a chosen side, sorted desc */
export function tallyCanon(arr: Row[], getp: (r: Row) => string | undefined): CanonSlice[] {
  const m: Record<string, number> = {};
  arr.forEach((r) => { const c = canon(getp(r) || ''); m[c] = (m[c] || 0) + 1; });
  return Object.entries(m)
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => ({ canon: c, label: cl(c), color: cc(c), n }));
}

/* ---------- vote-change tag (used by the flow detail panel) ---------- */
export function voteTag(v65: number | null | undefined, v69: number | null | undefined): string {
  if (v65 == null || v69 == null) return '';
  const diff = v69 - v65, pct = v65 ? Math.round((diff / v65) * 100) : 0, cls = diff >= 0 ? 'up' : 'down', s = diff >= 0 ? '+' : '';
  return `<span class="tag ${cls}">${diff >= 0 ? '▲' : '▼'} ${s}${fmt(diff)} (${s}${pct}%)</span>`;
}

export { esc, fmt };
