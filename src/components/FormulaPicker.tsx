import React from 'react';
import { FormulaTemplate } from '../types';
import { MathMarkdown } from './MathMarkdown';
import { useTranslation } from '../i18n';

interface FormulaPickerProps {
  templates: FormulaTemplate[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  onInsert: (code: string) => void;
  /** Only custom templates can be removed */
  onDeleteTemplate: (id: string) => void;
  onAddFormula: (tmpl: FormulaTemplate) => void;
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

export const FormulaPicker: React.FC<FormulaPickerProps> = ({
  templates,
  activeCategory,
  onCategoryChange,
  onInsert,
  onDeleteTemplate,
  onAddFormula,
  onOpenAddForm,
  isAddFormOpen,
  target,
}) => {
  const { t } = useTranslation();
  const categories = React.useMemo(() => {
    const seen = new Set<string>();
    const cats: string[] = [];
    for (const tmpl of templates) {
      if (!seen.has(tmpl.category)) {
        seen.add(tmpl.category);
        cats.push(tmpl.category);
      }
    }
    return cats;
  }, [templates]);

  const visible = templates.filter((tmpl) => tmpl.category === activeCategory);

  return (
    <div className="p-2.5 bg-[#F8F7F2] border-2 border-[#111111] rounded shadow-[2px_2px_0px_#111111]">
      {/* Category tabs */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <span className="text-[11px] font-black uppercase text-zinc-600 mr-0.5">
          {t('Quick Inserts:')}
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={`px-2 py-0.5 rounded text-[11px] font-black border transition-colors ${
              cat === activeCategory
                ? 'bg-[#1769FF] text-white border-[#111111] shadow-[1.5px_1.5px_0px_#111111]'
                : 'bg-white text-zinc-800 border-[#111111] shadow-[1px_1px_0px_#111111] hover:bg-zinc-100'
            }`}
          >
            {CATEGORY_ICON[cat] ? `${CATEGORY_ICON[cat]} ` : ''}{cat}
          </button>
        ))}
        <button
          type="button"
          onClick={onOpenAddForm}
          aria-expanded={isAddFormOpen}
          className={`px-2 py-0.5 rounded text-[11px] font-black border transition-colors ml-auto ${
            isAddFormOpen
              ? 'bg-[#12A05C] text-white border-[#111111] shadow-[1.5px_1.5px_0px_#111111]'
              : 'bg-white text-zinc-800 border-[#111111] shadow-[1px_1px_0px_#111111] hover:bg-zinc-100'
          }`}
        >
          {isAddFormOpen ? `− ${t('Close')}` : `+ ${t('Add Formula')}`}
        </button>
      </div>

      {/* Add-form */}
      {isAddFormOpen && (
        <AddFormulaForm
          onSaved={(tmpl) => {
            onAddFormula(tmpl);
            onCategoryChange(tmpl.category);
          }}
          onCancel={onOpenAddForm}
        />
      )}

      {/* Token chips with hover preview (auto-rendered) */}
      {!isAddFormOpen && (
        <div className="flex flex-wrap gap-1.5">
          {visible.length === 0 && (
            <span className="text-[11px] font-semibold text-zinc-500">
              {t('No formulas in this category yet.')}
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
                className={`px-2 py-1 bg-white border rounded text-[11px] font-bold text-zinc-800 hover:bg-zinc-100 ${
                  tmpl.isCustom ? 'border-[#12A05C]' : 'border-[#111111]'
                } shadow-[1px_1px_0px_#111111]${tmpl.isCustom ? ' shadow-[1px_1px_0px_#12A05C]' : ''}`}
              >
                +{tmpl.name}
              </button>
              {tmpl.isCustom && (
                <button
                  type="button"
                  title={t('Delete this custom formula')}
                  onClick={() => {
                    if (confirm(t('Delete this custom formula?'))) onDeleteTemplate(tmpl.id);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#FA5252] text-white text-[9px] font-black rounded-full border border-[#111111] items-center justify-center hidden group-hover:flex"
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
    </div>
  );
};

/** Inline add-form for user-defined formulas */
const AddFormulaForm: React.FC<{
  onSaved: (tmpl: FormulaTemplate) => void;
  onCancel: () => void;
}> = ({ onSaved, onCancel }) => {
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
