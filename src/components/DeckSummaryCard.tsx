import React from 'react';
import { ArrowRight, Plus, Atom, FlaskConical, Calculator, BookOpen } from 'lucide-react';
import { Deck, Flashcard } from '../types';
import { useTranslation } from '../i18n';

interface DeckSummaryCardProps {
  decks: Deck[];
  cards: Flashcard[];
  onViewAll: () => void;
  onOpenDeck: (deckId: string) => void;
  onCreateDeck: () => void;
}

export const DeckSummaryCard: React.FC<DeckSummaryCardProps> = ({
  decks,
  cards,
  onViewAll,
  onOpenDeck,
  onCreateDeck
}) => {
  const { t } = useTranslation();

  const getDeckIcon = (deck: Deck) => {
    if (deck.icon.startsWith('data:image/')) {
      return <img src={deck.icon} alt="" className="w-full h-full object-cover rounded" />;
    }

    switch (deck.icon) {
      case 'sigma':
        return <span className="font-serif text-2xl font-black">Σ</span>;
      case 'flask':
        return <FlaskConical className="w-6 h-6" />;
      case 'atom':
        return <Atom className="w-6 h-6" />;
      case 'calculator':
        return <Calculator className="w-6 h-6" />;
      default:
        return <BookOpen className="w-6 h-6" />;
    }
  };

  return (
    <div className="brutal-card overflow-hidden h-full flex flex-col">
      {/* Blue Header Bar */}
      <div className="bg-[#1769FF] text-white px-4 py-2.5 border-b-[2.5px] border-[#111111] flex items-center justify-between">
        <h2 className="text-base font-black tracking-tight">{t('My Decks')}</h2>
        <button
          onClick={onViewAll}
          className="text-xs font-bold flex items-center gap-1 hover:underline text-white"
        >
          {t('View All')} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Decks List */}
      <div className="p-3 sm:p-4 bg-white flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2.5">
          {decks.slice(0, 4).map((deck) => {
            const deckCards = cards.filter((c) => c.deckId === deck.id);
            const total = deckCards.length;
            // Cards with repetition >= 2 are considered mastered/graduated
            const mastered = deckCards.filter((c) => c.repetition >= 2).length;
            const progressPct = total > 0 ? Math.round((mastered / total) * 100) : 0;

            return (
              <button
                key={deck.id}
                onClick={() => onOpenDeck(deck.id)}
                className="w-full text-left p-2.5 border-2 border-[#111111] rounded shadow-[2px_2px_0px_#111111] hover:shadow-[3px_3px_0px_#111111] hover:-translate-y-0.5 transition-transform cursor-pointer flex items-center justify-between gap-3 bg-white"
                aria-label={`${t('Open Deck')}: ${deck.title}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Icon Block */}
                  <div
                    className="w-11 h-11 border-2 border-[#111111] rounded flex items-center justify-center text-white shrink-0 shadow-[1.5px_1.5px_0px_#111111]"
                    style={{ backgroundColor: deck.color }}
                  >
                    {getDeckIcon(deck)}
                  </div>

                  {/* Title & Progress */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="font-extrabold text-sm text-[#111111] truncate">
                        {deck.title}
                      </h4>
                      <span className="text-xs font-bold text-zinc-500 shrink-0">
                        {total} {t(total === 1 ? 'card' : 'cards')}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#EAE6DF] border border-[#111111] rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${progressPct}%`,
                            backgroundColor: deck.color
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-600 shrink-0">
                        {progressPct}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-zinc-400 pl-1">
                  <ArrowRight className="w-4 h-4 text-[#111111]" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Add Deck Button */}
        <button
          onClick={onCreateDeck}
          className="w-full mt-2 py-2 px-3 border-2 border-dashed border-[#111111] rounded font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#F8F7F2] transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('Create New Deck')}
        </button>
      </div>
    </div>
  );
};
