# StudyDeck — Advanced Offline-First Flashcard Web Application

StudyDeck is a functional, open-source, offline-first spaced repetition flashcard web application designed for students and researchers studying STEM and complex subjects without relying on stable internet or remote databases.

![Design Aesthetic](https://raw.githubusercontent.com/studydeck/studydeck/main/public/logo.svg)

## 🌟 Highlights & Features

- **Neo-Brutalism + Bento Grid Design**: High-contrast 2.5px borders, tactile 4px hard offset shadows, vibrant academic color coding (Electric Blue `#1769FF`, Vibrant Orange `#FF922B`, Success Green `#12A05C`, Physics Violet `#7950F2`), and clean responsive Bento layouts.
- **100% Offline-First Architecture**: Powered by **Dexie.js** and browser **IndexedDB**, guaranteeing zero data loss, instant response times, and full flashcard creation, editing, and study session execution with no internet connection.
- **Mathematical Formula Rendering**: Native **KaTeX** integration with safe HTML sanitization via **DOMPurify** supporting inline (`$...$`) and block (`$$...$$`) mathematical formulas (calculus integrals, Newton's vector mechanics, gas laws, and wave equations).
- **SuperMemo 2 (SM-2) Spaced Repetition Engine**: Testable, deterministic implementation calculating Ease Factor ($EF$), interval repetitions, quality scores, and predicted review dates.
- **Audio Feedback**: Synthesized Web Audio API haptic sound effects that operate 100% offline with zero external audio assets.
- **Versioned JSON Import & Export**: Full database and deck-level backups under schema `studydeck_v1` with conflict resolution (skip, duplicate, or overwrite) and pre-import preview.
- **Starter STEM Decks**: Pre-loaded decks for **Calculus**, **Chemistry**, and **Physics** with bilingual English and Thai explanations.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 6 |
| **Local Storage** | IndexedDB via Dexie.js 4 |
| **Offline Caching** | Vite PWA (Workbox Service Worker precaching fonts & assets) |
| **Math Engine** | KaTeX 0.16 |
| **Security** | DOMPurify 3 for sanitized HTML rendering |
| **Styling** | Neo-Brutalism CSS Design System + Bento Grid |
| **Testing** | Vitest 3 unit tests |

---

## 🧠 Spaced Repetition Engine (SM-2)

The SM-2 algorithm is implemented as a standalone, deterministic TypeScript module in [`src/services/sm2.ts`](file:///c:/Users/user/Documents/AI%20camp/src/services/sm2.ts).

### Rating Mapping
- **Again** ($q = 1$): Failure / Complete blackout. Interval resets to 1 day, repetition count resets to 0.
- **Hard** ($q = 3$): Recalled with significant cognitive effort.
- **Good** ($q = 4$): Correct recall after normal hesitation.
- **Easy** ($q = 5$): Instant, effortless mastery.

### Ease Factor Formula
$$EF' = EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))$$
$$\text{subject to } EF' \ge 1.3$$

### Interval Scheduling
- For $q < 3$: $I = 1$ day, $\text{repetition} = 0$.
- For $q \ge 3$:
  - First repetition ($n = 0$): $I_1 = 1$ day (or $2$ days for Easy bonus).
  - Second repetition ($n = 1$): $I_2 = 6$ days ($3$ days for Hard, $7$ days for Easy).
  - Subsequent repetitions ($n \ge 2$): $I_n = \text{round}(I_{n-1} \times EF')$.

---

## 💾 Database Schema (Dexie.js / IndexedDB)

Database: `StudyDeckDatabase` (Version 1)

```ts
// Decks Table
interface Deck {
  id: string;             // Primary key
  title: string;
  description: string;
  icon: string;           // 'sigma' | 'flask' | 'atom' | 'calculator' | 'book'
  color: string;          // Hex accent code
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// Flashcards Table
interface Flashcard {
  id: string;             // Primary key
  deckId: string;         // Indexed foreign key
  front: string;          // Markdown + LaTeX
  back: string;           // Markdown + LaTeX
  tags: string[];
  repetition: number;     // SM-2 consecutive count
  interval: number;       // In days
  easeFactor: number;     // Minimum 1.3, default 2.5
  nextReviewDate: number; // Indexed timestamp in ms
  lastReviewedAt?: number;
  createdAt: number;
  updatedAt: number;
}

// Review Logs Table (Indexed for analytics)
interface ReviewLog {
  id: string;
  cardId: string;
  deckId: string;
  rating: 'again' | 'hard' | 'good' | 'easy';
  quality: number;
  previousInterval: number;
  newInterval: number;
  previousEaseFactor: number;
  newEaseFactor: number;
  reviewedAt: number;
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone the repository
git clone https://github.com/studydeck/studydeck.git
cd studydeck

# Install dependencies
npm install
```

### Running Locally in Development Mode
```bash
npm run dev
```
The application will launch at `http://localhost:5173/`.

### Running Automated Tests
```bash
npm test
```
Runs 16 unit tests covering SM-2 algorithm calculations, interval scheduling, and JSON schema validation.

### Building for Production
```bash
npm run build
```
Generates optimized distribution bundle in `dist/` with precached service worker assets for offline PWA installation.

---

## 📄 JSON Import/Export Schema (`studydeck_v1`)

```json
{
  "schemaVersion": "studydeck_v1",
  "exportedAt": "2026-10-10T03:00:00.000Z",
  "source": "StudyDeck Web App",
  "decks": [
    {
      "id": "deck-calculus",
      "title": "Calculus",
      "description": "Essential derivatives and integrals",
      "icon": "sigma",
      "color": "#1769FF",
      "tags": ["Math", "Calculus"]
    }
  ],
  "cards": [
    {
      "id": "card-calc-1",
      "deckId": "deck-calculus",
      "front": "### Indefinite Integral of $x^2$\\n$$\\\\int x^2 \\\\, dx$$",
      "back": "$$\\\\int x^2 \\\\, dx = \\\\frac{x^3}{3} + C$$",
      "tags": ["Integration"],
      "repetition": 2,
      "interval": 6,
      "easeFactor": 2.5,
      "nextReviewDate": 1777636800000
    }
  ]
}
```

---

## 📜 License

Distributed under the [MIT License](file:///c:/Users/user/Documents/AI%20camp/LICENSE).
