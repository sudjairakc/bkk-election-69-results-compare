/* ④ ตารางผลรายเขต — ค้นหา / เรียงลำดับได้ */
import type { Row } from '../lib/types';
import { ROWS, pinfo, esc, fmt } from '../lib/derive';

type SortKind = 'th' | 'n';
const SORTABLE: Record<string, SortKind> = { district: 'th', c65: 'th', c69: 'th', v65: 'n', v69: 'n', dv: 'n', id: 'n' };

let sortKey = 'id';
let sortDir = 1;

function renderTable(): void {
  const thead = document.querySelector('#dtbl thead') as HTMLElement;
  const tbody = document.querySelector('#dtbl tbody') as HTMLElement;
  const arrow = (k: string) => (sortKey === k ? `<span class="sa">${sortDir > 0 ? '▲' : '▼'}</span>` : '');
  thead.innerHTML = `<tr>
    <th data-k="district">เขต${arrow('district')}</th>
    <th data-k="c65">ผู้ชนะ 65${arrow('c65')}</th>
    <th data-k="v65">คะแนน 65${arrow('v65')}</th>
    <th data-k="c69">ผู้ชนะ 69${arrow('c69')}</th>
    <th data-k="v69">คะแนน 69${arrow('v69')}</th>
    <th data-k="dv">Δ คะแนน${arrow('dv')}</th>
    <th>สถานะ</th></tr>`;
  const q = ((document.getElementById('tblSearch') as HTMLInputElement).value || '').trim().toLowerCase();
  let data = ROWS.filter((r) => !q || [r.district, r.c65, r.p65, r.c69, r.p69].some((s) => (s || '').toLowerCase().includes(q)));
  const typ = SORTABLE[sortKey] || 'n';
  data = data.slice().sort((a, b) => {
    let av: any = (a as any)[sortKey], bv: any = (b as any)[sortKey];
    if (typ === 'th') return String(av || '').localeCompare(String(bv || ''), 'th') * sortDir;
    av = av == null ? -Infinity : av;
    bv = bv == null ? -Infinity : bv;
    return (av - bv) * sortDir;
  });
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="tbl-empty">ไม่พบผลที่ค้นหา</td></tr>`;
    return;
  }
  tbody.innerHTML = data
    .map((r: Row) => {
      const dvCls = r.dv == null ? '' : r.dv >= 0 ? 'delta-up' : 'delta-down';
      const dvTxt = r.dv == null ? '–' : (r.dv >= 0 ? '+' : '') + fmt(r.dv);
      return `<tr>
      <td><b>${esc(r.district)}</b></td>
      <td><span class="pdot" style="background:${pinfo(r.p65).color}"></span><span class="cand">${esc(r.c65)}</span><div class="psub">${esc(r.p65)}</div></td>
      <td class="num">${fmt(r.v65)}</td>
      <td>${r.c69 ? `<span class="pdot" style="background:${pinfo(r.p69!).color}"></span><span class="cand">${esc(r.c69)}</span><div class="psub">${esc(r.p69)}</div>` : '–'}</td>
      <td class="num">${fmt(r.v69)}</td>
      <td class="num ${dvCls}">${dvTxt}</td>
      <td><span class="bdg ${r.samePerson ? 'same' : 'diff'}">${r.samePerson ? 'คนเดิม' : 'คนใหม่'}</span><span class="bdg ${r.sameParty ? 'same' : 'diff'}">${r.sameParty ? 'พรรคเดิม' : 'เปลี่ยนพรรค'}</span></td>
    </tr>`;
    })
    .join('');
}

/** Render the table and wire search + sortable headers (call once) */
export function initTable(): void {
  const thead = document.querySelector('#dtbl thead') as HTMLElement;
  thead.addEventListener('click', (e) => {
    const th = (e.target as HTMLElement).closest('th') as HTMLElement | null;
    if (!th || !th.dataset.k) return;
    const k = th.dataset.k;
    if (sortKey === k) sortDir = -sortDir;
    else { sortKey = k; sortDir = SORTABLE[k] === 'n' ? -1 : 1; }
    renderTable();
  });
  (document.getElementById('tblSearch') as HTMLInputElement).addEventListener('input', renderTable);
  renderTable();
}
