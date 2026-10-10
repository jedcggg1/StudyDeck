import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileCheck,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  CheckCircle2,
  Code
} from 'lucide-react';
import { Deck, Flashcard } from '../types';
import {
  createExportPayload,
  downloadJsonFile,
  serializeExport,
  validateImportJson,
  resolveImportConflicts,
  ConflictStrategy,
  ImportValidationResult
} from '../services/importExport';
import { useTranslation } from '../i18n';

interface ImportExportPageProps {
  decks: Deck[];
  cards: Flashcard[];
  onImportSuccess: (decks: Deck[], cards: Flashcard[]) => Promise<void>;
}

export const ImportExportPage: React.FC<ImportExportPageProps> = ({
  decks,
  cards,
  onImportSuccess
}) => {
  const { t } = useTranslation();
  const [selectedDeckToExport, setSelectedDeckToExport] = useState<string>('all');
  const [importValidation, setImportValidation] = useState<ImportValidationResult | null>(null);
  const [conflictStrategy, setConflictStrategy] = useState<ConflictStrategy>('skip');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export handler
  const handleExport = () => {
    let decksToExport = decks;
    let cardsToExport = cards;

    if (selectedDeckToExport !== 'all') {
      decksToExport = decks.filter((d) => d.id === selectedDeckToExport);
      cardsToExport = cards.filter((c) => c.deckId === selectedDeckToExport);
    }

    const payload = createExportPayload(decksToExport, cardsToExport);
    const serialized = serializeExport(payload);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename =
      selectedDeckToExport === 'all'
        ? `studydeck-backup-all-${dateStr}.json`
        : `studydeck-${decksToExport[0]?.title.toLowerCase().replace(/\s+/g, '-')}-${dateStr}.json`;

    downloadJsonFile(filename, serialized);
  };

  // File Picker / Upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatusMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = validateImportJson(content);
      setImportValidation(result);
    };
    reader.readAsText(file);
  };

  // Execute import
  const handleConfirmImport = async () => {
    if (!importValidation || !importValidation.valid || !importValidation.parsedData) return;

    setIsImporting(true);
    try {
      const { decksToSave, cardsToSave } = resolveImportConflicts(
        importValidation.parsedData,
        decks,
        cards,
        conflictStrategy
      );

      await onImportSuccess(decksToSave, cardsToSave);

      setImportStatusMessage(
        `Successfully imported ${decksToSave.length} decks and ${cardsToSave.length} flashcards!`
      );
      setImportValidation(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      alert(`Import error: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Example JSON schema snippet
  const sampleSchemaJson = `{
  "schemaVersion": "studydeck_v1",
  "exportedAt": "2026-05-01T12:00:00.000Z",
  "source": "StudyDeck Web App",
  "decks": [
    {
      "id": "deck-sample-math",
      "title": "Calculus: Integrals",
      "description": "Essential calculus formulas",
      "icon": "sigma",
      "color": "#1769FF",
      "tags": ["Math", "Calculus"]
    }
  ],
  "cards": [
    {
      "id": "card-sample-1",
      "deckId": "deck-sample-math",
      "front": "### Power Rule\\n$$\\\\int x^n \\\\, dx$$",
      "back": "$$\\\\frac{x^{n+1}}{n+1} + C$$",
      "tags": ["Integration"],
      "repetition": 1,
      "interval": 1,
      "easeFactor": 2.5,
      "nextReviewDate": 1777636800000
    }
  ]
}`;

  const handleDownloadSample = () => {
    downloadJsonFile('studydeck-sample-template.json', sampleSchemaJson);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(sampleSchemaJson);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="brutal-card p-6 bg-white">
        <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
          {t('JSON Import & Export')}
        </h1>
        <p className="text-sm font-semibold text-zinc-600 mt-1">
          {t('Backup your decks, share with classmates, or restore study records with versioned JSON validation.')}
        </p>
      </div>

      {importStatusMessage && (
        <div className="brutal-card p-4 bg-[#EBFBEE] border-2 border-black flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#12A05C]" />
          <span className="text-sm font-bold text-[#0B7A43]">{importStatusMessage}</span>
        </div>
      )}

      {/* Grid: Export Section & Import Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EXPORT SECTION */}
        <div className="brutal-card bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-black">
              <Download className="w-5 h-5 text-[#1769FF]" />
              <h2 className="text-lg font-black text-[#111111]">{t('Export Decks as JSON')}</h2>
            </div>

            <p className="text-xs text-zinc-600 font-medium mb-4 leading-relaxed">
              {t('Export your flashcards into a portable, standard JSON file preserving all LaTeX math formulas, tags, and SM-2 review progress.')}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                  {t('Choose Deck to Export:')}
                </label>
                <select
                  value={selectedDeckToExport}
                  onChange={(e) => setSelectedDeckToExport(e.target.value)}
                  className="brutal-input text-xs font-bold bg-[#F8F7F2]"
                >
                  <option value="all">📦 {t('All Decks')} ({decks.length} {t('decks')}, {cards.length} {t('cards')})</option>
                  {decks.map((d) => {
                    const deckCardCount = cards.filter((c) => c.deckId === d.id).length;
                    return (
                      <option key={d.id} value={d.id}>
                        {d.title} ({deckCardCount} {t('cards')})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="p-3 bg-[#F8F7F2] border-2 border-black rounded text-xs space-y-1">
                <div className="flex justify-between font-bold text-zinc-700">
                  <span>{t('Selected Decks:')}</span>
                  <span>{selectedDeckToExport === 'all' ? decks.length : 1}</span>
                </div>
                <div className="flex justify-between font-bold text-zinc-700">
                  <span>{t('Total Cards in Export:')}</span>
                  <span>
                    {selectedDeckToExport === 'all'
                      ? cards.length
                      : cards.filter((c) => c.deckId === selectedDeckToExport).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-black flex items-center justify-between">
            <button
              onClick={handleExport}
              disabled={decks.length === 0}
              className="brutal-btn brutal-btn-primary w-full !text-xs"
            >
              <Download className="w-4 h-4" />
              {t('Download JSON Export')}
            </button>
          </div>
        </div>

        {/* IMPORT SECTION */}
        <div className="brutal-card bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-black">
              <Upload className="w-5 h-5 text-[#12A05C]" />
              <h2 className="text-lg font-black text-[#111111]">{t('Import JSON File')}</h2>
            </div>

            <p className="text-xs text-zinc-600 font-medium mb-4 leading-relaxed">
              {t('Upload a valid StudyDeck JSON file. The file is validated before any changes are written to IndexedDB.')}
            </p>

            {/* Hidden File Input & Stylized Drop Zone */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload-input"
            />

            <label
              htmlFor="file-upload-input"
              className="border-2 border-dashed border-black rounded-lg p-6 bg-[#F8F7F2] flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-colors"
            >
              <FileText className="w-8 h-8 text-[#1769FF] mb-2" />
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900">
                {t('Click to browse JSON file')}
              </span>
              <span className="text-[11px] text-zinc-500 font-semibold mt-1">
                Supports schemaVersion "studydeck_v1"
              </span>
            </label>
          </div>

          {/* Validation Status / Preview */}
          {importValidation && (
            <div className="mt-4 p-4 border-2 border-black rounded bg-white shadow-[2px_2px_0px_#111] space-y-3">
              {importValidation.valid ? (
                <>
                  <div className="flex items-center gap-2 text-[#12A05C] font-black text-xs uppercase">
                    <FileCheck className="w-4 h-4" />
                    {t('Valid StudyDeck Schema Detected')}
                  </div>

                  <div className="text-xs font-bold text-zinc-700 space-y-1">
                    <p>{t('Decks to import:')} {importValidation.decksCount}</p>
                    <p>{t('Cards to import:')} {importValidation.cardsCount}</p>
                  </div>

                  {/* Conflict handling options */}
                  <div className="pt-2 border-t border-zinc-200">
                    <label className="block text-[11px] font-black uppercase text-zinc-600 mb-1">
                      {t('If deck/card IDs already exist:')}
                    </label>
                    <div className="space-y-1 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="radio"
                          name="conflict"
                          checked={conflictStrategy === 'skip'}
                          onChange={() => setConflictStrategy('skip')}
                        />
                        <span>Skip existing items (safest)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="radio"
                          name="conflict"
                          checked={conflictStrategy === 'duplicate'}
                          onChange={() => setConflictStrategy('duplicate')}
                        />
                        <span>Import as copies (generate new IDs)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="radio"
                          name="conflict"
                          checked={conflictStrategy === 'overwrite'}
                          onChange={() => setConflictStrategy('overwrite')}
                        />
                        <span>Overwrite existing matching items</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmImport}
                    disabled={isImporting}
                    className="brutal-btn brutal-btn-success w-full !text-xs mt-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t('Confirm & Save to Local Database')}
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600 font-black text-xs uppercase">
                    <AlertTriangle className="w-4 h-4" />
                    {t('JSON Validation Errors')}
                  </div>
                  <ul className="text-xs font-bold text-red-700 list-disc list-inside space-y-0.5">
                    {importValidation.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Schema Documentation & Sample Template */}
      <div className="brutal-card bg-white p-5 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-[#7950F2]" />
            <h3 className="font-black text-base text-[#111111]">
              {t('JSON Schema Specification (studydeck_v1)')}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySchema}
              className="brutal-btn bg-white !py-1 !px-2.5 !text-xs"
            >
              {copiedSchema ? <Check className="w-3.5 h-3.5 text-[#12A05C]" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSchema ? t('Copied') : t('Copy')}
            </button>
            <button
              onClick={handleDownloadSample}
              className="brutal-btn brutal-btn-primary !py-1 !px-2.5 !text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              {t('Download Template')}
            </button>
          </div>
        </div>

        <pre className="p-3 bg-zinc-900 text-green-400 font-mono text-xs border-2 border-black rounded shadow-[2px_2px_0px_#111] overflow-x-auto max-h-56">
          <code>{sampleSchemaJson}</code>
        </pre>
      </div>
    </div>
  );
};
