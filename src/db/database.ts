import Dexie, { type Table } from 'dexie';
import { Deck, Flashcard, ReviewLog, AppSettings } from '../types';

export class StudyDeckDB extends Dexie {
  decks!: Table<Deck, string>;
  cards!: Table<Flashcard, string>;
  reviewLogs!: Table<ReviewLog, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('StudyDeckDatabase');

    // Schema definition with indexed properties
    this.version(1).stores({
      decks: 'id, title, createdAt, updatedAt',
      cards: 'id, deckId, nextReviewDate, repetition, interval, createdAt, updatedAt',
      reviewLogs: 'id, cardId, deckId, rating, reviewedAt',
      settings: 'id'
    });
  }
}

export const db = new StudyDeckDB();

/**
 * Default application settings
 */
export const DEFAULT_SETTINGS: AppSettings = {
  id: 'app_settings',
  theme: 'brutalist-light',
  language: 'en',
  maxNewCardsPerDay: 20,
  maxReviewsPerDay: 100,
  soundEnabled: true,
  hasCompletedOnboarding: false
};

/**
 * Initialize settings if not already present
 */
export async function getOrInitSettings(): Promise<AppSettings> {
  const existing = await db.settings.get('app_settings');
  if (existing) {
    return existing;
  }
  await db.settings.put(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}
