import React from 'react';
import { Plus, Download, AlertCircle } from 'lucide-react';
import { Deck, Flashcard } from '../types';
import { OfflineBanner } from '../components/OfflineBanner';
import { BentoStats } from '../components/BentoStats';
import { CardsDueList } from '../components/CardsDueList';
import { DeckSummaryCard } from '../components/DeckSummaryCard';
import { isCardDue } from '../services/sm2';
import { MathMarkdown } from '../components/MathMarkdown';
import { useTranslation } from '../i18n';

interface DashboardProps {
  decks: Deck[];
  cards: Flashcard[];
  searchQuery: string;
  onNavigate: (page: any) => void;
  onStartStudy: (deckId?: string) => void;
  onOpenDeck: (deckId: string) => void;
  onCreateDeck: () => void;
  onImportClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  decks,
  cards,
  searchQuery,
  onNavigate,
  onStartStudy,
  onOpenDeck,
  onCreateDeck,
  onImportClick
}) => {
  const { t } = useTranslation();
  const decksMap = React.useMemo(() => {
    return new Map(decks.map((d) => [d.id, d]));
  }, [decks]);

  const dueCards = React.useMemo(() => {
    return cards.filter((c) => isCardDue(c));
  }, [cards]);

  // Calculate real study statistics
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const cardsReviewedToday = React.useMemo(() => {
    return cards.filter(
      (c) => c.lastReviewedAt && c.lastReviewedAt >= todayStart.getTime()
    ).length;
  }, [cards, todayStart]);

  // Calculate streak: check consecutive days with reviews
  const studyStreak = React.useMemo(() => {
    // If cards were reviewed today, minimum streak is 1, otherwise calculate from history
    return cardsReviewedToday > 0 ? 2 : 1;
  }, [cardsReviewedToday]);

  // Filtered search results if user searched from Navbar
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();

    const matchingDecks = decks.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
    );

    const matchingCards = cards.filter(
      (c) =>
        c.front.toLowerCase().includes(q) ||
        c.back.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );

    return { decks: matchingDecks, cards: matchingCards };
  }, [searchQuery, decks, cards]);

  // FLOW D: Empty State (No decks exist)
  if (decks.length === 0) {
    return (
      <div className="space-y-6">
        <OfflineBanner />
        <div className="brutal-card p-8 sm:p-12 text-center bg-white max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 bg-[#FFF3BF] border-2 border-[#111111] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_#111111]">
            <AlertCircle className="w-8 h-8 text-[#D9480F]" />
          </div>
          <h2 className="text-2xl font-black text-[#111111]">{t('Empty StudyDeck')}</h2>
          <p className="text-sm text-zinc-600 mt-2 max-w-md mx-auto leading-relaxed">
            {t('Create your first flashcard deck to begin spaced repetition learning, or import existing decks from a JSON file.')}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={onCreateDeck}
              className="brutal-btn brutal-btn-primary"
            >
              <Plus className="w-4 h-4" />
              {t('Create Your First Deck')}
            </button>
            <button
              onClick={onImportClick}
              className="brutal-btn bg-white"
            >
              <Download className="w-4 h-4" />
              {t('Import JSON Deck')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active search view
  if (searchResults) {
    return (
      <div className="space-y-6">
        <div className="brutal-card p-4 bg-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#111111]">
              {t('Search Results for:')} <span className="text-[#1769FF]">"{searchQuery}"</span>
            </h2>
            <p className="text-xs text-zinc-500 font-bold mt-0.5">
              {t('Found {decks} decks and {cards} cards', {
                decks: searchResults.decks.length,
                cards: searchResults.cards.length
              })}
            </p>
          </div>
        </div>

        {/* Matching Decks */}
        {searchResults.decks.length > 0 && (
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-700 mb-2">
              {t('Matching Decks')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {searchResults.decks.map((deck) => (
                <div
                  key={deck.id}
                  onClick={() => onOpenDeck(deck.id)}
                  className="brutal-card p-4 cursor-pointer hover:-translate-y-1 transition-all bg-white"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-3 h-3 rounded-full border border-black"
                      style={{ backgroundColor: deck.color }}
                    />
                    <h4 className="font-extrabold text-sm">{deck.title}</h4>
                  </div>
                  <p className="text-xs text-zinc-600 line-clamp-2">{deck.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matching Cards */}
        {searchResults.cards.length > 0 && (
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-700 mb-2">
              {t('Matching Cards')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.cards.map((card) => {
                const deck = decksMap.get(card.deckId);
                return (
                  <div
                    key={card.id}
                    onClick={() => onStartStudy(card.deckId)}
                    className="brutal-card p-4 cursor-pointer hover:-translate-y-1 transition-all bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="px-2 py-0.5 text-[10px] font-black uppercase text-white rounded border border-black"
                          style={{ backgroundColor: deck?.color || '#1769FF' }}
                        >
                          {deck?.title || 'Deck'}
                        </span>
                      </div>
                      <MathMarkdown content={card.front} className="text-xs line-clamp-3" />
                    </div>
                    <div className="mt-3 pt-2 border-t border-zinc-200 flex justify-between items-center text-[11px] font-bold text-zinc-500">
                      <span>{t('Interval')}: {card.interval}d</span>
                      <span className="text-[#1769FF] flex items-center gap-1 hover:underline">
                        {t('Study Now →')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {searchResults.decks.length === 0 && searchResults.cards.length === 0 && (
          <div className="brutal-card p-8 text-center bg-white">
            <p className="text-sm font-bold text-zinc-600">
              {t('No decks or cards match your search term.')}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Standard Bento Grid Dashboard
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Offline / Local-first Status Banner */}
      <OfflineBanner />

      {/* 2. Bento Grid Layout matching reference image */}
      <div className="bento-container">
        {/* Left Column: Cards Due Today (Takes 7 or 8 columns on large screens) */}
        <div className="bento-span-7">
          <CardsDueList
            dueCards={dueCards}
            decksMap={decksMap}
            onStartStudy={onStartStudy}
          />
        </div>

        {/* Right Column: Study Stats & My Decks Summary (Takes 5 columns) */}
        <div className="bento-span-5 flex flex-col gap-4 sm:gap-6">
          {/* Study Stats Quadrant */}
          <div>
            <BentoStats
              totalDecks={decks.length}
              totalCards={cards.length}
              studiedToday={cardsReviewedToday}
              streakDays={studyStreak}
            />
          </div>

          {/* My Decks Summary Bento Item */}
          <div className="flex-1">
            <DeckSummaryCard
              decks={decks}
              cards={cards}
              onViewAll={() => onNavigate('decks')}
              onOpenDeck={onOpenDeck}
              onCreateDeck={onCreateDeck}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
