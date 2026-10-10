import React from 'react';
import { CalendarCheck, ChevronRight, CheckCircle2, Play, Sparkles } from 'lucide-react';
import { Flashcard, Deck } from '../types';
import { useTranslation } from '../i18n';

interface CardsDueListProps {
  dueCards: Flashcard[];
  decksMap: Map<string, Deck>;
  onStartStudy: (deckId?: string) => void;
  onOpenCard?: (card: Flashcard) => void;
}

export const CardsDueList: React.FC<CardsDueListProps> = ({
  dueCards,
  decksMap,
  onStartStudy,
  onOpenCard
}) => {
  const { t } = useTranslation();

  // Helper to format due time
  const formatDueTime = (timestamp: number) => {
    const diff = timestamp - Date.now();
    if (diff < 0) {
      return t('Ready now');
    }
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    return `In ~${hours}h`;
  };

  return (
    <div className="brutal-card overflow-hidden h-full flex flex-col">
      {/* Blue Header Banner */}
      <div className="bg-[#1769FF] text-white px-4 py-3 border-b-[2.5px] border-[#111111] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-white" />
          <h2 className="text-base font-black tracking-tight">{t('Cards Due Today')}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black bg-white text-[#1769FF] px-2.5 py-0.5 rounded border border-[#111111]">
            {dueCards.length} {t(dueCards.length === 1 ? 'card' : 'cards')}
          </span>
          {dueCards.length > 0 && (
            <button
              onClick={() => onStartStudy()}
              className="brutal-btn !py-1 !px-2.5 !text-xs bg-[#FF922B] text-black !shadow-[2px_2px_0px_#111111]"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              {t('Study Now')}
            </button>
          )}
        </div>
      </div>

      {/* Due Cards List or Empty State */}
      <div className="flex-1 bg-white divide-y-2 divide-[#111111] overflow-visible max-h-none lg:overflow-y-auto lg:max-h-[460px]">
        {dueCards.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
            <div className="w-14 h-14 bg-[#EBFBEE] border-2 border-[#111111] rounded-full flex items-center justify-center shadow-[3px_3px_0px_#111111] mb-3">
              <CheckCircle2 className="w-8 h-8 text-[#12A05C]" />
            </div>
              <h3 className="text-lg font-black text-[#111111]">{t('All Caught Up!')}</h3>
            <p className="text-sm text-zinc-600 mt-1 max-w-sm">
              {t('No flashcards are due for review right now. Your memory retention is on schedule.')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => onStartStudy()}
                className="brutal-btn brutal-btn-primary !text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t('Cram / Review Anyway')}
              </button>
            </div>
          </div>
        ) : (
          dueCards.map((card) => {
            const deck = decksMap.get(card.deckId);
            const deckColor = deck?.color || '#1769FF';
            const deckTitle = deck?.title || 'Unknown Deck';

            // Clean preview of the first question content
            const frontSnippet = card.front.split('\n')[0].replace(/^###?\s*/, '') || 'Question';
            const questionPreview = card.front
              .replace(/^#{1,6}\s.*$/gm, '')
              .replace(/\$\$[\s\S]*?\$\$/g, '')
              .replace(/\$[^$\n]+\$/g, '')
              .replace(/\s+/g, ' ')
              .trim() || 'Open the card to view the full question.';

            return (
              <button
                key={card.id}
                onClick={() => (onOpenCard ? onOpenCard(card) : onStartStudy(card.deckId))}
                className="w-full text-left p-3.5 hover:bg-[#F8F7F2] active:bg-[#E7F5FF] transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                aria-label={`${t('Study Now')}: ${frontSnippet}`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="px-2 py-0.5 text-[11px] font-black uppercase text-white rounded border border-[#111111] shrink-0"
                      style={{ backgroundColor: deckColor }}
                    >
                      {deckTitle}
                    </span>
                    <span className="text-xs font-bold text-zinc-800 truncate">
                      {frontSnippet}
                    </span>
                  </div>

                  {/* KaTeX formula preview */}
                  <div className="text-xs font-medium leading-5 text-zinc-900 overflow-hidden pl-1">
                    <p className="line-clamp-2 pointer-events-none">{questionPreview}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-zinc-500 hidden sm:inline">
                    {formatDueTime(card.nextReviewDate)}
                  </span>
                  <div className="w-7 h-7 bg-white border border-[#111111] rounded flex items-center justify-center shadow-[1px_1px_0px_#111111] group-hover:bg-[#E7F5FF] group-hover:text-[#1769FF] group-active:bg-[#1769FF] group-active:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
