import { FormulaTemplate } from '../types';

/**
 * Built-in formula snippets grouped by subject category.
 * Users can also add their own custom templates (stored in AppSettings).
 */
export const BUILTIN_FORMULA_TEMPLATES: FormulaTemplate[] = [
  // ---------- คณิตศาสตร์ (Math) ----------
  { id: 'f-frac', name: 'Fraction', category: 'Math', code: '$$\\frac{a}{b}$$' },
  { id: 'f-sqrt', name: 'Square Root', category: 'Math', code: '$$\\sqrt{x^2 + y^2}$$' },
  { id: 'f-power', name: 'Power / Exponent', category: 'Math', code: '$$x^{n}$$' },
  { id: 'f-sub', name: 'Subscript', category: 'Math', code: '$$a_{n+1}$$' },
  { id: 'f-sum', name: 'Summation', category: 'Math', code: '$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$' },
  { id: 'f-limit', name: 'Limit', category: 'Math', code: '$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$' },
  { id: 'f-derivative', name: 'Derivative', category: 'Math', code: "$$\\frac{d}{dx}\\left(x^n\\right) = nx^{n-1}$$" },
  { id: 'f-partial', name: 'Partial Derivative', category: 'Math', code: '$$\\frac{\\partial y}{\\partial x}$$' },
  { id: 'f-integral', name: 'Integral', category: 'Math', code: '$$\\int x^2 \\, dx = \\frac{x^3}{3} + C$$' },
  { id: 'f-defintegral', name: 'Definite Integral', category: 'Math', code: '$$\\int_{a}^{b} f(x)\\, dx$$' },
  { id: 'f-quadratic', name: 'Quadratic Formula', category: 'Math', code: '$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$' },
  { id: 'f-binomial', name: 'Binomial Coefficient', category: 'Math', code: '$$\\binom{n}{r} = \\frac{n!}{r!(n-r)!}$$' },
  { id: 'f-matrix', name: 'Matrix 2x2', category: 'Math', code: '$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$' },
  { id: 'f-vector', name: 'Vector', category: 'Math', code: '$$\\vec{v} = \\langle v_x, v_y \\rangle$$' },
  { id: 'f-log', name: 'Logarithm', category: 'Math', code: '$$\\log_{a}{b} = c \\;\\Rightarrow\\; a^c = b$$' },
  { id: 'f-trig-pyth', name: 'Pythagorean Identity', category: 'Math', code: '$$\\sin^2\\theta + \\cos^2\\theta = 1$$' },

  // ---------- ฟิสิกส์ (Physics) ----------
  { id: 'f-newton2', name: "Newton's 2nd Law", category: 'Physics', code: '$$\\vec{F} = m \\cdot \\vec{a}$$' },
  { id: 'f-kinematics', name: 'Kinematics Equation', category: 'Physics', code: '$$v = v_0 + at$$' },
  { id: 'f-projectile', name: 'Projectile Range', category: 'Physics', code: '$$R = \\frac{v_0^2 \\sin 2\\theta}{g}$$' },
  { id: 'f-momentum', name: 'Momentum', category: 'Physics', code: '$$p = mv$$' },
  { id: 'f-impulse', name: 'Impulse', category: 'Physics', code: '$$J = F \\Delta t = \\Delta p$$' },
  { id: 'f-work', name: 'Work', category: 'Physics', code: '$$W = \\vec{F} \\cdot \\vec{d} = Fd\\cos\\theta$$' },
  { id: 'f-kinetic', name: 'Kinetic Energy', category: 'Physics', code: '$$E_k = \\tfrac{1}{2}mv^2$$' },
  { id: 'f-potential', name: 'Potential Energy', category: 'Physics', code: '$$E_p = mgh$$' },
  { id: 'f-ohm', name: "Ohm's Law", category: 'Physics', code: '$$V = IR$$' },
  { id: 'f-power-elec', name: 'Electrical Power', category: 'Physics', code: '$$P = VI = I^2R$$' },
  { id: 'f-coulomb', name: "Coulomb's Law", category: 'Physics', code: '$$F = k\\frac{q_1 q_2}{r^2}$$' },
  { id: 'f-emf', name: "Faraday's EMF", category: 'Physics', code: '$$\\varepsilon = -\\frac{d\\Phi_B}{dt}$$' },
  { id: 'f-wave', name: 'Wave Equation', category: 'Physics', code: '$$v = f\\lambda$$' },
  { id: 'f-photon', name: 'Photon Energy', category: 'Physics', code: '$$E = hf = \\frac{hc}{\\lambda}$$' },

  // ---------- เคมี (Chemistry) ----------
  { id: 'f-gaslaw', name: 'Ideal Gas Law', category: 'Chemistry', code: '$$PV = nRT$$' },
  { id: 'f-molarity', name: 'Molarity', category: 'Chemistry', code: '$$M = \\frac{n}{V}$$' },
  { id: 'f-ph', name: 'pH Formula', category: 'Chemistry', code: '$$pH = -\\log[H^+]$$' },
  { id: 'f-keq', name: 'Equilibrium Constant', category: 'Chemistry', code: '$$K_{eq} = \\frac{[C]^c[D]^d}{[A]^a[B]^b}$$' },
  { id: 'f-arrhenius', name: 'Arrhenius Equation', category: 'Chemistry', code: '$$k = Ae^{-E_a/RT}$$' },
  { id: 'f-enthalpy', name: 'Enthalpy Change', category: 'Chemistry', code: '$$\\Delta H = \\sum H_{products} - \\sum H_{reactants}$$' },
  { id: 'f-nernst', name: 'Nernst Equation', category: 'Chemistry', code: '$$E = E^{\\circ} - \\frac{RT}{nF}\\ln Q$$' },
  { id: 'f-density', name: 'Density', category: 'Chemistry', code: '$$\\rho = \\frac{m}{V}$$' },

  // ---------- Markdown ----------
  { id: 'f-md-bold', name: 'Bold', category: 'Markdown', code: '**ข้อความสำคัญ**' },
  { id: 'f-md-italic', name: 'Italic', category: 'Markdown', code: '*เน้นคำ*' },
  { id: 'f-md-inline-code', name: 'Inline Code', category: 'Markdown', code: '`code`' },
  { id: 'f-md-codeblock', name: 'Code Block', category: 'Markdown', code: '```js\nconsole.log("hello");\n```' },
  { id: 'f-md-quote', name: 'Blockquote', category: 'Markdown', code: '> ข้อความอ้างอิง' },
  { id: 'f-md-list', name: 'List', category: 'Markdown', code: '- ข้อที่ 1\n- ข้อที่ 2' },
];

/**
 * Merge built-in templates with user's custom templates.
 */
export function getAllTemplates(custom?: FormulaTemplate[]): FormulaTemplate[] {
  return [...BUILTIN_FORMULA_TEMPLATES, ...(custom ?? [])];
}

/**
 * Unique category list in insertion order.
 */
export function getTemplateCategories(templates: FormulaTemplate[]): string[] {
  const seen = new Set<string>();
  const cats: string[] = [];
  for (const t of templates) {
    if (!seen.has(t.category)) {
      seen.add(t.category);
      cats.push(t.category);
    }
  }
  return cats;
}
