# BKK Election 65 → 69 — เปรียบเทียบผลการเลือกตั้ง ส.ก.

Visualization เปรียบเทียบผู้ชนะ (ผู้สมัครอันดับ 1) ของสมาชิกสภากรุงเทพมหานคร (ส.ก.) ทั้ง 50 เขต ระหว่างปี 2565 และปี 2569 — สร้างด้วย **[Astro](https://astro.build)** + TypeScript (ไม่มี runtime framework, กราฟทั้งหมดเป็น vanilla DOM/SVG)

## หัวข้อในหน้า

1. **① ที่นั่งเปลี่ยนมือ** (มองที่ "เขต") — Sankey ผู้ชนะรายเขต 65→69
2. **② คนเดิม** (มองที่ "คน") — เฉพาะผู้ชนะคนเดิมที่ลงทั้งสองปีและย้ายพรรคจริง
3. **③ จำนวนที่นั่งแต่ละพรรค/กลุ่ม** — บาร์เทียบ 65 vs 69
4. **④ ตารางผลรายเขต** — ค้นหา / เรียงลำดับได้
5. **⑤ ผังเขตระบายสีพรรค** — grid 65 | 69
6. **⑥ คะแนนผู้ชนะรายเขต** — dumbbell 65→69
7. **⑦ คน หรือ พรรค** — เมทริกซ์ 2×2 + สัดส่วน + แยกพรรคของคนเดิม/คนใหม่

มีปุ่มสลับ **โหมดสว่าง/มืด** และ **navbar** เลื่อนหาหัวข้อแบบ smooth scroll

> หมายเหตุเชิงตรรกะ: พรรค **ก้าวไกล (65)** และ **ประชาชน (69)** ถือเป็นพรรคเดียวกัน (ยุบแล้วตั้งใหม่) เช่นเดียวกับ **เพื่อไทย** = **เพื่อไทย Life**

## โครงสร้างโปรเจกต์

```
src/
  data/election.ts     ⭐ ข้อมูลทั้งหมด — แก้ที่ไฟล์นี้ไฟล์เดียวเวลาข้อมูลเปลี่ยน
  lib/                 logic ที่ใช้ร่วม (derive ทุกอย่างจาก election.ts)
    types.ts  util.ts  dom.ts  tooltip.ts  derive.ts
  charts/              กราฟแต่ละอัน (flow, bar, table, grid, dumbbell, personParty, breakdown)
  ui/                  text (เติมข้อความจาก meta), theme (สว่าง/มืด), nav (smooth scroll)
  components/          Navbar.astro, Drawer.astro
  pages/index.astro    markup ของหน้า + เรียก src/main.ts
  styles/global.css    สไตล์ทั้งหมด (global — ห้าม scoped เพราะหลาย element สร้างด้วย JS)
  styles/fonts/        ฟอนต์ SaoChingcha / BKKDraft5
```

**แก้ข้อมูล:** เปิด `src/data/election.ts` แล้วแก้ `year65` / `year69` / `parties` / `meta` ได้เลย กราฟทุกตัวคำนวณใหม่เองจาก `src/lib/derive.ts` ไม่ต้องแตะ logic อื่น

## รันในเครื่อง

```bash
npm install
npm run dev      # โหมดพัฒนา
npm run build    # build ไป dist/
npm run preview  # ดู build ที่ dist/
```

## Deploy

push เข้า `main` → GitHub Actions (`.github/workflows/deploy.yml`) จะ build ด้วย Astro แล้ว deploy ขึ้น GitHub Pages อัตโนมัติ
`base` ถูกตั้งเป็น `/bkk-election-69-results-compare` ใน `astro.config.mjs`

## ที่มาข้อมูล

[Thai PBS — ผลการเลือกตั้ง ส.ก. กทม. 2569](https://www.thaipbs.or.th/bkkelection69/result) · นับคะแนนแล้ว (อย่างไม่เป็นทางการ 94.99%) · เปรียบเทียบเฉพาะผู้สมัครอันดับ 1 ของแต่ละเขต
