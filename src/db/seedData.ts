import { Deck, Flashcard } from '../types';

const now = Date.now();
const oneHourAgo = now - 3600 * 1000;
const twoHoursAgo = now - 7200 * 1000;
const fourHoursAgo = now - 14400 * 1000;
const inTwoHours = now + 7200 * 1000;
const inTwoDays = now + 2 * 24 * 3600 * 1000;
const inFiveDays = now + 5 * 24 * 3600 * 1000;

export const SAMPLE_DECKS: Deck[] = [
  {
    id: 'deck-calculus',
    title: 'Calculus',
    description: 'Essential derivatives, integrals, limits, and multivariable theorems (แคลคูลัสและการประยุกต์ใช้)',
    icon: 'sigma',
    color: '#1769FF', // Electric blue
    tags: ['Math', 'Calculus', 'STEM'],
    createdAt: now - 86400000 * 7,
    updatedAt: now
  },
  {
    id: 'deck-chemistry',
    title: 'Chemistry',
    description: 'Thermodynamics, gas laws, chemical kinetics, and molecular structures (เคมีและพันธะโมเลกุล)',
    icon: 'flask',
    color: '#12A05C', // Success green
    tags: ['Chemistry', 'Science', 'Molecules'],
    createdAt: now - 86400000 * 6,
    updatedAt: now
  },
  {
    id: 'deck-physics',
    title: 'Physics',
    description: 'Classical mechanics, wave equations, thermodynamics, and electromagnetism (ฟิสิกส์พื้นฐาน)',
    icon: 'atom',
    color: '#7950F2', // Deep purple / violet
    tags: ['Physics', 'Mechanics', 'Waves'],
    createdAt: now - 86400000 * 5,
    updatedAt: now
  }
];

export const SAMPLE_CARDS: Flashcard[] = [
  // CALCULUS CARDS
  {
    id: 'card-calc-1',
    deckId: 'deck-calculus',
    front: `### Indefinite Integral of $x^2$
Calculate the indefinite integral:
$$\\int x^2 \\, dx$$`,
    back: `### Result & Constant
$$\\int x^2 \\, dx = \\frac{x^3}{3} + C$$

*Key Concept:*
- Use the power rule for integration: $\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C$ for $n \\neq -1$.
- Don't forget the arbitrary constant of integration $C$ (ค่าคงที่ของการอินทิเกรต).`,
    tags: ['Integration', 'Power-Rule'],
    repetition: 2,
    interval: 6,
    easeFactor: 2.5,
    nextReviewDate: oneHourAgo, // Due today!
    lastReviewedAt: now - 86400000 * 6,
    createdAt: now - 86400000 * 7,
    updatedAt: now
  },
  {
    id: 'card-calc-2',
    deckId: 'deck-calculus',
    front: `### Fundamental Theorem of Calculus (FTC)
What is Part 1 of the Fundamental Theorem of Calculus for continuous function $f(t)$?
$$g(x) = \\int_a^x f(t) \\, dt$$`,
    back: `### Derivative of an Accumulation Function
$$g'(x) = \\frac{d}{dx} \\left[ \\int_a^x f(t) \\, dt \\right] = f(x)$$

**คำอธิบาย (ภาษาไทย):**
ทฤษฎีบทมูลฐานของแคลคูลัสเชื่อมโยงอนุพันธ์เข้ากับอินทิกรัล โดยอนุพันธ์ของฟังก์ชันสะสมพื้นที่คือฟังก์ชันเดิม $f(x)$`,
    tags: ['Theorems', 'FTC'],
    repetition: 1,
    interval: 1,
    easeFactor: 2.4,
    nextReviewDate: twoHoursAgo, // Due today!
    lastReviewedAt: now - 86400000 * 1,
    createdAt: now - 86400000 * 7,
    updatedAt: now
  },
  {
    id: 'card-calc-3',
    deckId: 'deck-calculus',
    front: `### Special Limit of Trigonometric Function
Evaluate the fundamental trigonometric limit:
$$\\lim_{x \\to 0} \\frac{\\sin x}{x}$$`,
    back: `### Limit Value
$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$

*Notes:*
- Essential for deriving $\\frac{d}{dx}[\\sin x] = \\cos x$.
- Proven geometrically using the Squeeze Theorem (ทฤษฎีบทบีบอัด).`,
    tags: ['Limits', 'Trigonometry'],
    repetition: 3,
    interval: 15,
    easeFactor: 2.6,
    nextReviewDate: inFiveDays, // Future review
    lastReviewedAt: now - 86400000 * 2,
    createdAt: now - 86400000 * 7,
    updatedAt: now
  },
  {
    id: 'card-calc-4',
    deckId: 'deck-calculus',
    front: `### Derivative of $e^{g(x)}$
State the chain rule formula for exponential expressions:
$$\\frac{d}{dx} \\left[ e^{g(x)} \\right]$$`,
    back: `### Solution
$$\\frac{d}{dx} \\left[ e^{g(x)} \\right] = e^{g(x)} \\cdot g'(x)$$

*Example:*
$$\\frac{d}{dx}\\left[e^{3x^2}\\right] = e^{3x^2} \\cdot (6x) = 6x e^{3x^2}$$`,
    tags: ['Derivatives', 'ChainRule'],
    repetition: 0,
    interval: 0,
    easeFactor: 2.5,
    nextReviewDate: fourHoursAgo, // Due today!
    createdAt: now - 86400000 * 3,
    updatedAt: now
  },

  // CHEMISTRY CARDS
  {
    id: 'card-chem-1',
    deckId: 'deck-chemistry',
    front: `### Ideal Gas Law
State the equation relating Pressure, Volume, Moles, Gas Constant, and Temperature:
$$PV = nRT$$
Identify each variable and standard SI units.`,
    back: `### Variables & Constants
$$PV = nRT$$

- $P$: Pressure (ความดัน หน่วย Pa หรือ atm)
- $V$: Volume (ปริมาตร หน่วย $m^3$ หรือ $L$)
- $n$: Amount of substance (ปริมาณสาร หน่วย mol)
- $R$: Ideal Gas Constant ($8.314 \\, \\text{J}/(\\text{mol}\\cdot\\text{K})$ or $0.08206 \\, \\text{L}\\cdot\\text{atm}/(\\text{mol}\\cdot\\text{K})$)
- $T$: Absolute temperature in Kelvin ($T_{\\text{K}} = T_{\\text{C}} + 273.15$)`,
    tags: ['Thermodynamics', 'Gases'],
    repetition: 2,
    interval: 6,
    easeFactor: 2.5,
    nextReviewDate: oneHourAgo, // Due today!
    lastReviewedAt: now - 86400000 * 6,
    createdAt: now - 86400000 * 6,
    updatedAt: now
  },
  {
    id: 'card-chem-2',
    deckId: 'deck-chemistry',
    front: `### Lewis Structure of $\\text{H}_2\\text{O}$
Draw or describe the geometry and bond angle of the water molecule:
$$\\text{H}_2\\text{O}$$`,
    back: `### Bent Geometry
- Central atom: Oxygen (O) with **2 bonding pairs** and **2 lone pairs**.
- Electron geometry: **Tetrahedral**
- Molecular geometry: **Bent (โครงสร้างงอรูปตัว V)**
- Bond angle: approximately **$104.5^\\circ$** (compressed from $109.5^\\circ$ due to lone pair repulsion).
- Strong **Hydrogen bonding** capability (สร้างพันธะไฮโดรเจนได้ดี).`,
    tags: ['Lewis', 'MolecularGeometry'],
    repetition: 1,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: inTwoHours,
    lastReviewedAt: now - 86400000 * 1,
    createdAt: now - 86400000 * 6,
    updatedAt: now
  },
  {
    id: 'card-chem-3',
    deckId: 'deck-chemistry',
    front: `### Gibbs Free Energy Equation
What formula relates spontaneity ($\\Delta G$) with enthalpy ($\\Delta H$) and entropy ($\\Delta S$)?`,
    back: `### Fundamental Relation
$$\\Delta G = \\Delta H - T\\Delta S$$

**Spontaneity Criteria:**
- $\\Delta G < 0$: Spontaneous process (กระบวนการเกิดขึ้นได้เอง)
- $\\Delta G = 0$: Dynamic equilibrium (สมดุลเคมี)
- $\\Delta G > 0$: Non-spontaneous (ต้องใช้พลังงาน)`,
    tags: ['Thermodynamics', 'Equilibrium'],
    repetition: 2,
    interval: 6,
    easeFactor: 2.5,
    nextReviewDate: inTwoDays,
    lastReviewedAt: now - 86400000 * 4,
    createdAt: now - 86400000 * 6,
    updatedAt: now
  },

  // PHYSICS CARDS
  {
    id: 'card-phys-1',
    deckId: 'deck-physics',
    front: `### Topic: Newton's Second Law
State Newton's Second Law of Motion in vector form and explain its significance:
$$\\vec{F} = m \\cdot \\vec{a}$$`,
    back: `### Definition & Meaning
$$\\vec{F}_{\\text{net}} = m \\cdot \\vec{a} = \\frac{d\\vec{p}}{dt}$$

**Key Points:**
- Net force $\\vec{F}$ is directly proportional to acceleration $\\vec{a}$ and mass $m$.
- SI Unit of force: $1 \\, \\text{Newton (N)} = 1 \\, \\text{kg}\\cdot\\text{m}/\\text{s}^2$.
- In terms of momentum $\\vec{p}$: Force is the rate of change of momentum (แรงคืออัตราการเปลี่ยนแปลงของโมเมนตัม ตามกฎการเคลื่อนที่ข้อที่ 2 ของนิวตัน).`,
    tags: ['Mechanics', 'Newton'],
    repetition: 1,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: twoHoursAgo, // Due today!
    lastReviewedAt: now - 86400000 * 1,
    createdAt: now - 86400000 * 5,
    updatedAt: now
  },
  {
    id: 'card-phys-2',
    deckId: 'deck-physics',
    front: `### One-Dimensional Classical Wave Equation
Write down the partial differential equation governing wave propagation with speed $v$:`,
    back: `### Wave Equation
$$\\frac{\\partial^2 y}{\\partial x^2} = \\frac{1}{v^2} \\frac{\\partial^2 y}{\\partial t^2}$$

- $y(x,t)$: Wave displacement at position $x$ and time $t$
- $v$: Wave phase speed ($v = \\lambda f$)
- Solutions have the general form: $y(x,t) = f(x - vt) + g(x + vt)$ (d'Alembert's formula)`,
    tags: ['Waves', 'DifferentialEquations'],
    repetition: 2,
    interval: 6,
    easeFactor: 2.45,
    nextReviewDate: oneHourAgo, // Due today!
    lastReviewedAt: now - 86400000 * 6,
    createdAt: now - 86400000 * 5,
    updatedAt: now
  },
  {
    id: 'card-phys-3',
    deckId: 'deck-physics',
    front: `### Mass-Energy Equivalence
What is Albert Einstein's famous equation relating rest mass $m$ to energy $E$?`,
    back: `### Relativistic Energy
$$E_0 = m c^2$$

- $c \\approx 3 \\times 10^8 \\, \\text{m/s}$ (Speed of light in vacuum)
- For a moving particle with momentum $p$:
$$E^2 = (pc)^2 + (m c^2)^2$$
- Converted in nuclear fission and fusion (ฟิชชันและฟิวชันนิวเคลียร์)`,
    tags: ['Relativity', 'ModernPhysics'],
    repetition: 3,
    interval: 14,
    easeFactor: 2.6,
    nextReviewDate: inFiveDays,
    lastReviewedAt: now - 86400000 * 3,
    createdAt: now - 86400000 * 5,
    updatedAt: now
  }
];

/**
 * Seeds initial sample decks and cards if the database is currently empty.
 */
export async function seedInitialDataIfEmpty(database: any): Promise<boolean> {
  const deckCount = await database.decks.count();
  if (deckCount === 0) {
    await database.decks.bulkAdd(SAMPLE_DECKS);
    await database.cards.bulkAdd(SAMPLE_CARDS);
    
    // Add sample historical review logs so statistics charts show realistic insights immediately!
    const sampleLogs = [
      {
        id: 'log-1',
        cardId: 'card-calc-1',
        deckId: 'deck-calculus',
        rating: 'good',
        quality: 4,
        previousInterval: 1,
        newInterval: 6,
        previousEaseFactor: 2.5,
        newEaseFactor: 2.5,
        reviewedAt: now - 86400000 * 6
      },
      {
        id: 'log-2',
        cardId: 'card-chem-1',
        deckId: 'deck-chemistry',
        rating: 'good',
        quality: 4,
        previousInterval: 1,
        newInterval: 6,
        previousEaseFactor: 2.5,
        newEaseFactor: 2.5,
        reviewedAt: now - 86400000 * 6
      },
      {
        id: 'log-3',
        cardId: 'card-phys-1',
        deckId: 'deck-physics',
        rating: 'easy',
        quality: 5,
        previousInterval: 0,
        newInterval: 2,
        previousEaseFactor: 2.5,
        newEaseFactor: 2.6,
        reviewedAt: now - 86400000 * 1
      },
      {
        id: 'log-4',
        cardId: 'card-calc-2',
        deckId: 'deck-calculus',
        rating: 'hard',
        quality: 3,
        previousInterval: 0,
        newInterval: 1,
        previousEaseFactor: 2.5,
        newEaseFactor: 2.36,
        reviewedAt: now - 86400000 * 1
      }
    ];
    await database.reviewLogs.bulkAdd(sampleLogs);
    return true;
  }
  return false;
}
