/* Fill page title / notes / footer from META (no hard-coded year numbers) */
import { META, y65, personTotal } from '../lib/derive';

function set(id: string, text: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function html(id: string, markup: string): void {
  const el = document.getElementById(id);
  if (el) el.innerHTML = markup;
}

export function fillText(): void {
  const L = META.yearLeft, R = META.yearRight, N = y65.length;
  set('pageTitle', 'การเปลี่ยนพรรค/กลุ่ม ผู้นำเขต กทม. · ปี ' + L + ' → ปี ' + R);
  set('pageSub', 'ผู้สมัครอันดับ 1 แต่ละเขต · ' + N + ' เขต · แยกเป็น 2 มุมมอง');
  set('countPill', 'นับคะแนนแล้ว (อย่างไม่เป็นทางการ ' + META.countedPct + '%)');
  html('noteSeat', 'หน่วย = <b>เขต</b> (' + N + ' ที่นั่ง) · เส้นบอกว่า เขตที่พรรคทางซ้ายเคยชนะปี ' + L + ' ปี ' + R + ' ตกเป็นของพรรคทางขวา<br>เส้นนี้ <b>ไม่ได้</b>แปลว่าเป็นคนเดิมย้ายพรรค — อาจเป็นคนใหม่จากอีกพรรคมาชนะก็ได้ (คลิกที่เส้นเพื่อดูรายเขต)');
  html('notePerson', 'หน่วย = <b>คน</b> · เฉพาะ “คนเดิม” (ผู้ชนะคนเดียวกันทั้งสองปี) ' + personTotal + ' คน<br>เส้นแสดงว่าแต่ละคนไปสังกัดพรรค/กลุ่มใดในปี ' + R + ' — เส้นที่ข้ามพรรคคือ<b>ย้ายจริง</b> · เขตที่ได้คนใหม่ไม่อยู่ในกราฟนี้ · คลิกดูรายชื่อ');
  const host = document.getElementById('srcLinks');
  if (host) host.innerHTML = META.sources.map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`).join(' · ');
  set('footCounted', 'นับคะแนนแล้ว (อย่างไม่เป็นทางการ ' + META.countedPct + '%)');
  set('footUpdated', 'แก้ไขข้อมูลล่าสุด: ' + META.updatedAt);
}
