import React from 'react';
import { FormulaTemplate } from '../types';
import { MathMarkdown } from './MathMarkdown';
import { ConfirmDialog } from './ConfirmDialog';
import { useTranslation } from '../i18n';

interface FormulaPickerProps {
  templates: FormulaTemplate[];
  /** Categories the user added themselves (may be empty, no formulas yet) */
  customCategories: string[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  onInsert: (code: string) => void;
  /** Only custom templates can be removed */
  onDeleteTemplate: (id: string) => void;
  onAddFormula: (tmpl: FormulaTemplate) => void;
  /** Create a new empty category */
  onAddCategory: (name: string) => void;
  /** Delete a user-created category and all formulas inside it */
  onDeleteCategory: (name: string) => void;
  onOpenAddForm: () => void;
  isAddFormOpen: boolean;
  /** Insertion target shown to the user */
  target: 'front' | 'back';
}

const CATEGORY_ICON: Record<string, string> = {
  Math: '∑',
  Physics: '⚛',
  Chemistry: '⚗',
  Markdown: 'M↓',
};

/** Built-in categories cannot be renamed/deleted by users */
const BUILTIN_CATEGORIES = Object.keys(CATEGORY_ICON);

export const FormulaPicker: React.FC<FormulaPickerProps> = ({
  templates,
  customCategories,
  activeCategory,
  onCategoryChange,
  onInsert,
  onDeleteTemplate,
  onAddFormula,
  onAddCategory,
  onDeleteCategory,
  onOpenAddForm,
  isAddFormOpen,
  target,
}) => {
  const { t } = useTranslation();
  const [isAddCatOpen, setIsAddCatOpen] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState('');
  /** Pending destructive action shown in the ConfirmDialog */
  const [pendingDelete, setPendingDelete] = React.useState<
    | { kind: 'category'; name: string }
    | { kind: 'formula'; id: string; name: string }
    | null
  >(null);

  const categories = React.useMemo(() => {
    const seen = new Set<string>();
    const cats: string[] = [];
    for (const tmpl of templates) {
      if (!seen.has(tmpl.category)) {
        seen.add(tmpl.category);
        cats.push(tmpl.category);
      }
    }
    // User-created empty categories (no formulas yet) that aren't already shown
    for (const cat of customCategories) {
      if (!seen.has(cat)) {
        seen.add(cat);
        cats.push(cat);
      }
    }
    return cats;
  }, [templates, customCategories]);

  const visible = templates.filter((tmpl) => tmpl.category === activeCategory);

  const saveNewCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    onAddCategory(name);
    onCategoryChange(name);
    setNewCatName('');
    setIsAddCatOpen(false);
  };

  return (
    <div className="p-2.5 bg-[#F8F7F2] border-2 border-[#111111] rounded shadow-[2px_2px_0px_#111111]">
      {/* Category tabs */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <span className="text-[11px] font-black uppercase text-zinc-600 mr-0.5">
          {t('Quick Inserts:')}
        </span>
        {categories.map((cat) => {
          // Every non-builtin category belongs to the user (added via "+ Add Category"
          // or by typing a new category name in the add-formula form) → deletable
          const isCustomCategory = !BUILTIN_CATEGORIES.includes(cat);
          // Show ✕ on hover OR while this tab is selected/clicked (touch-friendly)
          const showDeleteX = isCustomCategory && cat === activeCategory;
          return (
            <div key={cat} className="relative group/cat">
              <button
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`px-2 py-0.5 rounded text-[11px] font-black border transition-colors ${
                  cat === activeCategory
                    ? 'bg-[#1769FF] text-white border-[#111111] shadow-[1.5px_1.5px_0px_#111111]'
                    : 'bg-white text-zinc-800 border-[#111111] shadow-[1px_1px_0px_#111111] hover:bg-zinc-100 hover:-translate-y-0.5 hover:shadow-[2.5px_2.5px_0px_#111111] transition-all'
                }`}
              >
                {CATEGORY_ICON[cat] ? `${CATEGORY_ICON[cat]} ` : ''}{cat}
              </button>
              {/* User-created custom categories can be deleted (hover ✕) */}
              {isCustomCategory && (
                <button
                  type="button"
                  title={t('Delete this category and its formulas')}
                  onClick={() => setPendingDelete({ kind: 'category', name: cat })}
                  className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#FA5252] text-white text-[9px] font-black rounded-full border border-[#111111] items-center justify-center ${
                    showDeleteX ? 'flex' : 'hidden group-hover/cat:flex'
                  }`}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}

        {/* Add category inline form / toggle */}
        {isAddCatOpen ? (
          <span className="inline-flex items-center gap-1">
            <input
              autoFocus
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveNewCategory();
                if (e.key === 'Escape') {
                  setIsAddCatOpen(false);
                  setNewCatName('');
                }
              }}
              placeholder={t('Category name *')}
              className="!w-32 brutal-input !py-0.5 !text-[11px] font-bold"
            />
            <button
              type="button"
              disabled={!newCatName.trim()}
              onClick={saveNewCategory}
              className="brutal-btn brutal-btn-success !py-0.5 !px-1.5 !text-[10px]"
            >
              {t('Save')}
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddCatOpen(true)}
            className="px-2 py-0.5 rounded text-[11px] font-black border border-[#111111] bg-white text-zinc-800 shadow-[1px_1px_0px_#111111] hover:bg-zinc-100 hover:-translate-y-0.5 hover:shadow-[2.5px_2.5px_0px_#111111] transition-all"
          >
            + {t('Add Category')}
          </button>
        )}

        <button
          type="button"
          onClick={onOpenAddForm}
          aria-expanded={isAddFormOpen}
          className={`px-2 py-0.5 rounded text-[11px] font-black border transition-colors ml-auto ${
            isAddFormOpen
              ? 'bg-[#12A05C] text-white border-[#111111] shadow-[1.5px_1.5px_0px_#111111]'
              : 'bg-white text-zinc-800 border-[#111111] shadow-[1px_1px_0px_#111111] hover:bg-zinc-100 hover:-translate-y-0.5 hover:shadow-[2.5px_2.5px_0px_#111111] transition-all'
          }`}
        >
          {isAddFormOpen ? `− ${t('Close')}` : `+ ${t('Add Formula')}`}
        </button>
      </div>

      {/* Add-form */}
      {isAddFormOpen && (
        <AddFormulaForm
          existingCategories={categories}
          onSaved={(tmpl) => {
            onAddFormula(tmpl);
            onCategoryChange(tmpl.category);
          }}
          onCancel={onOpenAddForm}
        />
      )}

      {/* Token chips with hover preview (auto-rendered) — divider line separates categories row from formulas */}
      {!isAddFormOpen && (
        <div className="flex flex-wrap gap-1.5 border-t-2 border-[#111111] pt-2 mt-1">
          {visible.length === 0 && (
            <span className="text-[11px] font-semibold text-zinc-500">
              {t('No formulas in this category yet.')} {t('Use "+ Add Formula" to add one.')}
            </span>
          )}
          {visible.map((tmpl) => (
            <div key={tmpl.id} className="relative group">
              <button
                type="button"
                title={`${tmpl.name} — ${t('click to insert to')} ${
                  target === 'front' ? t('Front') : t('Back (Solution)')
                }`}
                onClick={() => onInsert(tmpl.code)}
                className={`px-2 py-1 bg-white border rounded text-[11px] font-bold text-zinc-800 hover:bg-zinc-100 hover:-translate-y-0.5 hover:shadow-[2.5px_2.5px_0px_#111111] transition-all ${
                  tmpl.isCustom ? 'border-[#12A05C]' : 'border-[#111111]'
                } shadow-[1px_1px_0px_#111111]${tmpl.isCustom ? ' shadow-[1px_1px_0px_#12A05C]' : ''}`}
              >
                +{tmpl.name}
              </button>
              {/* Custom formulas can be deleted (hover/focus ✕) */}
              {tmpl.isCustom && (
                <button
                  type="button"
                  title={t('Delete this custom formula')}
                  onClick={() => setPendingDelete({ kind: 'formula', id: tmpl.id, name: tmpl.name })}
                  className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#FA5252] text-white text-[9px] font-black rounded-full border border-[#111111] items-center justify-center hidden group-hover:flex group-focus-within:flex"
                >
                  ✕
                </button>
              )}
              {/* Auto preview on hover */}
              <div className="absolute z-30 left-0 top-full mt-1 hidden group-hover:block bg-white border-2 border-[#111111] rounded shadow-[3px_3px_0px_#111111] p-2 w-max max-w-[280px] pointer-events-none">
                <MathMarkdown content={tmpl.code} className="text-xs" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* In-app delete confirmation (replaces native confirm) */}
      {pendingDelete?.kind === 'category' && (
        <ConfirmDialog
          title={t('Delete category?')}
          message={t('"{name}" and ALL formulas inside it will be permanently deleted.', { name: pendingDelete.name })}
          confirmLabel={t('Delete Category')}
          onConfirm={() => {
            onDeleteCategory(pendingDelete.name);
            setPendingDelete(null);
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
      {pendingDelete?.kind === 'formula' && (
        <ConfirmDialog
          title={t('Delete formula?')}
          message={t('"{name}" will be permanently removed from your custom formulas.', { name: pendingDelete.name })}
          confirmLabel={t('Delete Formula')}
          onConfirm={() => {
            onDeleteTemplate(pendingDelete.id);
            setPendingDelete(null);
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
};

/** Inline add-form for user-defined formulas */
const AddFormulaForm: React.FC<{
  existingCategories: string[];
  onSaved: (tmpl: FormulaTemplate) => void;
  onCancel: () => void;
}> = ({ existingCategories, onSaved, onCancel }) => {
  const { t } = useTranslation();
  const [name, setName] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [code, setCode] = React.useState('');

  const canSave = name.trim() && category.trim() && code.trim();
  const suggested = ['Math', 'Physics', 'Chemistry', 'Markdown'];

  return (
    <div className="p-2 bg-white border-2 border-[#12A05C] rounded space-y-1.5 mb-1.5">
      <div className="flex gap-1.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('Formula name *')}
          className="brutal-input !py-1 !text-xs font-bold flex-1"
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          list="formula-category-suggestions"
          placeholder={t('Category *')}
          className="brutal-input !py-1 !text-xs font-bold flex-1"
        />
        <datalist id="formula-category-suggestions">
          {suggested.map((s) => (
            <option key={s} value={s} />
          ))}
          {existingCategories.map((s) => (
            <option key={`ex-${s}`} value={s} />
          ))}
        </datalist>
      </div>
      <textarea
        rows={2}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={t('LaTeX / Markdown, e.g. $$x^2+1$$')}
        className="brutal-input font-mono !py-1 !text-xs"
      />
      {code.trim() && (
        <div className="border border-[#111111] rounded p-1.5 bg-[#F8F7F2]">
          <span className="text-[9px] font-black uppercase text-zinc-500 block mb-0.5">
            {t('Preview')}
          </span>
          <MathMarkdown content={code} className="text-xs" />
        </div>
      )}
      <div className="flex justify-end gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          className="brutal-btn !py-1 !px-2.5 !text-[11px] bg-white"
        >
          {t('Cancel')}
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={() => {
            onSaved({
              id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              name: name.trim(),
              category: category.trim(),
              code: code.trim(),
              isCustom: true,
            });
          }}
          className="brutal-btn brutal-btn-success !py-1 !px-2.5 !text-[11px]"
        >
          {t('Save Formula')}
        </button>
      </div>
    </div>
  );
};
