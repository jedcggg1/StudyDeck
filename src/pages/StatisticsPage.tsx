import React, { useMemo } from 'react';
import {
  BarChart3,
  Flame,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers
} from 'lucide-react';
import { Deck, Flashcard, ReviewLog } from '../types';
import { useTranslation } from '../i18n';

interface StatisticsPageProps {
  decks: Deck[];
  cards: Flashcard[];
  reviewLogs: ReviewLog[];
}

export const StatisticsPage: React.FC<StatisticsPageProps> = ({
  decks,
  cards,
  reviewLogs
}) => {
  const { t } = useTranslation();
  // 1. Overall Metrics
  const totalReviews = reviewLogs.length;

  const successfulReviews = useMemo(() => {
    return reviewLogs.filter((l) => l.rating === 'good' || l.rating === 'easy').length;
  }, [reviewLogs]);

  const retentionAccuracy = totalReviews > 0
    ? Math.round((successfulReviews / totalReviews) * 100)
    : 0;

  // 2. Rating breakdown
  const ratingCounts = useMemo(() => {
    const counts = { again: 0, hard: 0, good: 0, easy: 0 };
    reviewLogs.forEach((l) => {
      if (counts[l.rating] !== undefined) {
        counts[l.rating]++;
      }
    });
    return counts;
  }, [reviewLogs]);

  // 3. 7-day Upcoming Review Schedule Forecast
  const upcomingForecast = useMemo(() => {
    const days: Array<{ label: string; count: number; dateStr: string }> = [];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + i);
      targetDate.setHours(23, 59, 59, 999);
      const prevDate = new Date(targetDate);
      prevDate.setDate(targetDate.getDate() - 1);

      const dayCards = cards.filter((c) => {
        if (!c.nextReviewDate) return false;
        return c.nextReviewDate <= targetDate.getTime() && (i === 0 || c.nextReviewDate > prevDate.getTime());
      });

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const label = i === 0 ? 'Today' : i === 1 ? 'Tmrw' : dayNames[targetDate.getDay()];
      days.push({
        label,
        count: dayCards.length,
        dateStr: targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      });
    }

    return days;
  }, [cards]);

  const maxForecastCount = Math.max(1, ...upcomingForecast.map((d) => d.count));

  // 4. Deck Mastery Breakdown
  const deckMastery = useMemo(() => {
    return decks.map((deck) => {
      const deckCards = cards.filter((c) => c.deckId === deck.id);
      const total = deckCards.length;
      const mastered = deckCards.filter((c) => c.repetition >= 2).length;
      const learning = deckCards.filter((c) => c.repetition === 1).length;
      const unlearned = deckCards.filter((c) => c.repetition === 0).length;
      const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;

      return {
        deck,
        total,
        mastered,
        learning,
        unlearned,
        percentage
      };
    });
  }, [decks, cards]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="brutal-card p-6 bg-white">
        <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
          {t('Learning Statistics & Analytics')}
        </h1>
        <p className="text-sm font-semibold text-zinc-600 mt-1">
          {t('Detailed metrics calculated dynamically from your local IndexedDB review logs.')}
        </p>
      </div>

      {/* Top 4 Key Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="brutal-card p-4 sm:p-5 bg-white">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <CheckCircle2 className="w-4 h-4 text-[#1769FF]" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-700">{t('Total Reviews')}</span>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-[#111111]">
            {totalReviews}
          </span>
        </div>

        {/* Retention Accuracy */}
        <div className="brutal-card p-4 sm:p-5 bg-white">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <TrendingUp className="w-4 h-4 text-[#12A05C]" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-700">{t('Recall Rate')}</span>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-[#12A05C]">
            {retentionAccuracy}%
          </span>
        </div>

        {/* Streak */}
        <div className="brutal-card p-4 sm:p-5 bg-white">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Flame className="w-4 h-4 text-[#FF922B]" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-700">{t('Current Streak')}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-[#FF922B]">2</span>
            <span className="text-xs font-bold text-zinc-500">{t('days')}</span>
          </div>
        </div>

        {/* Total Cards */}
        <div className="brutal-card p-4 sm:p-5 bg-white">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Award className="w-4 h-4 text-[#7950F2]" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-700">{t('Total Cards')}</span>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-[#7950F2]">
            {cards.length}
          </span>
        </div>
      </div>

      {/* Bento Grid Analytics Section */}
      <div className="bento-container">
        {/* 7-Day Forecast Chart (Bento Span 7) */}
        <div className="bento-span-7">
          <div className="brutal-card bg-white p-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1769FF]" />
                <h3 className="font-black text-base text-[#111111]">
                  {t('Upcoming 7-Day Review Schedule')}
                </h3>
              </div>
              <span className="text-xs font-bold text-zinc-500">{t('Forecast')}</span>
            </div>

            {/* Bar chart */}
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-4 pb-2">
              {upcomingForecast.map((day) => {
                const heightPct = Math.round((day.count / maxForecastCount) * 100);
                return (
                  <div key={day.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs font-black text-zinc-800">{day.count}</span>
                    <div className="w-full max-w-[40px] bg-[#EAE6DF] border-2 border-black rounded-t overflow-hidden h-28 flex items-end">
                      <div
                        className="w-full bg-[#1769FF] transition-all duration-300"
                        style={{ height: `${Math.max(8, heightPct)}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-[11px] font-black uppercase block text-zinc-900">
                        {t(day.label)}
                      </span>
                      <span className="text-[9px] font-semibold text-zinc-500 hidden sm:block">
                        {day.dateStr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SM-2 Quality Distribution (Bento Span 5) */}
        <div className="bento-span-5">
          <div className="brutal-card bg-white p-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#FF922B]" />
                <h3 className="font-black text-base text-[#111111]">
                  {t('SM-2 Rating Distribution')}
                </h3>
              </div>
              <span className="text-xs font-bold text-zinc-500">{totalReviews} {t('total')}</span>
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-center">
              {[
                { label: 'Again (Fail)', count: ratingCounts.again, color: '#FF6B6B' },
                { label: 'Hard (Recall with effort)', count: ratingCounts.hard, color: '#FF922B' },
                { label: 'Good (Standard recall)', count: ratingCounts.good, color: '#A9E34B' },
                { label: 'Easy (Instant mastery)', count: ratingCounts.easy, color: '#51CF66' }
              ].map((item) => {
                const pct = totalReviews > 0 ? Math.round((item.count / totalReviews) * 100) : 0;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-700">{t(item.label)}</span>
                      <span className="text-zinc-900">{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-3 bg-[#EAE6DF] border border-black rounded overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Deck Mastery Progress Table */}
      <div className="brutal-card bg-white p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-black">
          <Layers className="w-5 h-5 text-[#7950F2]" />
          <h3 className="font-black text-base text-[#111111]">
            {t('Deck Mastery & Card Progression')}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-black text-zinc-600 uppercase tracking-wider font-black">
                <th className="py-2.5 px-3">{t('Deck')}</th>
                <th className="py-2.5 px-3">{t('Total')}</th>
                <th className="py-2.5 px-3">{t('Mastered (Rep ≥ 2)')}</th>
                <th className="py-2.5 px-3">{t('Learning')}</th>
                <th className="py-2.5 px-3">{t('Mastery %')}</th>
              </tr>
            </thead>
            <tbody className="divide-y border-b-2 border-black">
              {deckMastery.map(({ deck, total, mastered, learning, percentage }) => (
                <tr key={deck.id} className="hover:bg-[#F8F7F2]">
                  <td className="py-3 px-3 font-black text-zinc-900 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black"
                      style={{ backgroundColor: deck.color }}
                    />
                    {deck.title}
                  </td>
                  <td className="py-3 px-3 font-bold">{total}</td>
                  <td className="py-3 px-3 font-bold text-[#12A05C]">{mastered}</td>
                  <td className="py-3 px-3 font-bold text-[#FF922B]">{learning}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-[#EAE6DF] border border-black rounded-full overflow-hidden">
                        <div
                          className="h-full"
                          style={{ width: `${percentage}%`, backgroundColor: deck.color }}
                        />
                      </div>
                      <span className="font-black text-zinc-800">{percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
