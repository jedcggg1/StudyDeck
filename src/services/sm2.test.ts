import { describe, it, expect } from 'vitest';
import { calculateSM2, calculateEaseFactor, formatIntervalString, isCardDue } from './sm2';
import { Flashcard } from '../types';

describe('SM-2 Spaced Repetition Engine', () => {
  const baseDate = new Date('2026-05-01T12:00:00Z');

  describe('Ease Factor Calculations', () => {
    it('calculates updated ease factor correctly for rating "good" (q=4)', () => {
      // EF' = 2.5 + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02))
      // EF' = 2.5 + (0.1 - 1 * 0.1) = 2.5
      const ef = calculateEaseFactor(2.5, 4);
      expect(ef).toBe(2.5);
    });

    it('increases ease factor for rating "easy" (q=5)', () => {
      // EF' = 2.5 + (0.1 - 0) = 2.6
      const ef = calculateEaseFactor(2.5, 5);
      expect(ef).toBe(2.6);
    });

    it('decreases ease factor for rating "hard" (q=3)', () => {
      // EF' = 2.5 + (0.1 - 2 * (0.08 + 0.04)) = 2.5 + (0.1 - 0.24) = 2.36
      const ef = calculateEaseFactor(2.5, 3);
      expect(ef).toBe(2.36);
    });

    it('never allows ease factor to drop below minimum 1.3', () => {
      let ef = 1.4;
      for (let i = 0; i < 5; i++) {
        ef = calculateEaseFactor(ef, 1);
      }
      expect(ef).toBe(1.3);
    });
  });

  describe('Repetition & Interval Scheduling', () => {
    it('handles first review with rating "good"', () => {
      const state = { repetition: 0, interval: 0, easeFactor: 2.5 };
      const result = calculateSM2(state, 'good', baseDate);

      expect(result.repetition).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBe(2.5);
      // Next review should be 1 day after baseDate
      const oneDayMs = 24 * 60 * 60 * 1000;
      expect(result.nextReviewDate).toBe(baseDate.getTime() + oneDayMs);
    });

    it('handles second review with rating "good"', () => {
      const state = { repetition: 1, interval: 1, easeFactor: 2.5 };
      const result = calculateSM2(state, 'good', baseDate);

      expect(result.repetition).toBe(2);
      expect(result.interval).toBe(6);
      expect(result.nextReviewDate).toBe(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    });

    it('handles third review with rating "good"', () => {
      const state = { repetition: 2, interval: 6, easeFactor: 2.5 };
      const result = calculateSM2(state, 'good', baseDate);

      expect(result.repetition).toBe(3);
      // I(3) = round(6 * 2.5) = 15
      expect(result.interval).toBe(15);
    });

    it('resets repetition and interval on "again" rating', () => {
      const state = { repetition: 5, interval: 30, easeFactor: 2.5 };
      const result = calculateSM2(state, 'again', baseDate);

      expect(result.repetition).toBe(0);
      expect(result.interval).toBe(1);
      // EF decreases on failure
      expect(result.easeFactor).toBeLessThan(2.5);
      expect(result.nextReviewDate).toBe(baseDate.getTime() + 24 * 60 * 60 * 1000);
    });
  });

  describe('Helper functions', () => {
    it('formats interval strings properly', () => {
      expect(formatIntervalString(1)).toBe('1d');
      expect(formatIntervalString(14)).toBe('14d');
      expect(formatIntervalString(60)).toBe('2mo');
      expect(formatIntervalString(730)).toBe('2y');
    });

    it('correctly assesses due status', () => {
      const now = new Date('2026-05-01T12:00:00Z');
      const pastCard: Flashcard = {
        id: '1',
        deckId: 'd1',
        front: 'Q',
        back: 'A',
        tags: [],
        repetition: 1,
        interval: 1,
        easeFactor: 2.5,
        nextReviewDate: new Date('2026-04-30T12:00:00Z').getTime(),
        createdAt: 0,
        updatedAt: 0
      };
      const futureCard: Flashcard = {
        ...pastCard,
        nextReviewDate: new Date('2026-05-05T12:00:00Z').getTime()
      };

      expect(isCardDue(pastCard, now)).toBe(true);
      expect(isCardDue(futureCard, now)).toBe(false);
    });
  });
});
