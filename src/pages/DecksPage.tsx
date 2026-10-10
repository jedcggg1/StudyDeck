import React, { useState, useMemo } from 'react';
import {
  Plus,
  Play,
  Copy,
  Trash2,
  Edit,
  Download,
  Tag,
  BookOpen,
  Atom,
  FlaskConical,
  Calculator,
  Search,
  X
} from 'lucide-react';
import { Deck, Flashcard } from '../types';
import { isCardDue } from '../services/sm2';
import { createExportPayload, downloadJsonFile, serializeExport } from '../services/importExport';
import { useTranslation } from '../i18n';

interface DecksPageProps {
  decks: Deck[];
  cards: Flashcard[];
  onOpenDeck: (deckId: string) => void;
  onAddCard: (deckId: string) => void;
  onStartStudy: (deckId: string) => void;
  onCreateDeck: () => void;
  onEditDeck: (deck: Deck) => void;
  onDuplicateDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
}

export const DecksPage: React.FC<DecksPageProps> = ({
  decks,
  cards,
  onOpenDeck,
  onAddCard,
  onStartStudy,
  onCreateDeck,
  onEditDeck,
  onDuplicateDeck,
  onDeleteDeck
}) => {
  const { t } = useTranslation();
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState<string>('');

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    decks.forEach((d) => d.tags.forEach((t) => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [decks]);

  // Filtered decks
  const filteredDecks = useMemo(() => {
    return decks.filter((deck) => {
      const matchesTag =
        selectedTag === 'all' || deck.tags.includes(selectedTag);
      const matchesSearch =
        !localSearch.trim() ||
        deck.title.toLowerCase().includes(localSearch.toLowerCase()) ||
        deck.description.toLowerCase().includes(localSearch.toLowerCase());
      return matchesTag && matchesSearch;
    });
  }, [decks, selectedTag, localSearch]);

  const handleExportDeck = (deck: Deck) => {
    const deckCards = cards.filter((c) => c.deckId === deck.id);
    const payload = createExportPayload([deck], deckCards);
    const serialized = serializeExport(payload);
    downloadJsonFile(`studydeck-${deck.title.toLowerCase().replace(/\s+/g, '-')}.json`, serialized);
  };

  const hasFilters = selectedTag !== 'all' || localSearch.trim().length > 0;

  const getDeckIcon = (iconName: string) => {
    if (iconName.startsWith('data:image/')) {
      return <img src={iconName} alt="" className="w-full h-full object-cover rounded" />;
    }

    switch (iconName) {
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
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="brutal-card p-4 sm:p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
            {t('My Study Decks')}
          </h1>
          <p className="text-sm font-semibold text-zinc-600 mt-1">
            {t('Manage your card collections, track mastery, and start focused study sessions.')}
          </p>
        </div>

        <button
          onClick={onCreateDeck}
          className="brutal-btn brutal-btn-primary self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          {t('Create New Deck')}
        </button>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1.5 rounded text-xs font-black border-2 border-[#111111] transition-all shrink-0 ${
              selectedTag === 'all'
                ? 'bg-[#1769FF] text-white shadow-[2px_2px_0px_#111111]'
                : 'bg-white text-zinc-800 hover:bg-[#F8F7F2]'
            }`}
          >
            {t('All Decks')} ({decks.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded text-xs font-bold border-2 border-[#111111] transition-all shrink-0 flex items-center gap-1 ${
                selectedTag === tag
                  ? 'bg-[#1769FF] text-white shadow-[2px_2px_0px_#111111]'
                  : 'bg-white text-zinc-800 hover:bg-[#F8F7F2]'
              }`}
            >
              <Tag className="w-3 h-3" />
              {tag}
            </button>
          ))}
        </div>

        {/* Local Search input */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={t('Filter decks...')}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="brutal-input !py-1.5 !pl-9 text-xs"
          />
        </div>
      </div>

      {/* Decks Grid */}
      {filteredDecks.length === 0 ? (
        <div className="brutal-card bg-white p-8 sm:p-10 text-center">
          <Search className="w-9 h-9 mx-auto text-zinc-500 mb-3" />
          <h2 className="text-lg font-black text-[#111111]">{t('No decks found')}</h2>
          <p className="text-sm text-zinc-600 mt-1">
            {hasFilters ? t('No decks match the current filters or search.') : t('No decks yet. Create your first deck to get started.')}
          </p>
          {hasFilters && (
            <button
              onClick={() => {
                setSelectedTag('all');
                setLocalSearch('');
              }}
              className="brutal-btn bg-white mt-4 !text-xs"
            >
              <X className="w-3.5 h-3.5" />
              {t('Clear Filters')}
            </button>
          )}
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDecks.map((deck) => {
          const deckCards = cards.filter((c) => c.deckId === deck.id);
          const dueCount = deckCards.filter((c) => isCardDue(c)).length;
          const masteredCount = deckCards.filter((c) => c.repetition >= 2).length;
          const total = deckCards.length;
          const progressPct = total > 0 ? Math.round((masteredCount / total) * 100) : 0;

          return (
            <div
              key={deck.id}
              className="brutal-card bg-white flex flex-col justify-between overflow-hidden brutal-card-hover"
            >
              {/* Deck Card Header */}
              <div
                className="p-4 border-b-2 border-[#111111] flex items-center justify-between"
                style={{ backgroundColor: `${deck.color}15` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded border-2 border-[#111111] flex items-center justify-center text-white shadow-[2px_2px_0px_#111111]"
                    style={{ backgroundColor: deck.color }}
                  >
                    {getDeckIcon(deck.icon)}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#111111] leading-tight">
                      {deck.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-zinc-600">
                        {total} {t(total === 1 ? 'card' : 'cards')}
                      </span>
                      {dueCount > 0 && (
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.2 bg-[#FF922B] text-black border border-black rounded">
                          {dueCount} {t('due')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Deck Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-zinc-600 font-medium line-clamp-2 leading-relaxed">
                  {deck.description || t('No description provided.')}
                </p>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-zinc-600">{t('Mastery Progress')}</span>
                    <span className="text-zinc-900">{progressPct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#EAE6DF] border border-[#111111] rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: deck.color
                      }}
                    />
                  </div>
                </div>

                {/* Tags */}
                {deck.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {deck.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 text-[10px] font-bold bg-[#F8F7F2] border border-[#111111] rounded text-zinc-700"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="p-3 border-t-2 border-[#111111] bg-[#F8F7F2] space-y-2">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onEditDeck(deck)}
                    className="brutal-icon-btn bg-white border border-[#111111] rounded text-zinc-700 hover:text-black shadow-[1px_1px_0px_#111111]"
                    title={t('Edit Deck')}
                    aria-label={t('Edit Deck')}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDuplicateDeck(deck)}
                    className="brutal-icon-btn bg-white border border-[#111111] rounded text-zinc-700 hover:text-black shadow-[1px_1px_0px_#111111]"
                    title={t('Duplicate Deck')}
                    aria-label={t('Duplicate Deck')}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleExportDeck(deck)}
                    className="brutal-icon-btn bg-white border border-[#111111] rounded text-zinc-700 hover:text-black shadow-[1px_1px_0px_#111111]"
                    title={t('Export as JSON')}
                    aria-label={t('Export as JSON')}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete deck "${deck.title}" and its ${total} cards?`)) {
                        onDeleteDeck(deck.id);
                      }
                    }}
                    className="brutal-icon-btn bg-white border border-[#111111] rounded text-red-600 hover:bg-red-50 shadow-[1px_1px_0px_#111111]"
                    title={t('Delete Deck')}
                    aria-label={t('Delete Deck')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => onAddCard(deck.id)}
                    className="brutal-btn brutal-btn-orange w-full !py-1.5 !px-1.5 !text-xs leading-tight"
                    title={t('Add Card')}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('Add Card')}</span>
                  </button>
                  <button
                    onClick={() => onOpenDeck(deck.id)}
                    className="brutal-btn bg-white w-full !py-1.5 !px-1.5 !text-xs leading-tight"
                    title={t('Open Deck')}
                  >
                    {t('Open Deck')}
                  </button>
                  <button
                    onClick={() => onStartStudy(deck.id)}
                    disabled={total === 0}
                    className="brutal-btn brutal-btn-primary w-full !py-1.5 !px-1.5 !text-xs leading-tight"
                    title={total === 0 ? t('No cards to study') : t('Study')}
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    {t('Study')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
