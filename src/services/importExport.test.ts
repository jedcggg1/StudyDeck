import { describe, it, expect } from 'vitest';
import {
  createExportPayload,
  validateImportJson,
  resolveImportConflicts
} from './importExport';
import { Deck, Flashcard } from '../types';

describe('JSON Import and Export Service', () => {
  const sampleDeck: Deck = {
    id: 'deck-1',
    title: 'Calculus 101',
    description: 'Calculus flashcards',
    icon: 'sigma',
    color: '#1769FF',
    tags: ['Math'],
    createdAt: 1000,
    updatedAt: 1000
  };

  const sampleCard: Flashcard = {
    id: 'card-1',
    deckId: 'deck-1',
    front: '$f(x) = x^2$',
    back: "$f'(x) = 2x$",
    tags: ['Derivatives'],
    repetition: 0,
    interval: 0,
    easeFactor: 2.5,
    nextReviewDate: 2000,
    createdAt: 1000,
    updatedAt: 1000
  };

  it('generates a valid export payload with correct schema version', () => {
    const payload = createExportPayload([sampleDeck], [sampleCard]);
    expect(payload.schemaVersion).toBe('studydeck_v1');
    expect(payload.decks).toHaveLength(1);
    expect(payload.cards).toHaveLength(1);
    expect(payload.source).toBe('StudyDeck Web App');
  });

  it('validates and parses valid JSON string payload', () => {
    const payload = createExportPayload([sampleDeck], [sampleCard]);
    const jsonStr = JSON.stringify(payload);

    const validation = validateImportJson(jsonStr);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    expect(validation.decksCount).toBe(1);
    expect(validation.cardsCount).toBe(1);
    expect(validation.previewDecks[0].title).toBe('Calculus 101');
    expect(validation.previewDecks[0].cardCount).toBe(1);
  });

  it('rejects malformed JSON string', () => {
    const validation = validateImportJson('{ broken json:');
    expect(validation.valid).toBe(false);
    expect(validation.errors[0]).toMatch(/Invalid JSON format/);
  });

  it('rejects unsupported schema version', () => {
    const invalidData = {
      schemaVersion: 'studydeck_v99',
      decks: [],
      cards: []
    };
    const validation = validateImportJson(invalidData);
    expect(validation.valid).toBe(false);
    expect(validation.errors[0]).toMatch(/Unsupported or missing schemaVersion/);
  });

  it('correctly applies "skip" conflict strategy', () => {
    const payload = createExportPayload([sampleDeck], [sampleCard]);
    const { decksToSave, cardsToSave } = resolveImportConflicts(
      payload,
      [sampleDeck], // existing deck
      [sampleCard], // existing card
      'skip'
    );
    expect(decksToSave).toHaveLength(0);
    expect(cardsToSave).toHaveLength(0);
  });

  it('correctly applies "duplicate" conflict strategy with new IDs', () => {
    const payload = createExportPayload([sampleDeck], [sampleCard]);
    const { decksToSave, cardsToSave } = resolveImportConflicts(
      payload,
      [sampleDeck],
      [sampleCard],
      'duplicate'
    );
    expect(decksToSave).toHaveLength(1);
    expect(decksToSave[0].id).not.toBe('deck-1');
    expect(decksToSave[0].title).toContain('(Copy)');
    expect(cardsToSave).toHaveLength(1);
    expect(cardsToSave[0].id).not.toBe('card-1');
    expect(cardsToSave[0].deckId).toBe(decksToSave[0].id);
  });
});
