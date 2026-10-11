import React, { useState } from 'react';
import {
  Palette,
  Sliders,
  Database,
  RefreshCw,
  Trash2,
  Download,
  Cloud,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AppSettings, Deck, Flashcard } from '../types';
import { createExportPayload, downloadJsonFile, serializeExport } from '../services/importExport';
import { useTranslation } from '../i18n';

interface SettingsPageProps {
  settings: AppSettings;
  decks: Deck[];
  cards: Flashcard[];
  onUpdateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  onResetSampleData: () => Promise<void>;
  onClearAllData: () => Promise<void>;
  onShowOnboarding: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  decks,
  cards,
  onUpdateSettings,
  onResetSampleData,
  onClearAllData,
  onShowOnboarding
}) => {
  const { t } = useTranslation();
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [syncEndpoint, setSyncEndpoint] = useState(settings.syncServerUrl || '');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSaveSettings = async (updates: Partial<AppSettings>) => {
    await onUpdateSettings(updates);
    setSaveStatus('Settings updated successfully.');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleExportBackup = () => {
    const payload = createExportPayload(decks, cards);
    const serialized = serializeExport(payload);
    downloadJsonFile(`studydeck-full-backup-${new Date().toISOString().slice(0, 10)}.json`, serialized);
  };

  const handleConfirmClear = async () => {
    if (deleteConfirmation !== 'DELETE') return;
    await onClearAllData();
    setShowDeleteModal(false);
    setDeleteConfirmation('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div className="brutal-card p-6 bg-white">
        <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
          {t('Application Settings')}
        </h1>
        <p className="text-sm font-semibold text-zinc-600 mt-1">
          {t('Customize themes, study session preferences, and manage offline data storage.')}
        </p>
      </div>

      {saveStatus && (
        <div className="brutal-card p-3.5 bg-[#EBFBEE] border-2 border-black flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-[#12A05C]" />
          <span className="text-xs font-bold text-[#0B7A43]">{t(saveStatus)}</span>
        </div>
      )}

      {/* 1. Theme & Appearance */}
      <div className="brutal-card bg-white p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-black">
          <Palette className="w-5 h-5 text-[#1769FF]" />
          <h2 className="text-base font-black text-[#111111]">{t('Design Theme')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'brutalist-light', name: 'Brutalist Light', desc: 'Standard off-white background with electric blue accents' },
            { id: 'brutalist-high-contrast', name: 'High Contrast', desc: 'Pure white background with thick 3px black borders' },
            { id: 'brutalist-dark', name: 'Brutalist Dark', desc: 'Dark gray surface with vivid neon contrast' }
          ].map((th) => (
            <button
              key={th.id}
              onClick={() => handleSaveSettings({ theme: th.id as any })}
              className={`p-3.5 border-2 border-black rounded text-left transition-all ${
                settings.theme === th.id
                  ? 'bg-[#1769FF] text-white shadow-[3px_3px_0px_#111]'
                  : 'bg-[#F8F7F2] text-zinc-900 hover:bg-white'
              }`}
            >
              <span className="font-black text-sm block">{t(th.name)}</span>
              <span className={`text-[11px] font-medium block mt-1 ${settings.theme === th.id ? 'text-blue-100' : 'text-zinc-500'}`}>
                {t(th.desc)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Language & Study Preferences */}
      <div className="brutal-card bg-white p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-black">
          <Sliders className="w-5 h-5 text-[#FF922B]" />
          <h2 className="text-base font-black text-[#111111]">{t('Study Preferences')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
              {t('Language')}
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSaveSettings({ language: e.target.value as any })}
              className="brutal-input text-xs font-bold"
            >
              <option value="en">English (US / UK)</option>
              <option value="th">ไทย (Thai)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
              {t('Sound Effects (Web Audio API)')}
            </label>
            <button
              onClick={() => handleSaveSettings({ soundEnabled: !settings.soundEnabled })}
              className={`w-full brutal-btn !text-xs !justify-start ${
                settings.soundEnabled ? 'brutal-btn-success' : 'bg-zinc-200 text-zinc-700'
              }`}
            >
              {settings.soundEnabled ? `✓ ${t('Enabled (Audio Clicks Active)')}` : `✕ ${t('Disabled (Muted)')}`}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Optional Synchronization Architecture */}
      <div className="brutal-card bg-white p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-black">
          <Cloud className="w-5 h-5 text-[#7950F2]" />
          <h2 className="text-base font-black text-[#111111]">{t('Synchronization Architecture')}</h2>
        </div>

        <div className="p-3 bg-[#F8F7F2] border-2 border-black rounded text-xs text-zinc-700 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-bold text-zinc-900">
            <span className="w-2.5 h-2.5 rounded-full bg-[#12A05C]"></span>
            <span>{t('Current Status: Local-First Standalone Mode')}</span>
          </div>
          <p>
            {t('StudyDeck operates 100% locally via IndexedDB without requiring external server accounts. Future synchronization can be configured below. Local data is never deleted or overwritten during failed sync attempts.')}
          </p>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
            {t('Optional Remote Sync Server Endpoint')}
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://api.your-school-sync.edu/v1"
              value={syncEndpoint}
              onChange={(e) => setSyncEndpoint(e.target.value)}
              className="brutal-input text-xs"
            />
            <button
              onClick={() => handleSaveSettings({ syncServerUrl: syncEndpoint })}
              className="brutal-btn brutal-btn-primary !text-xs shrink-0"
            >
              {t('Save URL')}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Data Management & Reset */}
      <div className="brutal-card bg-white p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-black">
          <Database className="w-5 h-5 text-[#111111]" />
          <h2 className="text-base font-black text-[#111111]">{t('Data Storage & Maintenance')}</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportBackup}
            className="brutal-btn bg-white !text-xs"
          >
            <Download className="w-4 h-4" />
            {t('Download Full Backup JSON')}
          </button>

          <button
            onClick={async () => {
              if (confirm(t('Re-seed default Calculus, Chemistry, and Physics sample decks?'))) {
                await onResetSampleData();
              }
            }}
            className="brutal-btn bg-white !text-xs"
          >
            <RefreshCw className="w-4 h-4" />
            {t('Reload Starter STEM Decks')}
          </button>

          <button
            onClick={onShowOnboarding}
            className="brutal-btn bg-white !text-xs"
          >
            {t('Revisit Welcome Onboarding')}
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="brutal-btn !bg-red-50 !text-red-700 !border-red-700 !shadow-[2px_2px_0px_#b91c1c] !text-xs"
          >
            <Trash2 className="w-4 h-4" />
            {t('Wipe All Local Data')}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="brutal-card bg-white w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-black text-black">{t('Confirm Database Wipe')}</h3>
            </div>
            <p className="text-xs text-zinc-700 font-medium leading-relaxed">
              {t('This action will permanently delete all your decks, flashcards, and SM-2 review histories stored in IndexedDB on this device.')}
            </p>
            <div>
              <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
                {t('Type DELETE to confirm:')}
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="brutal-input text-xs font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t-2 border-black">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="brutal-btn bg-white !text-xs"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={handleConfirmClear}
                disabled={deleteConfirmation !== 'DELETE'}
                className="brutal-btn !bg-red-600 !text-white !text-xs"
              >
                {t('Permanently Wipe')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
