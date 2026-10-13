import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Upload, ImagePlus } from 'lucide-react';
import { Deck } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { useTranslation } from '../i18n';

interface DeckEditorModalProps {
  isOpen: boolean;
  deckToEdit?: Deck | null;
  onClose: () => void;
  onSave: (deckData: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const COLOR_OPTIONS = [
  { name: 'Electric Blue', hex: '#1769FF' },
  { name: 'Success Green', hex: '#12A05C' },
  { name: 'Physics Purple', hex: '#7950F2' },
  { name: 'Vibrant Orange', hex: '#FF922B' },
  { name: 'Bright Yellow', hex: '#FFD43B' }
];

const ICON_OPTIONS = [
  { id: 'sigma', label: 'Sigma (Σ)' },
  { id: 'flask', label: 'Flask (Chemistry)' },
  { id: 'atom', label: 'Atom (Physics)' },
  { id: 'calculator', label: 'Calculator (Math)' },
  { id: 'book', label: 'Book (General)' }
];

export const DeckEditorModal: React.FC<DeckEditorModalProps> = ({
  isOpen,
  deckToEdit,
  onClose,
  onSave,
  onDelete
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#1769FF');
  const [icon, setIcon] = useState('sigma');
  const [tagsInput, setTagsInput] = useState('');
  const [iconError, setIconError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (deckToEdit) {
      setTitle(deckToEdit.title);
      setDescription(deckToEdit.description);
      setColor(deckToEdit.color);
      setIcon(deckToEdit.icon);
      setTagsInput(deckToEdit.tags.join(', '));
      setIconError('');
    } else {
      setTitle('');
      setDescription('');
      setColor('#1769FF');
      setIcon('sigma');
      setTagsInput('');
      setIconError('');
    }
  }, [deckToEdit, isOpen]);

  if (!isOpen) return null;

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setIconError(t('Please choose an image file.'));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setIconError(t('Image must be smaller than 2 MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setIcon(reader.result);
        setIconError('');
      }
    };
    reader.onerror = () => setIconError(t('Could not read this image.'));
    reader.readAsDataURL(file);
  };

  const hasCustomIcon = icon.startsWith('data:image/');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave(
        {
          title: title.trim(),
          description: description.trim(),
          color,
          icon,
          tags
        },
        deckToEdit?.id
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="brutal-card bg-white w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div
          className="px-5 py-4 border-b-2 border-[#111111] flex items-center justify-between text-white"
          style={{ backgroundColor: color }}
        >
          <h3 className="text-lg font-black tracking-tight text-white drop-shadow-[1px_1px_0px_#000]">
            {deckToEdit ? t('Edit Deck') : t('Create New Deck')}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white border border-[#111111] rounded flex items-center justify-center text-black shadow-[2px_2px_0px_#111111] hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
              {t('Deck Title *')}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Calculus: Derivatives & Integrals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="brutal-input"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
              {t('Description (English or Thai)')}
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of lessons, theorems, or formulas in this deck..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="brutal-input resize-none"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
              {t('Deck Accent Color')}
            </label>
            <div className="flex items-center gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`w-9 h-9 rounded-md border-2 border-[#111111] transition-transform ${
                    color === c.hex
                      ? 'scale-110 shadow-[3px_3px_0px_#111111] ring-2 ring-black'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
              {t('Icon Symbol')}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setIcon(opt.id)}
                  className={`py-2 px-1 text-xs font-bold border-2 border-[#111111] rounded text-center transition-all ${
                    icon === opt.id
                      ? 'bg-[#1769FF] text-white shadow-[2px_2px_0px_#111111]'
                      : 'bg-[#F8F7F2] text-zinc-800 hover:bg-white'
                  }`}
                >
                  {opt.label.split(' ')[0]}
                </button>
              ))}
            </div>

            <input
              ref={iconInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              onChange={handleIconUpload}
              className="hidden"
            />

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => iconInputRef.current?.click()}
                className="brutal-btn bg-white !py-1.5 !px-3 !text-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                {t('Upload Custom Icon')}
              </button>

              {hasCustomIcon && (
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
                  <img
                    src={icon}
                    alt={t('Custom deck icon preview')}
                    className="w-8 h-8 rounded border-2 border-[#111111] object-cover"
                  />
                  <span>{t('Custom icon selected')}</span>
                </div>
              )}
            </div>

            {iconError && (
              <p className="mt-1.5 text-xs font-bold text-red-700 flex items-center gap-1">
                <ImagePlus className="w-3.5 h-3.5" />
                {iconError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
              {t('Tags (comma-separated)')}
            </label>
            <input
              type="text"
              placeholder="STEM, Math, Exam, Calculus"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="brutal-input text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t-2 border-[#111111] flex items-center justify-between gap-3">
            {deckToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="brutal-btn !bg-red-50 !text-red-700 !border-red-700 !shadow-[2px_2px_0px_#b91c1c] !py-2 !px-3 !text-xs"
              >
                <Trash2 className="w-4 h-4" />
                {t('Delete')}
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
                disabled={isSubmitting}
                className="brutal-btn brutal-btn-primary !py-2 !px-5 !text-xs"
              >
                {deckToEdit ? t('Save Changes') : t('Create Deck')}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* In-app delete confirmation (replaces native confirm) */}
      {isDeleteConfirmOpen && deckToEdit && (
        <ConfirmDialog
          title={t('Delete deck?')}
          message={t('Are you sure you want to delete deck "{title}" and all its flashcards?', {
            title: deckToEdit.title
          })}
          confirmLabel={t('Delete Deck')}
          onConfirm={() => {
            setIsDeleteConfirmOpen(false);
            onDelete?.(deckToEdit.id);
            onClose();
          }}
          onCancel={() => setIsDeleteConfirmOpen(false)}
        />
      )}
    </div>
  );
};
