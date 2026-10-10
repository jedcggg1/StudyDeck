import { Deck, Flashcard, ExportData } from '../types';

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  decksCount: number;
  cardsCount: number;
  previewDecks: Array<{
    id: string;
    title: string;
    cardCount: number;
    tags: string[];
  }>;
  parsedData?: ExportData;
}

export type ConflictStrategy = 'skip' | 'overwrite' | 'duplicate';

/**
 * Creates export payload for a specific deck or all decks.
 */
export function createExportPayload(decks: Deck[], cards: Flashcard[]): ExportData {
  return {
    schemaVersion: 'studydeck_v1',
    exportedAt: new Date().toISOString(),
    source: 'StudyDeck Web App',
    decks,
    cards
  };
}

/**
 * Serializes data to formatted JSON string.
 */
export function serializeExport(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Trigger browser file download for exported JSON.
 */
export function downloadJsonFile(filename: string, jsonString: string): void {
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates raw JSON string or object against StudyDeck schema.
 */
export function validateImportJson(rawInput: string | unknown): ImportValidationResult {
  const errors: string[] = [];

  let data: any;
  if (typeof rawInput === 'string') {
    try {
      data = JSON.parse(rawInput);
    } catch (e: any) {
      return {
        valid: false,
        errors: [`Invalid JSON format: ${e.message}`],
        decksCount: 0,
        cardsCount: 0,
        previewDecks: []
      };
    }
  } else {
    data = rawInput;
  }

  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: ['Import payload must be a JSON object.'],
      decksCount: 0,
      cardsCount: 0,
      previewDecks: []
    };
  }

  // Schema version validation
  if (data.schemaVersion !== 'studydeck_v1') {
    errors.push(`Unsupported or missing schemaVersion: expected "studydeck_v1", got "${data.schemaVersion || 'none'}".`);
  }

  // Decks array validation
  if (!Array.isArray(data.decks)) {
    errors.push('Payload must contain a "decks" array.');
  }

  // Cards array validation
  if (!Array.isArray(data.cards)) {
    errors.push('Payload must contain a "cards" array.');
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      decksCount: 0,
      cardsCount: 0,
      previewDecks: []
    };
  }

  // Validate individual decks
  const validDecks: Deck[] = [];
  data.decks.forEach((deck: any, idx: number) => {
    if (!deck.id || typeof deck.id !== 'string') {
      errors.push(`Deck at index ${idx} is missing a valid 'id'.`);
    } else if (!deck.title || typeof deck.title !== 'string') {
      errors.push(`Deck "${deck.id}" is missing a valid 'title'.`);
    } else {
      validDecks.push({
        id: String(deck.id),
        title: String(deck.title),
        description: String(deck.description || ''),
        icon: String(deck.icon || 'book'),
        color: String(deck.color || '#1769FF'),
        tags: Array.isArray(deck.tags) ? deck.tags.map(String) : [],
        createdAt: Number(deck.createdAt || Date.now()),
        updatedAt: Number(deck.updatedAt || Date.now())
      });
    }
  });

  // Validate individual cards
  const validCards: Flashcard[] = [];
  data.cards.forEach((card: any, idx: number) => {
    if (!card.id || typeof card.id !== 'string') {
      errors.push(`Card at index ${idx} is missing a valid 'id'.`);
    } else if (!card.deckId || typeof card.deckId !== 'string') {
      errors.push(`Card "${card.id}" is missing a valid 'deckId'.`);
    } else if (card.front === undefined || card.back === undefined) {
      errors.push(`Card "${card.id}" is missing 'front' or 'back' content.`);
    } else {
      validCards.push({
        id: String(card.id),
        deckId: String(card.deckId),
        front: String(card.front),
        back: String(card.back),
        tags: Array.isArray(card.tags) ? card.tags.map(String) : [],
        repetition: Number(card.repetition || 0),
        interval: Number(card.interval || 0),
        easeFactor: Number(card.easeFactor || 2.5),
        nextReviewDate: Number(card.nextReviewDate || Date.now()),
        lastReviewedAt: card.lastReviewedAt ? Number(card.lastReviewedAt) : undefined,
        createdAt: Number(card.createdAt || Date.now()),
        updatedAt: Number(card.updatedAt || Date.now())
      });
    }
  });

  const previewDecks = validDecks.map(deck => ({
    id: deck.id,
    title: deck.title,
    cardCount: validCards.filter(c => c.deckId === deck.id).length,
    tags: deck.tags
  }));

  const valid = errors.length === 0;

  return {
    valid,
    errors,
    decksCount: validDecks.length,
    cardsCount: validCards.length,
    previewDecks,
    parsedData: valid
      ? {
          schemaVersion: 'studydeck_v1',
          exportedAt: data.exportedAt || new Date().toISOString(),
          source: data.source || 'Imported Data',
          decks: validDecks,
          cards: validCards
        }
      : undefined
  };
}

/**
 * Resolves ID conflicts and applies import strategy against existing records.
 */
export function resolveImportConflicts(
  imported: ExportData,
  existingDecks: Deck[],
  existingCards: Flashcard[],
  strategy: ConflictStrategy
): { decksToSave: Deck[]; cardsToSave: Flashcard[] } {
  const existingDeckIds = new Set(existingDecks.map(d => d.id));
  const existingCardIds = new Set(existingCards.map(c => c.id));

  let decksToSave: Deck[] = [];
  let cardsToSave: Flashcard[] = [];

  if (strategy === 'skip') {
    // Only add items that don't already exist
    decksToSave = imported.decks.filter(d => !existingDeckIds.has(d.id));
    cardsToSave = imported.cards.filter(c => !existingCardIds.has(c.id));
  } else if (strategy === 'overwrite') {
    // Replace existing with imported
    decksToSave = [...imported.decks];
    cardsToSave = [...imported.cards];
  } else if (strategy === 'duplicate') {
    // Generate new unique IDs for everything
    const deckIdMap = new Map<string, string>();

    decksToSave = imported.decks.map(d => {
      const newId = `deck-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      deckIdMap.set(d.id, newId);
      return {
        ...d,
        id: newId,
        title: `${d.title} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    });

    cardsToSave = imported.cards.map(c => {
      const newDeckId = deckIdMap.get(c.deckId) || c.deckId;
      return {
        ...c,
        id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        deckId: newDeckId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    });
  }

  return { decksToSave, cardsToSave };
}
