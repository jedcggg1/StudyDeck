# StudyDeck — AI Handoff

เอกสารนี้เขียนไว้ให้ AI ตัวถัดไปอ่านก่อนแก้โค้ด เพื่อให้รู้ว่าโปรเจกต์ทำงานอย่างไร ทำอะไรเสร็จแล้ว และควรต่อจากจุดไหน

อัปเดตล่าสุด: 11 ตุลาคม 2026

## สถานะล่าสุด

- โปรเจกต์อยู่ที่ C:\Users\user\Documents\AI camp
- Git remote: https://github.com/jedcggg1/StudyDeck.git
- branch ปัจจุบัน: main
- commit ล่าสุด: fb6962a Remove Live Preview toggle; editor always shows preview panes (push ขึ้น GitHub แล้ว และ Vercel deploy แล้ว)
- working tree มีไฟล์งานอื่นค้างอยู่ (AuthScreen, Dashboard, StudySession, studyStats.*) ไม่ใช่ของ commit นี้ อย่าลบหรือ commit โดยไม่เช็ค
- สิ่งที่เข้า commit 53313cf + 9dab604: แก้ logo หน้า login (อยู่ขวาของข้อความ, โปร่งใส ไม่มีกล่องพื้นหลัง), แก้ UI เลื่อนแนวนอน (overscroll-behavior-x บน html/body), เพิ่ม .env.example, public/robots.txt, vitest.config.ts, AI_HANDOFF.md, README แก้ลิงก์, presentation assets, skills-lock.json
- โดเมน Vercel: https://study-deck-opal.vercel.app — ตรวจ manifest บนโดเมนจริงแล้ว ได้ /logo-192.png และ /logo-512.png ถูกต้อง (11 ต.ค. 2026)

ห้ามใช้ git push --force เพราะ repository นี้มี commit จาก remote อยู่แล้ว ถ้า push ไม่ผ่านให้ใช้ git pull --rebase origin main ก่อน

## โปรเจกต์นี้คืออะไร

StudyDeck เป็นเว็บแอปช่วยทบทวนบทเรียนแบบ Spaced Repetition สำหรับวิชา STEM เช่น Calculus, Chemistry และ Physics

เป้าหมายหลักคือให้ใช้งานได้แบบ offline-first ผู้ใช้สร้างเด็ค สร้างการ์ด เรียน ทบทวน ดูสถิติ และสำรองข้อมูลได้โดยไม่ต้องพึ่งเซิร์ฟเวอร์ตลอดเวลา

## Technology stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 4 ผ่าน @tailwindcss/vite
- Dexie.js 4 สำหรับ IndexedDB
- Vite PWA / Workbox สำหรับ service worker และ offline cache
- KaTeX สำหรับสูตรคณิตศาสตร์
- DOMPurify สำหรับ sanitize เนื้อหาที่นำมา render
- Lucide React สำหรับไอคอน
- Vitest 3 สำหรับ unit tests
- Supabase Auth แบบเรียก REST API โดยตรง

## วิธีรันโปรเจกต์

รันจากโฟลเดอร์โปรเจกต์:

~~~powershell
cd "C:\Users\user\Documents\AI camp"
npm install
npm run dev
~~~

คำสั่งที่ใช้ตรวจงาน:

~~~powershell
npm test
npm run build
npm run preview
~~~

ผลตรวจล่าสุด (11 ต.ค. 2026):

- npm test: ผ่าน 2 test files, 16 tests ใช้เวลาประมาณ 2 วินาที
- npm run build: ผ่าน
- build สร้าง dist/manifest.webmanifest, dist/sw.js และ precache 71 entries
- build มีคำเตือนเรื่อง JavaScript chunk ใหญ่กว่า 500 kB แต่ไม่ใช่ build error

## โครงสร้างการทำงานหลัก

### จุดเริ่มต้นของแอป

src/main.tsx render AuthProvider ครอบ App

src/App.tsx เป็นตัวควบคุมหลักของแอป มี state ของ:

- decks
- flashcards
- review logs
- settings
- หน้าปัจจุบัน
- deck ที่เปิดอยู่
- study session
- modal ต่าง ๆ
- สถานะ login และ offline mode

โปรเจกต์ยังไม่ได้ใช้ React Router การเปลี่ยนหน้าทำผ่าน currentPage และชนิด NavPage ใน Sidebar

### ฐานข้อมูลในเครื่อง

ฐานข้อมูลสร้างใน src/db/database.ts ด้วยชื่อ StudyDeckDatabase

ตารางหลัก:

- decks: ข้อมูลเด็ค
- cards: flashcards และค่า SM-2
- reviewLogs: ประวัติการทบทวน
- settings: การตั้งค่าแอปหนึ่งรายการ ใช้ key app_settings

ข้อมูลการเรียนทั้งหมดในปัจจุบันเก็บใน browser IndexedDB ผ่าน Dexie ไม่ได้ sync ขึ้น Supabase

การสร้างเด็คใหม่ การแก้ไข การลบเด็ค และการลบการ์ดทำใน App.tsx แล้วบันทึกลง Dexie ทันที

เมื่อลบเด็ค ระบบจะลบการ์ดและ review logs ที่อยู่ในเด็คนั้นด้วย

ถ้า IndexedDB ยังว่าง src/db/seedData.ts จะใส่ sample decks และ sample cards ของ Calculus, Chemistry และ Physics ให้อัตโนมัติ

### Spaced Repetition

ตรรกะ SM-2 อยู่ใน src/services/sm2.ts

- คะแนน again, hard, good, easy
- ค่า ease factor ต่ำสุด 1.3
- คำนวณ repetition, interval และ next review date
- เขียน test ไว้ใน src/services/sm2.test.ts

### Import / Export

ฟังก์ชันอยู่ใน src/services/importExport.ts

- schema ปัจจุบันชื่อ studydeck_v1
- รองรับ export JSON
- ตรวจสอบ JSON ก่อน import
- รองรับ conflict strategy: skip, overwrite, duplicate
- test อยู่ใน src/services/importExport.test.ts

## ระบบ Login และ Offline Mode

### ไฟล์ที่เกี่ยวข้อง

- src/auth/AuthProvider.tsx
- src/auth/supabaseAuth.ts
- src/components/AuthScreen.tsx
- src/App.tsx

### พฤติกรรมปัจจุบัน

1. ตอนเปิดเว็บ AuthProvider จะอ่าน session จาก localStorage
2. ถ้า access token ใกล้หมดอายุ จะเรียก refresh token ผ่าน Supabase REST API
3. ถ้าไม่มี session และยังไม่ได้เลือก offline mode จะแสดง AuthScreen
4. ผู้ใช้เลือก Continue in Offline Mode ได้โดยไม่ต้องมี Supabase key
5. offline mode เก็บ flag ไว้ใน sessionStorage ด้วย key studydeck.offline-mode
6. เมื่อ login สำเร็จ ระบบเก็บ session ไว้ใน localStorage ด้วย key studydeck.supabase.session
7. เมื่อ login แล้ว Navbar จะแสดงอีเมลและปุ่ม Sign out
8. เมื่ออยู่ offline จะมีปุ่มเปิดหน้า login กลับมา

### Auth ที่รองรับ

- email/password sign in
- email/password sign up
- email confirmation ผ่าน window.location.origin
- refresh session
- sign out

ตอนนี้ยังไม่มี Google OAuth, magic-link deep link หรือการเปิดลิงก์กลับเข้า native APK

### Environment variables

แอปอ่านค่าหลักจาก:

~~~text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
~~~

ยังรองรับ alias เดิม:

~~~text
VITE_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_PUBLISHABLE_KEY
~~~

ไฟล์ .env.local มีอยู่ในเครื่อง แต่ห้ามเปิดเผยค่าข้างในและห้าม commit ขึ้น GitHub

Supabase key ที่ฝั่ง frontend ใช้ได้ต้องเป็น publishable/anon key เท่านั้น ห้ามใช้ service_role

สำคัญ: ตอนนี้ Supabase ใช้สำหรับ authentication เป็นหลัก ยังไม่มีระบบย้าย decks/cards จาก IndexedDB ไปเก็บใน Supabase และยังไม่มี multi-device sync

## UI/UX ที่ทำไว้แล้ว

- responsive layout สำหรับ mobile และ desktop
- sidebar เปิด/ปิดบนมือถือ
- Navbar มี search, settings, network status และ login state
- แก้ระยะห่าง content ไม่ให้ชิดขอบเกินไปในหน้าหลัก
- แก้ปัญหาตัวอักษรจมและช่อง search icon ซ้อนกับข้อความในจุดที่เกี่ยวข้อง
- มี theme: brutalist-light, brutalist-high-contrast, brutalist-dark
- theme ถูก apply ด้วย data-theme บน document.documentElement
- language ถูก apply ด้วย document.documentElement.lang
- มี English และ Thai ผ่าน src/i18n.tsx
- component หลักควรเรียก useTranslation() แทนการเพิ่มข้อความ UI แบบ hard-code
- ปรับสีตัวอักษรและพื้นหลังของ dark theme ใน src/index.css
- สร้าง deck ได้
- แก้ไข deck ได้
- ลบ deck ได้ และลบ flashcards/review logs ที่เกี่ยวข้องตามไปด้วย
- duplicate deck ได้
- เพิ่ม card, แก้ไข card และลบ card ได้
- อัปโหลด custom deck icon ได้
- custom icon ถูกเก็บเป็น data:image/* ใน field Deck.icon และเก็บต่อใน IndexedDB
- จำกัดรูป custom icon ไม่เกิน 2 MB
- รองรับ PNG, JPEG, WebP, GIF และ SVG
- มี onboarding modal
- มี import/export data
- มี statistics page

## PWA และปัญหา PWABuilder ที่แก้ล่าสุด

PWABuilder เคยแจ้ง error เหล่านี้:

- ต้องมี PNG ขนาด 192x192
- ต้องมี PNG ขนาด 512x512
- ลิงก์ icon ใน manifest ไม่ถูกต้อง
- ขนาด icon ใน manifest ไม่ถูกต้อง

สาเหตุคือ config เดิมอ้าง /logo.svg แต่ไฟล์นั้นถูกลบไปแล้ว และมีเพียง public/logo.png

สิ่งที่แก้ใน commit 7576e71:

- เพิ่ม public/logo-192.png ขนาดจริง 192x192
- เพิ่ม public/logo-512.png ขนาดจริง 512x512
- แก้ manifest ใน vite.config.ts
- แก้ manifest ใน vite.config.js
- เพิ่ม id, start_url และ scope เป็น /
- แยก manifest icons เป็น PNG สองขนาด
- เปลี่ยน includeAssets ให้ใช้ logo.png

มีทั้ง vite.config.ts และ vite.config.js อยู่ใน repository เพราะ Vite กำลังโหลดไฟล์ JavaScript config อยู่ จึงต้องตรวจให้สองไฟล์ตรงกันทุกครั้งที่แก้ PWA config

หลัง Vercel deploy ให้ตรวจ:

~~~text
https://study-deck-opal.vercel.app/manifest.webmanifest
~~~

manifest ควรมี:

~~~text
/logo-192.png
/logo-512.png
~~~

จากนั้นกลับไปกด Retest ใน PWABuilder

รายการ Add screenshots to showcase your app เป็น warning สำหรับคะแนน/ข้อมูล store ไม่ใช่ error หลักที่ทำให้ manifest ใช้งานไม่ได้

## Vercel และ Deploy

โปรเจกต์ deploy จาก branch main บน Vercel

Environment Variables ที่ต้องมีใน Vercel ทั้ง Production และ Preview:

~~~text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
~~~

หลังแก้ source ให้ใช้:

~~~powershell
git add <files>
git commit -m "<message>"
git pull --rebase origin main
git push origin main
~~~

ถ้า push ขึ้น fetch first:

~~~powershell
git pull --rebase origin main
git push origin main
~~~

ถ้ามี conflict ให้เลือกเนื้อหาที่ต้องการ จากนั้น:

~~~powershell
git add <resolved-file>
git -c core.editor=true rebase --continue
git push origin main
~~~

ห้ามใช้ force push เว้นแต่ผู้ใช้สั่งโดยตรงและยืนยันว่าจะเขียนทับประวัติ remote

## ไฟล์ที่ควรระวัง

- vite.config.ts: source config ที่อ่านง่ายสำหรับแก้ไข
- vite.config.js: config ที่ Vite ใช้งานจริงใน checkout ปัจจุบัน ต้องคงให้ตรงกับ .ts
- src/App.tsx: state และ business flow หลัก ถ้าแก้ควรตรวจ callers ของ callback ทั้งหมด
- src/auth/supabaseAuth.ts: ขอบเขตการเรียก Supabase Auth และ storage ของ session
- src/db/database.ts: schema IndexedDB ถ้าเปลี่ยน schema ต้องวางแผน migration ของ Dexie
- src/i18n.tsx: เพิ่ม key ภาษาอังกฤษและคำแปลไทยคู่กัน
- src/index.css: theme tokens และ dark-theme overrides
- public/logo.png, public/logo-192.png, public/logo-512.png: assets ของ app/PWA

## งานค้างและข้อควรตรวจต่อ

### 1-4. ตรวจและแก้เสร็จแล้ว (11 ต.ค. 2026)

- Vercel: ตรวจ manifest บนโดเมนจริงแล้วถูกต้อง เหลือขั้นตอน manual คือกลับไปกด Retest ใน PWABuilder
- README: เปลี่ยนลิงก์ logo.svg เป็น logo.png บน raw.githubusercontent ของ repo จริง และแก้ลิงก์ file:/// ที่ชี้เครื่อง local ให้เป็น path สัมพัทธ์แล้ว
- robots.txt: เพิ่ม public/robots.txt (User-agent: * / Allow: /) ตรงกับ includeAssets ฝั่ง vite config ทั้งสองไฟล์ build precache 71 entries
- .env.example: สร้างใหม่จาก template ชื่อ key กับ placeholder เท่านั้น ไม่มี key จริง

### 5. ข้อมูลยังไม่ sync ระหว่างอุปกรณ์

ผู้ใช้ที่ login แล้วก็ยังเก็บ decks/cards ไว้ใน IndexedDB ของอุปกรณ์นั้น การ login ยังไม่ได้ทำให้ข้อมูลไปอยู่ใน Supabase

ถ้าจะทำ sync ต้องออกแบบเพิ่มเรื่อง user ownership, database tables, Row Level Security, conflict resolution และ migration จาก IndexedDB ก่อน ห้ามย้าย storage แบบรวดเร็วโดยไม่วางแผน เพราะอาจทำให้ข้อมูลผู้ใช้หายหรือปะปนกัน

### 6. Native APK / OAuth

ถ้าจะทำ APK แบบ PWA/TWA และใช้แค่ email/password อาจต่อยอดได้ง่ายกว่า OAuth แต่ถ้าจะใช้ Google OAuth, magic link หรือ reset password ต้องตั้ง redirect URL และ deep link ให้สอดคล้องกับ Android package ก่อน

## หมายเหตุสำคัญหลัง commit 53313cf / 9dab604 (11 ต.ค. 2026)

- vitest.config.ts สำคัญ: จำกัด test ให้วิ่งเฉพาะ src/**/*.test.ts ถ้าลบไฟล์นี้ npm test จะไปวิ่ง test suite ของ skill ที่ติดตั้งอยู่ใน .agents/skills แล้วค้างและพัง
- skill ที่ติดตั้งใน .agents/skills (ไม่ commit, อยู่ใน .gitignore): mattpocock/skills ชุดเต็ม, archify, modern-web-guidance, ui-skills-root, kien-thai, ponytail และชุดเสริมของแต่ละ repo
- .gitignore มี .agents, .cursor, .claude, presentation/node_modules แล้ว
- presentation/ มีสคริปต์ generate.js (pptxgenjs) สร้างสไลด์ pptx + สไลด์ markdown ขายของ รัน `node presentation/generate.js` เพื่อสร้างใหม่
- หน้า login: logo.png อยู่ขวาของ heading โปร่งใส (object-contain) ไม่มีกล่องพื้นหลัง

## กฎสำหรับ AI ตัวถัดไป

1. อ่านไฟล์นี้และดู git status ก่อนแก้ทุกครั้ง
2. รักษา offline-first เป็น behavior หลัก เว้นแต่ผู้ใช้สั่งทำ cloud sync โดยตรง
3. ใช้ useTranslation() กับข้อความ UI ใหม่ และเพิ่มคำแปลไทยใน src/i18n.tsx
4. อย่าใช้ Supabase service_role key ใน frontend, .env.local หรือ APK
5. อย่า commit .env.local, token, password หรือ secret ใด ๆ
6. ถ้าแก้ PWA manifest ให้แก้ทั้ง vite.config.ts และ vite.config.js แล้วรัน npm run build
7. ถ้าเปลี่ยน IndexedDB schema ต้องเพิ่ม Dexie version/migration อย่างระมัดระวัง
8. ก่อนลบข้อมูลหรือเปลี่ยน schema ให้เตือนผู้ใช้เรื่องผลกระทบ
9. หลังแก้โค้ดให้รัน npm test และ npm run build อย่างน้อยหนึ่งครั้ง
10. ก่อน push ให้ตรวจ git diff, git status และใช้ rebase กับ remote ถ้า branch ไม่ทันสมัย

## จุดเริ่มงานที่แนะนำ

ถ้าผู้ใช้ถามว่า “ทำต่อจากไหน” ให้เริ่มตามลำดับนี้:

1. ตรวจ Vercel deployment และ PWABuilder manifest
2. แก้ README/logo และ robots.txt ให้สะอาด
3. เพิ่ม .env.example แบบไม่มี secret ถ้ายังต้องใช้ onboarding
4. ทดสอบ login ด้วย Supabase จริงหลังตรวจ Environment Variables
5. คุยกับผู้ใช้ก่อนเริ่มทำ cloud sync เพราะเป็นการเปลี่ยน architecture และ data ownership ครั้งใหญ่

