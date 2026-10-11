import React from 'react';
import { BarChart2, Layers, BookOpen, CheckCircle, Flame } from 'lucide-react';
import { useTranslation } from '../i18n';

interface BentoStatsProps {
  totalDecks: number;
  totalCards: number;
  studiedToday: number;
  streakDays: number;
}

export const BentoStats: React.FC<BentoStatsProps> = ({
  totalDecks,
  totalCards,
  studiedToday,
  streakDays
}) => {
  const { t } = useTranslation();

  return (
    <div className="brutal-card overflow-hidden h-full flex flex-col">
      {/* Blue Header Bar */}
      <div className="bg-[#1769FF] text-white px-4 py-2.5 border-b-[2.5px] border-[#111111] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-white" />
          <h2 className="text-base font-black tracking-tight">{t('Study Stats')}</h2>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider bg-white text-[#1769FF] px-2 py-0.5 rounded border border-[#111111]">
          Live
        </span>
      </div>

      {/* 2x2 Bento Grid Matrix */}
      <div className="grid grid-cols-2 divide-x-[2.5px] divide-y-[2.5px] divide-[#111111] flex-1 bg-white">
        {/* Quadrant 1: Total Decks */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#555555]">
            <Layers className="w-4 h-4 text-[#111111]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t('Total Decks')}</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-[#111111]">{totalDecks}</span>
          </div>
        </div>

        {/* Quadrant 2: Total Cards */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#555555]">
            <BookOpen className="w-4 h-4 text-[#111111]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t('Total Cards')}</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-[#111111]">{totalCards}</span>
          </div>
        </div>

        {/* Quadrant 3: Studied Today */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#555555]">
            <CheckCircle className="w-4 h-4 text-[#12A05C]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t('Cards Studied')}</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-[#12A05C]">{studiedToday}</span>
            <span className="text-xs font-bold text-[var(--text-muted)]">{t('today')}</span>
          </div>
        </div>

        {/* Quadrant 4: Study Streak */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#555555]">
            <Flame className="w-4 h-4 text-[#FF922B]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t('Streak')}</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-[#FF922B]">{streakDays}</span>
            <span className="text-xs font-bold text-[var(--text-muted)]">{t('days')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
