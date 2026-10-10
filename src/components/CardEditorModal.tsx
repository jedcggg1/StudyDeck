import React, { useState, useEffect } from 'react';
import { X, Eye, Edit3, Trash2 } from 'lucide-react';
import { Flashcard } from '../types';
import { MathMarkdown } from './MathMarkdown';
import { useTranslation } from '../i18n';

interface CardEditorModalProps {
  isOpen: boolean;
  deckId: string;
  cardToEdit?: Flashcard | null;
  onClose: () => void;
  onSave: (cardData: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt' | 'repetition' | 'interval' | 'easeFactor' | 'nextReviewDate'>, cardId?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  isOpen,
  deckId,
  cardToEdit,
  onClose,
  onSave,
  onDelete
}) => {
  const { t } = useTranslation();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cardToEdit) {
      setFront(cardToEdit.front);
      setBack(cardToEdit.back);
      setTagsInput(cardToEdit.tags.join(', '));
    } else {
      setFront('');
      setBack('');
      setTagsInput('');
    }
  }, [cardToEdit, isOpen]);

  if (!isOpen) return null;

  const insertMathSnippet = (target: 'front' | 'back', snippet: string) => {
    if (target === 'front') {
      setFront((prev) => prev + '\n' + snippet);
    } else {
      setBack((prev) => prev + '\n' + snippet);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave(
        {
          deckId,
          front: front.trim(),
          back: back.trim(),
          tags
        },
        cardToEdit?.id
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="brutal-card bg-white w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#1769FF] text-white px-5 py-3 border-b-2 border-[#111111] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-black tracking-tight">
              {cardToEdit ? t('Edit Flashcard') : t('Add New Flashcard')}
            </h3>
            {/* View Mode Toggle */}
            <div className="flex bg-black/30 p-0.5 rounded border border-black text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                  activeTab === 'edit' ? 'bg-white text-black' : 'text-white hover:text-zinc-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                {t('Editor')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                  activeTab === 'preview' ? 'bg-white text-black' : 'text-white hover:text-zinc-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                {t('Live Preview')}
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 bg-white border border-[#111111] rounded flex items-center justify-center text-black shadow-[1.5px_1.5px_0px_#111111]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Quick math formula snippets helper */}
          <div className="p-2.5 bg-[#F8F7F2] border-2 border-[#111111] rounded shadow-[2px_2px_0px_#111111]">
            <span className="text-[11px] font-black uppercase text-zinc-600 block mb-1.5">
              {t('Quick LaTeX Math Inserts:')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Integral', code: '$$\\int x^2 \\, dx = \\frac{x^3}{3} + C$$' },
                { label: 'Fraction', code: '$$\\frac{\\partial y}{\\partial x}$$' },
                { label: 'Vector Force', code: '$$\\vec{F} = m \\cdot \\vec{a}$$' },
                { label: 'Gas Law', code: '$$PV = nRT$$' },
                { label: 'Limit', code: '$$\\lim_{x \\to 0} f(x)$$' }
              ].map((snip) => (
                <button
                  key={snip.label}
                  type="button"
                  onClick={() => insertMathSnippet('front', snip.code)}
                  className="px-2 py-1 bg-white border border-[#111111] rounded text-[11px] font-bold text-zinc-800 shadow-[1px_1px_0px_#111111] hover:bg-zinc-100"
                >
                  +{t(snip.label)}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'edit' ? (
            <>
              {/* Front Side */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                  {t('Card Front (Question / Prompt) *')}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="### Question Title&#10;What is the formula for...&#10;$$\int x^2 dx$$"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  className="brutal-input font-mono text-sm leading-relaxed"
                />
              </div>

              {/* Back Side */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                  {t('Card Back (Answer / Solution) *')}
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="### Solution&#10;$$\int x^2 dx = \frac{x^3}{3} + C$$&#10;*Explanation in English or ภาษาไทย*"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  className="brutal-input font-mono text-sm leading-relaxed"
                />
              </div>
            </>
          ) : (
            /* Live Preview Mode */
            <div className="space-y-4">
              <div className="border-2 border-[#111111] rounded p-4 bg-white shadow-[2px_2px_0px_#111111]">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#1769FF] text-white rounded border border-black mb-2 inline-block">
                  {t('Front Side Preview')}
                </span>
                <MathMarkdown content={front || `*${t('No front content written yet.')}*`} />
              </div>

              <div className="border-2 border-[#111111] rounded p-4 bg-white shadow-[2px_2px_0px_#111111]">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#12A05C] text-white rounded border border-black mb-2 inline-block">
                  {t('Back Side Preview')}
                </span>
                <MathMarkdown content={back || `*${t('No back content written yet.')}*`} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
              {t('Tags (comma-separated)')}
            </label>
            <input
              type="text"
              placeholder="Formulas, Mechanics, Exam"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="brutal-input text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t-2 border-[#111111] flex items-center justify-between gap-3">
            {cardToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(t('Delete this flashcard?'))) {
                    onDelete(cardToEdit.id);
                    onClose();
                  }
                }}
                className="brutal-btn !bg-red-50 !text-red-700 !border-red-700 !shadow-[2px_2px_0px_#b91c1c] !py-2 !px-3 !text-xs"
              >
                <Trash2 className="w-4 h-4" />
                {t('Delete Card')}
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="brutal-btn bg-white !py-2 !px-4 !text-xs"
              >
                {t('Cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !front.trim() || !back.trim()}
                className="brutal-btn brutal-btn-primary !py-2 !px-5 !text-xs"
              >
                {cardToEdit ? t('Update Card') : t('Save Flashcard')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
