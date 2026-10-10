import { Flashcard, SM2Result, SM2State, StudyRating } from '../types';

/**
 * SuperMemo 2 (SM-2) Spaced Repetition Algorithm Implementation.
 * 
 * Quality mapping:
 * - 'again' -> q = 1 (Failure: blackout / failed recall)
 * - 'hard'  -> q = 3 (Success: recalled with significant effort)
 * - 'good'  -> q = 4 (Success: recalled after normal hesitation)
 * - 'easy'  -> q = 5 (Success: perfect, instant recall)
 * 
 * Formula:
 * EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 * EF' >= 1.3
 */

export const RATING_QUALITY_MAP: Record<StudyRating, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5
};

export const MIN_EASE_FACTOR = 1.3;
export const DEFAULT_EASE_FACTOR = 2.5;

/**
 * Calculates updated ease factor according to the SM-2 formula.
 */
export function calculateEaseFactor(currentEF: number, quality: number): number {
  const ef = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  // Round to 2 decimal places to maintain clean deterministic float numbers
  const rounded = Math.round(ef * 100) / 100;
  return Math.max(MIN_EASE_FACTOR, rounded);
}

/**
 * Calculates next SM-2 review parameters.
 * 
 * @param state Current repetition state (repetition count, previous interval, ease factor)
 * @param rating User rating ('again' | 'hard' | 'good' | 'easy')
 * @param referenceDate Base date for calculating nextReviewDate (defaults to now)
 * @returns Updated SM-2 parameters and next review timestamp
 */
export function calculateSM2(
  state: SM2State,
  rating: StudyRating,
  referenceDate: Date = new Date()
): SM2Result {
  const quality = RATING_QUALITY_MAP[rating];
  let { repetition, interval, easeFactor } = state;

  // Ensure valid fallback inputs
  repetition = Math.max(0, repetition || 0);
  interval = Math.max(0, interval || 0);
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor || DEFAULT_EASE_FACTOR);

  const newEaseFactor = calculateEaseFactor(easeFactor, quality);
  let newRepetition: number;
  let newInterval: number;

  if (quality < 3) {
    // Failure (rating = 'again'): Reset repetition count to 0 and interval to 1 day
    newRepetition = 0;
    newInterval = 1;
  } else {
    // Success (rating = 'hard', 'good', or 'easy')
    if (repetition === 0) {
      // First successful repetition
      if (rating === 'easy') {
        newInterval = 2; // Slight bonus for immediate easy recall on new card
      } else {
        newInterval = 1;
      }
    } else if (repetition === 1) {
      // Second successful repetition
      if (rating === 'hard') {
        newInterval = 3; // Hard cards get shorter second interval than standard 6
      } else if (rating === 'easy') {
        newInterval = 7;
      } else {
        newInterval = 6; // Standard SM-2 I(2) = 6
      }
    } else {
      // Third and subsequent repetitions: I(n) = I(n-1) * EF
      if (rating === 'hard') {
        // Apply conservative multiplier for hard to prevent overwhelming the student
        newInterval = Math.max(interval + 1, Math.round(interval * 1.2));
      } else if (rating === 'easy') {
        // Easy receives an additional 1.3x bonus on top of new Ease Factor
        newInterval = Math.round(interval * newEaseFactor * 1.3);
      } else {
        // Standard SM-2: I(n) = round(interval * EF')
        newInterval = Math.round(interval * newEaseFactor);
      }
    }
    newRepetition = repetition + 1;
  }

  // Calculate next due date
  const msInDay = 24 * 60 * 60 * 1000;
  const nextReviewDate = referenceDate.getTime() + newInterval * msInDay;

  return {
    repetition: newRepetition,
    interval: newInterval,
    easeFactor: newEaseFactor,
    nextReviewDate
  };
}

/**
 * Format interval days into human-friendly string (e.g., "1d", "6d", "1.2mo").
 */
export function formatIntervalString(days: number): string {
  if (days <= 0) return 'Immediate';
  if (days === 1) return '1d';
  if (days < 30) return `${days}d`;
  if (days < 365) {
    const months = Math.round((days / 30) * 10) / 10;
    return `${months}mo`;
  }
  const years = Math.round((days / 365) * 10) / 10;
  return `${years}y`;
}

/**
 * Previews what the interval would be for all 4 ratings on a flashcard.
 */
export function previewNextIntervals(
  card: Pick<Flashcard, 'repetition' | 'interval' | 'easeFactor'>,
  referenceDate: Date = new Date()
): Record<StudyRating, { interval: number; label: string }> {
  const ratings: StudyRating[] = ['again', 'hard', 'good', 'easy'];
  const preview: Record<string, { interval: number; label: string }> = {};

  for (const rating of ratings) {
    const res = calculateSM2(
      {
        repetition: card.repetition,
        interval: card.interval,
        easeFactor: card.easeFactor
      },
      rating,
      referenceDate
    );
    preview[rating] = {
      interval: res.interval,
      label: formatIntervalString(res.interval)
    };
  }

  return preview as Record<StudyRating, { interval: number; label: string }>;
}

/**
 * Helper to determine if a card is currently due for review.
 */
export function isCardDue(card: Flashcard, referenceDate: Date = new Date()): boolean {
  if (!card.nextReviewDate) return true;
  return card.nextReviewDate <= referenceDate.getTime();
}
