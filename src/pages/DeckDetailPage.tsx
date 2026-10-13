import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Play, Search, Edit, Trash2, Calendar, Repeat } from 'lucide-react';
import { Deck, Flashcard } from '../types';
import { MathMarkdown } from '../components/MathMarkdown';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { isCardDue } from '../services/sm2';
import { useTranslation } from '../i18n';

interface DeckDetailPageProps {
  deck: Deck;
  cards: Flashcard[];
  onBack: () => void;
  onStartStudy: (deckId: string) => void;
  onAddCard: (deckId: string) => void;
  onDeleteDeck: (deckId: string) => void;
  onEditCard: (card: Flashcard) => void;
  onDeleteCard: (cardId: string) => void;
}

export const DeckDetailPage: React.FC<DeckDetailPageProps> = ({
  deck,
  cards,
  onBack,
  onStartStudy,
  onAddCard,
  onDeleteDeck,
  onEditCard,
  onDeleteCard
}) => {
  const [search, setSearch] = useState('');
  const [pendingDeckDelete, setPendingDeckDelete] = useState(false);
  const [pendingCardDelete, setPendingCardDelete] = useState<{ id: string; front: string } | null>(null);
  const { t } = useTranslation();

  const deckCards = useMemo(() => {
    return cards.filter((c) => c.deckId === deck.id);
  }, [cards, deck.id]);

  const filteredCards = useMemo(() => {
    if (!search.trim()) return deckCards;
    const q = search.toLowerCase();
    return deckCards.filter(
      (c) =>
        c.front.toLowerCase().includes(q) ||
        c.back.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [deckCards, search]);

  const dueCount = useMemo(() => {
    return deckCards.filter((c) => isCardDue(c)).length;
  }, [deckCards]);

  return (
    <div className="space-y-6">
      {/* Back button & Deck Header */}
      <div>
        <button
          onClick={onBack}
          className="brutal-btn bg-white !py-1.5 !px-3 !text-xs mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('Back to Decks')}
        </button>

        <div className="brutal-card p-6 bg-white overflow-hidden border-t-8" style={{ borderTopColor: deck.color }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full border border-black"
                  style={{ backgroundColor: deck.color }}
                />
                <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                  {deck.title}
                </h1>
              </div>
              <p className="text-sm text-zinc-600 font-medium mt-1 max-w-2xl leading-relaxed">
                {deck.description || t('No description provided.')}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="brutal-badge bg-white text-zinc-800">
                  {deckCards.length} {t('Total Cards')}
                </span>
                <span className={`brutal-badge ${dueCount > 0 ? 'bg-[#FF922B] text-black' : 'bg-[#EBFBEE] text-[#0B7A43]'}`}>
                  {dueCount} {t('Due for Review')}
                </span>
                {deck.tags.map((t) => (
                  <span key={t} className="brutal-badge bg-[#F8F7F2] text-zinc-600">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 md:max-w-xl">
              <button
                onClick={() => onAddCard(deck.id)}
                className="brutal-btn bg-white !text-xs justify-center"
              >
                <Plus className="w-4 h-4" />
                {t('Add Card')}
              </button>

              <button
                onClick={() => onStartStudy(deck.id)}
                disabled={deckCards.length === 0}
                className="brutal-btn brutal-btn-primary !text-xs justify-center"
              >
                <Play className="w-4 h-4 fill-white" />
                {t('Study Deck')} ({deckCards.length})
              </button>

              <button
                onClick={() => setPendingDeckDelete(true)}
                className="brutal-btn !bg-red-50 !text-red-700 !border-red-700 !shadow-[2px_2px_0px_#b91c1c] !text-xs justify-center"
              >
                <Trash2 className="w-4 h-4" />
                {t('Delete Deck')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards List Search & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-lg font-black text-[#111111]">
          {t('Flashcards')} ({filteredCards.length})
        </h2>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('Search cards in this deck...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="brutal-input !py-1.5 !pl-9 text-xs"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="brutal-card p-10 text-center bg-white">
          <p className="text-sm font-bold text-zinc-600">
            {deckCards.length === 0
              ? t('This deck has no flashcards yet. Click "Add Card" above to create one!')
              : t('No flashcards matched your search.')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCards.map((card, idx) => {
            const isDue = isCardDue(card);

            return (
              <div
                key={card.id}
                className="brutal-card bg-white p-4 sm:p-5 flex flex-col md:flex-row gap-4 justify-between"
              >
                {/* Front & Back side previews */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-[#F8F7F2] border-2 border-black rounded shadow-[2px_2px_0px_#111]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase text-zinc-600 bg-white px-1.5 py-0.5 border border-black rounded">
                        {t('Card')} #{idx + 1} • {t('Front')}
                      </span>
                      {isDue && (
                        <span className="text-[10px] font-black bg-[#FF922B] text-black px-1.5 py-0.5 border border-black rounded">
                          {t('DUE NOW')}
                        </span>
                      )}
                    </div>
                    <MathMarkdown content={card.front} className="text-xs" />
                  </div>

                  <div className="p-3 bg-white border-2 border-black rounded shadow-[2px_2px_0px_#111]">
                    <span className="text-[10px] font-black uppercase text-zinc-600 bg-[#EAE6DF] px-1.5 py-0.5 border border-black rounded inline-block mb-1.5">
                      {t('Back (Solution)')}
                    </span>
                    <MathMarkdown content={card.back} className="text-xs" />
                  </div>
                </div>

                {/* SM-2 metadata & actions */}
                <div className="flex md:flex-col justify-between items-end md:items-stretch gap-2 shrink-0 md:w-36 pt-2 md:pt-0 border-t md:border-t-0 md:border-l md:pl-4 border-zinc-200">
                  <div className="space-y-1 text-[11px] font-bold text-zinc-600">
                    <div className="flex items-center gap-1.5">
                      <Repeat className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{t('Reps')}: {card.repetition}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{t('Interval')}: {card.interval}d</span>
                    </div>
                    <div>
                      <span>{t('Ease')}: {card.easeFactor.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditCard(card)}
                      className="p-1.5 bg-white border border-black rounded hover:bg-[#1769FF] hover:text-white hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all shadow-[1px_1px_0px_#000]"
                      title={t('Edit Flashcard')}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPendingCardDelete({ id: card.id, front: card.front })}
                      className="p-1.5 bg-white text-red-600 border border-black rounded hover:bg-[#FA5252] hover:text-white hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all shadow-[1px_1px_0px_#000]"
                      title={t('Delete Flashcard')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* In-app delete confirmations (replace native confirm) */}
      {pendingDeckDelete && (
        <ConfirmDialog
          title={t('Delete deck?')}
          message={t('Delete deck "{title}" and its {count} cards?', {
            title: deck.title,
            count: deckCards.length
          })}
          confirmLabel={t('Delete Deck')}
          onConfirm={() => {
            setPendingDeckDelete(false);
            onDeleteDeck(deck.id);
          }}
          onCancel={() => setPendingDeckDelete(false)}
        />
      )}
      {pendingCardDelete && (
        <ConfirmDialog
          title={t('Delete flashcard?')}
          message={t('This flashcard and its review history will be permanently deleted.')}
          confirmLabel={t('Delete Flashcard')}
          onConfirm={() => {
            setPendingCardDelete(null);
            onDeleteCard(pendingCardDelete.id);
          }}
          onCancel={() => setPendingCardDelete(null)}
        />
      )}
    </div>
  );
};
