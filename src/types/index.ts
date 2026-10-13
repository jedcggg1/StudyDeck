export type StudyRating = 'again' | 'hard' | 'good' | 'easy';

export interface Flashcard {
  id: string;
  deckId: string;
  front: string; // Markdown + LaTeX
  back: string;  // Markdown + LaTeX
  tags: string[];
  repetition: number;     // Number of consecutive successful recalls
  interval: number;       // In days
  easeFactor: number;     // SM-2 Ease Factor, default 2.5, min 1.3
  nextReviewDate: number; // Unix timestamp in ms
  lastReviewedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  icon: string;           // Built-in icon id or a data:image/* URL for a custom uploaded icon.
  color: string;          // Neo-brutalist accent color: '#1769FF', '#12A05C', '#7950F2', etc.
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ReviewLog {
  id: string;
  cardId: string;
  deckId: string;
  rating: StudyRating;
  quality: number;        // SM-2 quality: 1, 3, 4, 5
  previousInterval: number;
  newInterval: number;
  previousEaseFactor: number;
  newEaseFactor: number;
  reviewedAt: number;     // Timestamp in ms
}

export interface FormulaTemplate {
  id: string;
  name: string;
  category: string;
  code: string;           // LaTeX/markdown snippet to insert
  description?: string;
  isCustom?: boolean;     // User-added templates
}

export interface AppSettings {
  id: string;             // Fixed key 'app_settings'
  theme: 'brutalist-light' | 'brutalist-high-contrast' | 'brutalist-dark';
  language: 'en' | 'th';
  maxNewCardsPerDay: number;
  maxReviewsPerDay: number;
  soundEnabled: boolean;
  hasCompletedOnboarding: boolean;
  syncServerUrl?: string;
  lastSyncTimestamp?: number;
  formulaTemplates?: FormulaTemplate[];
}

export interface SM2State {
  repetition: number;
  interval: number;
  easeFactor: number;
}

export interface SM2Result {
  repetition: number;
  interval: number;
  easeFactor: number;
  nextReviewDate: number;
}

export interface ExportData {
  schemaVersion: 'studydeck_v1';
  exportedAt: string;
  source: string;
  decks: Deck[];
  cards: Flashcard[];
}
