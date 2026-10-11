const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'StudyDeck';
pptx.title = 'StudyDeck — Offline-First Flashcards';

// Neo-brutalist palette from the app
const C = {
  bg: 'F8F7F2',
  ink: '1A1A1A',
  blue: '1769FF',
  orange: 'FF922B',
  green: '12A05C',
  violet: '7950F2',
  white: 'FFFFFF',
};
const FONT = 'Tahoma';

const shadow = { type: 'outer', color: C.ink, blur: 0, offset: 4, angle: 45, opacity: 1 };

function slideBase() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  return s;
}

function header(s, kicker, title) {
  s.addText(kicker, { x: 0.6, y: 0.35, w: 12, h: 0.35, fontFace: FONT, fontSize: 13, bold: true, color: C.blue, charSpacing: 2 });
  s.addText(title, { x: 0.6, y: 0.65, w: 12, h: 0.7, fontFace: FONT, fontSize: 30, bold: true, color: C.ink });
  s.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.4, w: 12.1, h: 0.05, fill: { color: C.ink } });
}

function card(s, x, y, w, h, title, body, accent) {
  s.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: C.white }, line: { color: C.ink, width: 2.5 }, shadow });
  s.addShape(pptx.ShapeType.rect, { x, y, w: 0.18, h, fill: { color: accent } });
  s.addText(title, { x: x + 0.35, y: y + 0.15, w: w - 0.55, h: 0.4, fontFace: FONT, fontSize: 16, bold: true, color: C.ink });
  s.addText(body, { x: x + 0.35, y: y + 0.6, w: w - 0.55, h: h - 0.75, fontFace: FONT, fontSize: 12.5, color: C.ink, valign: 'top', lineSpacing: 18 });
}

function footer(s, n) {
  s.addText(`StudyDeck · https://github.com/jedcggg1/StudyDeck`, { x: 0.6, y: 7.05, w: 8, h: 0.3, fontFace: FONT, fontSize: 10, color: '888888' });
  s.addText(`${n}`, { x: 12.4, y: 7.05, w: 0.5, h: 0.3, fontFace: FONT, fontSize: 10, color: '888888', align: 'right' });
}

// ── 1. Title ─────────────────────────────────────────────
{
  const s = slideBase();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: C.bg } });
  s.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.5, w: 11.7, h: 3.4, fill: { color: C.white }, line: { color: C.ink, width: 3 }, shadow });
  s.addText('StudyDeck', { x: 1.2, y: 1.8, w: 11, h: 1.1, fontFace: FONT, fontSize: 54, bold: true, color: C.blue });
  s.addText('แอปการ์ดทบทวนแบบ Spaced Repetition สำหรับวิชา STEM\nทำงาน offline-first ได้เต็มรูปแบบ ติดตั้งเป็น PWA ได้', { x: 1.2, y: 2.95, w: 10.8, h: 1.0, fontFace: FONT, fontSize: 20, color: C.ink, lineSpacing: 30 });
  const chips = ['React 18 + TS', 'Vite 6', 'Dexie / IndexedDB', 'Workbox PWA', 'SM-2', 'KaTeX', 'Supabase Auth'];
  const chipColors = [C.blue, C.orange, C.green, C.violet, C.blue, C.orange, C.green];
  chips.forEach((t, i) => {
    const cw = 1.75;
    s.addShape(pptx.ShapeType.rect, { x: 1.2 + i * (cw + 0.05), y: 4.15, w: cw, h: 0.5, fill: { color: chipColors[i] }, line: { color: C.ink, width: 2 } });
    s.addText(t, { x: 1.2 + i * (cw + 0.05), y: 4.15, w: cw, h: 0.5, fontFace: FONT, fontSize: 11.5, bold: true, color: C.white, align: 'center', valign: 'middle' });
  });
  s.addText('นำเสนอโดยทีม StudyDeck · ตุลาคม 2026', { x: 0.8, y: 5.3, w: 11.7, h: 0.4, fontFace: FONT, fontSize: 14, color: '666666' });
}

// ── 2. Problem ───────────────────────────────────────────
{
  const s = slideBase();
  header(s, 'MOTIVATION', 'ปัญหาที่เราเจอ');
  const items = [
    ['นักเรียน STEM ต้องทบทวนเยอะ', 'การบ้าน รายงาน เลคเชอร์แน่น การทบทวนแบบอ่านซ้ำรอบเดียวลืมเร็วมาก'],
    ['แอปการ์ดส่วนใหญ่ต้องต่อเน็ต', 'sync ตลอดเวลา ใช้ในห้องแล็บ รถไฟ หรือเน็ตห่วยไม่ได้'],
    ['บัญชีคือกำแพงแรก', 'บังคับ signup ก่อนใช้ ทั้งที่เด็กแค่อยากเปิดทบทวน'],
    ['สูตรคณิตพิมพ์ลำบาก', 'แอปทั่วไป render ไม่ได้ ทำให้เนื้อหา Calculus / Physics ดูน่าเกลียด'],
  ];
  items.forEach(([t, b], i) => card(s, 0.6 + (i % 2) * 6.25, 1.75 + Math.floor(i / 2) * 2.5, 5.95, 2.3, t, b, [C.orange, C.blue, C.violet, C.green][i]));
  footer(s, 2);
}

// ── 3. Solution / features ───────────────────────────────
{
  const s = slideBase();
  header(s, 'SOLUTION', 'ทางออก: แอปที่ทำงานได้โดยไม่ต้องพึ่งเซิร์ฟเวอร์');
  const feats = [
    ['Offline-first จริง ๆ', 'ข้อมูลทั้งหมดอยู่ใน IndexedDB ของเครื่อง ไม่มี server call ระหว่างเรียน'],
    ['SM-2 engine', 'spaced repetition คำนวณ interval / ease factor ตาม SuperMemo 2'],
    ['KaTeX + DOMPurify', 'สูตรคณิต render สวย และ sanitize ก่อน render เสมอ'],
    ['Import / Export JSON', 'สำรองข้อมูล full DB หรือรายเด็ค พร้อม conflict strategy'],
    ['PWA ติดตั้งได้', 'มี manifest + service worker precache กว่า 70 รายการ'],
    ['สองภาษา', 'UI ไทย/อังกฤษ สลับได้ในตัว พร้อมเนื้อหา STEM ตัวอย่าง 3 วิชา'],
  ];
  feats.forEach(([t, b], i) => card(s, 0.6 + (i % 3) * 4.17, 1.75 + Math.floor(i / 3) * 2.5, 3.95, 2.3, t, b, [C.blue, C.green, C.orange, C.violet, C.blue, C.green][i]));
  footer(s, 3);
}

// ── 4. Architecture ──────────────────────────────────────
{
  const s = slideBase();
  header(s, 'ARCHITECTURE', 'ภาพรวมสถาปัตยกรรม — ไม่มี backend เป็นของตัวเอง');
  const boxes = [
    ['UI Layer', 'React 18 + TS\nPages ผ่าน state (ไม่ใช้ router)\ni18n EN/TH', C.blue, 0.6],
    ['App Controller', 'src/App.tsx\nstate + business flow หลัก\nDexie write ทันที', C.orange, 3.75],
    ['Local DB', 'Dexie 4 → IndexedDB\ndecks / cards /\nreviewLogs / settings', C.green, 6.9],
    ['Sync Boundary', 'ยังไม่มี cloud sync\n(ออกแบบ RLS ก่อนย้าย)', '999999', 10.05],
  ];
  boxes.forEach(([t, b, c, x]) => {
    s.addShape(pptx.ShapeType.rect, { x, y: 1.85, w: 2.95, h: 1.9, fill: { color: c === '999999' ? C.white : c }, line: { color: C.ink, width: 2.5 }, shadow });
    s.addText(t, { x, y: 2.0, w: 2.95, h: 0.45, fontFace: FONT, fontSize: 16, bold: true, color: c === '999999' ? C.ink : C.white, align: 'center' });
    s.addText(b, { x, y: 2.45, w: 2.95, h: 1.2, fontFace: FONT, fontSize: 11.5, color: c === '999999' ? '666666' : C.white, align: 'center', lineSpacing: 16 });
  });
  [3.55, 6.7, 9.85].forEach(x => s.addText('→', { x: x - 0.15, y: 2.5, w: 0.4, h: 0.5, fontSize: 24, bold: true, color: C.ink, align: 'center' }));
  s.addShape(pptx.ShapeType.rect, { x: 0.6, y: 4.15, w: 12.1, h: 1.15, fill: { color: C.white }, line: { color: C.ink, width: 2.5 }, shadow });
  s.addText([
    { text: 'Auth (แยกจากข้อมูลการเรียน): ', options: { bold: true } },
    { text: 'Supabase Auth เรียก REST API ตรง ๆ จาก frontend เก็บ session ใน localStorage, refresh อัตโนมัติ และมี "Continue in Offline Mode" ที่ใช้ได้โดยไม่ต้องมี key', options: {} },
  ], { x: 0.85, y: 4.3, w: 11.6, h: 0.85, fontFace: FONT, fontSize: 13.5, color: C.ink, lineSpacing: 20 });
  footer(s, 4);
}

// ── 5. SM-2 ──────────────────────────────────────────────
{
  const s = slideBase();
  header(s, 'CORE ENGINE', 'SM-2: deterministic และมี test คุม');
  card(s, 0.6, 1.75, 6.1, 2.5, 'สูตรที่ใช้', 'EF\' = EF + (0.1 − (5−q) × (0.08 + (5−q) × 0.02))\nโดย EF ≥ 1.3 เสมอ\n\nq < 3 → interval = 1 วัน, repetition = 0\nq ≥ 3 → I₁=1วัน, I₂=6วัน, Iₙ = round(Iₙ₋₁ × EF)', C.blue);
  card(s, 6.95, 1.75, 5.75, 2.5, 'Rating mapping', 'Again (q=1): ลืมสนิท — reset\nHard (q=3): นึกยาก\nGood (q=4): นึกได้ปกติ\nEasy (q=5): นึกออกทันที + bonus interval', C.orange);
  s.addShape(pptx.ShapeType.rect, { x: 0.6, y: 4.5, w: 12.1, h: 1.6, fill: { color: C.ink } });
  s.addText([
    { text: 'ทำไม engineer ควรสนใจ: ', options: { bold: true, color: C.orange } },
    { text: 'logic ทั้งหมดอยู่ใน src/services/sm2.ts เป็น module ล้วน ไม่ผูกกับ UI — ทดสอบด้วย Vitest ได้ครบทุก edge case ทั้ง ease ต่ำสุด, repetition reset และการเลื่อนวันที่', options: { color: C.white } },
  ], { x: 0.9, y: 4.7, w: 11.5, h: 1.2, fontFace: FONT, fontSize: 14, lineSpacing: 22 });
  footer(s, 5);
}

// ── 6. Data layer ────────────────────────────────────────
{
  const s = slideBase();
  header(s, 'DATA LAYER', 'IndexedDB ผ่าน Dexie — 4 ตาราง');
  const tables = [
    ['decks', 'id, title, description, icon (custom เป็น data:URL ได้), color, tags, timestamps', C.blue],
    ['cards', 'front/back (Markdown+LaTeX), repetition, interval, easeFactor, nextReviewDate (indexed)', C.green],
    ['reviewLogs', 'rating, quality, previous/new interval + EF, reviewedAt — สำหรับสถิติ', C.orange],
    ['settings', 'singleton 1 รายการ (key: app_settings) — theme, ภาษา', C.violet],
  ];
  tables.forEach(([t, b, c], i) => card(s, 0.6 + (i % 2) * 6.25, 1.75 + Math.floor(i / 2) * 1.9, 5.95, 1.7, t, b, c));
  s.addText('ลบเด็ค = ลบ cards + reviewLogs ของเด็คนั้นตามไปด้วย (cascade ทำใน App.tsx) · seed data ใส่ตัวอย่าง Calculus / Chemistry / Physics ตอนเปิดแอปครั้งแรก', { x: 0.6, y: 5.7, w: 12.1, h: 0.7, fontFace: FONT, fontSize: 13, color: '555555', italic: true, lineSpacing: 18 });
  footer(s, 6);
}

// ── 7. PWA ───────────────────────────────────────────────
{
  const s = slideBase();
  header(s, 'PWA & OFFLINE', 'ติดตั้งได้จริง — ผ่าน PWABuilder แล้ว');
  card(s, 0.6, 1.75, 3.95, 2.4, 'Manifest', 'id / start_url / scope = /\nicons 192 + 512 PNG (any + maskable)\nverified บนโดเมน production แล้ว', C.blue);
  card(s, 4.7, 1.75, 3.95, 2.4, 'Service Worker', 'vite-plugin-pwa + Workbox\nprecache 71 รายการ (~2.5 MB)\nเสียง feedback ใช้ Web Audio ไม่มีไฟล์เสียง', C.green);
  card(s, 8.8, 1.75, 3.9, 2.4, 'Offline mode', 'ใช้ได้โดยไม่ login\nflag ใน sessionStorage\nไม่ต้องมี Supabase key เลย', C.orange);
  s.addShape(pptx.ShapeType.rect, { x: 0.6, y: 4.45, w: 12.1, h: 1.4, fill: { color: C.white }, line: { color: C.ink, width: 2.5 }, shadow });
  s.addText([
    { text: 'ข้อควรระวัง (ได้เรียนรู้จากการ deploy จริง): ', options: { bold: true } },
    { text: 'Vite โหลดไฟล์ config เป็น .js ใน checkout นี้ — แก้ PWA config ต้องแก้ทั้ง vite.config.ts และ vite.config.js ให้ตรงกันทุกครั้ง ไม่งั้น manifest เพี้ยนโดยไม่มี error ตอน build', options: {} },
  ], { x: 0.85, y: 4.62, w: 11.6, h: 1.05, fontFace: FONT, fontSize: 13.5, color: C.ink, lineSpacing: 20 });
  footer(s, 7);
}

// ── 8. Security ──────────────────────────────────────────
{
  const s = slideBase();
  header(s, 'SECURITY & DATA SAFETY', 'ของที่ไม่มี ก็สำคัญไม่แพ้ของที่มี');
  const items = [
    ['ไม่มี backend ของตัวเอง', 'ไม่มี attack surface ของ API server; ข้อมูลการเรียนไม่เคยออกจากเครื่อง'],
    ['DOMPurify ทุกจุด render', 'Markdown + LaTeX จากผู้ใช้ถูก sanitize ก่อน render เสมอ'],
    ['Import ต้องผ่าน validator', 'JSON ที่ import ถูกตรวจ schema studydeck_v1 ก่อนเขียนลง DB'],
    ['frontend ใช้เฉพาะ anon key', 'ไม่มี service_role ในโค้ด/ env ฝั่ง client; .env.local ไม่ถูก commit'],
  ];
  items.forEach(([t, b], i) => card(s, 0.6 + (i % 2) * 6.25, 1.75 + Math.floor(i / 2) * 2.2, 5.95, 2.0, t, b, [C.blue, C.green, C.orange, C.violet][i]));
  footer(s, 8);
}

// ── 9. Testing ───────────────────────────────────────────
{
  const s = slideBase();
  header(s, 'TESTING & TOOLING', 'ทดสอบตรงไหน ใช้อะไรบ้าง');
  card(s, 0.6, 1.75, 5.95, 2.3, 'Vitest — 2 ไฟล์ / 16 tests', 'sm2.test.ts: interval, EF floor, edge cases\nimportExport.test.ts: schema validation,\nconflict strategy ทั้ง 3 แบบ\nrundown ~2 วินาที', C.green);
  card(s, 6.95, 1.75, 5.75, 2.3, 'บทเรียน tooling (fresh!)', 'vitest default glob เก็บ test ของ skill\nที่ติดตั้งใน .agents/skills มาวิ่งด้วย\n→ ต้องจำกัด include เป็น src/**/*.test.ts\nใน vitest.config.ts', C.orange);
  s.addShape(pptx.ShapeType.rect, { x: 0.6, y: 4.35, w: 12.1, h: 1.3, fill: { color: C.white }, line: { color: C.ink, width: 2.5 }, shadow });
  s.addText([
    { text: 'Pipeline: ', options: { bold: true } },
    { text: 'tsc -b → vite build → PWA precache สร้าง sw.js อัตโนมัติ · deploy ผ่าน Vercel จาก branch main (env: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)', options: {} },
  ], { x: 0.85, y: 4.52, w: 11.6, h: 0.95, fontFace: FONT, fontSize: 13.5, color: C.ink, lineSpacing: 20 });
  footer(s, 9);
}

// ── 10. Roadmap ──────────────────────────────────────────
{
  const s = slideBase();
  header(s, 'ROADMAP', 'ต่อไป — และทำไมยังไม่ทำตอนนี้');
  card(s, 0.6, 1.75, 3.95, 3.3, '1. Cloud sync', 'ต้องออกแบบก่อน: user ownership, ตารางฝั่ง Supabase, RLS, conflict resolution และ migration จาก IndexedDB\n\nย้าย storage แบบเร็ว ๆ = ข้อมูลผู้ใช้หาย/ปะปน', C.blue);
  card(s, 4.7, 1.75, 3.95, 3.3, '2. APK (TWA)', 'PWA → Trusted Web Activity ต่อยอดจาก offline-first ที่มีอยู่แล้ว\n\nถ้าใช้แค่ email/password ทำได้เลย ถ้าจะเอา Google OAuth ต้องตั้ง redirect/deep link ให้ตรง package ก่อน', C.green);
  card(s, 8.8, 1.75, 3.9, 3.3, '3. UX polish', 'สถิติการเรียนเชิงลึก (กราฟ retention)\nOnboarding ที่กระชับขึ้น\nปรับ dark theme + a11y (ใช้ Modern Web Guidance audit)', C.orange);
  footer(s, 10);
}

// ── 11. Closing ──────────────────────────────────────────
{
  const s = slideBase();
  s.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.7, w: 11.7, h: 3.6, fill: { color: C.white }, line: { color: C.ink, width: 3 }, shadow });
  s.addText('Q&A / Demo', { x: 1.2, y: 2.1, w: 11, h: 0.9, fontFace: FONT, fontSize: 44, bold: true, color: C.blue });
  s.addText([
    { text: 'ลองเองได้ที่ ', options: {} },
    { text: 'https://study-deck-opal.vercel.app', options: { bold: true, color: C.green } },
    { text: '\nโค้ด: https://github.com/jedcggg1/StudyDeck · เลือก "Continue in Offline Mode" ได้เลย ไม่ต้องมีบัญชี', options: {} },
  ], { x: 1.2, y: 3.15, w: 10.8, h: 1.3, fontFace: FONT, fontSize: 17, color: C.ink, lineSpacing: 28 });
  s.addText('ขอบคุณครับ 🎓', { x: 1.2, y: 4.45, w: 10, h: 0.6, fontFace: FONT, fontSize: 18, color: '666666' });
}

pptx.writeFile({ fileName: 'StudyDeck-presentation-th.pptx' }).then(f => console.log('WROTE', f));
