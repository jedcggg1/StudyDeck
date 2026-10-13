import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  RotateCw,
  Trophy,
  CheckCircle,
  Volume2,
  VolumeX,
  Keyboard
} from 'lucide-react';
import { Deck, Flashcard, StudyRating } from '../types';
import { MathMarkdown } from '../components/MathMarkdown';
import { previewNextIntervals } from '../services/sm2';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useTranslation } from '../i18n';

interface StudySessionProps {
  deck?: Deck;
  cardsToReview: Flashcard[];
  soundEnabled?: boolean;
  onFinishSession: () => void;
  onRecordReview: (
    card: Flashcard,
    rating: StudyRating
  ) => Promise<void>;
}

export const StudySession: React.FC<StudySessionProps> = ({
  deck,
  cardsToReview,
  soundEnabled = true,
  onFinishSession,
  onRecordReview
}) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [soundOn, setSoundOn] = useState(soundEnabled);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const ratingInProgress = useRef(false);
  const [sessionStats, setSessionStats] = useState<{
    again: number;
    hard: number;
    good: number;
    easy: number;
  }>({ again: 0, hard: 0, good: 0, easy: 0 });

  const { playClick, playFlip, playSuccess, playFail } = useSoundEffects(soundOn);

  const currentCard = cardsToReview[currentIndex];

  // Calculate predicted intervals for the active card
  const predictedIntervals = useMemo(() => {
    if (!currentCard) return null;
    return previewNextIntervals(currentCard);
  }, [currentCard]);

  // Flip card
  const handleReveal = useCallback(() => {
    if (isRevealed) return;
    playFlip();
    setIsRevealed(true);
  }, [isRevealed, playFlip]);

  // Process rating
  const handleRate = useCallback(
    async (rating: StudyRating) => {
      if (!currentCard || ratingInProgress.current) return;

      ratingInProgress.current = true;
      setIsSavingReview(true);
      setReviewError(null);
      try {
        try {
          await onRecordReview(currentCard, rating);
        } catch (error) {
          console.error('Failed to save study review:', error);
          setReviewError(t('Could not save this review. Please try again.'));
          return;
        }

        if (rating === 'again') playFail();
        else playClick();
        setSessionStats((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));

        if (currentIndex + 1 >= cardsToReview.length) {
          setSessionCompleted(true);
          playSuccess();
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch {
            // ignore if canvas not supported
          }
        } else {
          setCurrentIndex((prev) => prev + 1);
          setIsRevealed(false);
        }
      } catch (error) {
        console.error('Failed to save study review:', error);
        setReviewError(t('Could not save this review. Please try again.'));
      } finally {
        ratingInProgress.current = false;
        setIsSavingReview(false);
      }
    },
    [currentCard, currentIndex, cardsToReview.length, onRecordReview, playClick, playFail, playSuccess, t]
  );

  // Keyboard navigation: Space to reveal, 1-4 to rate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionCompleted) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isRevealed) {
          handleReveal();
        }
      } else if (isRevealed) {
        if (e.key === '1') {
          e.preventDefault();
          handleRate('again');
        } else if (e.key === '2') {
          e.preventDefault();
          handleRate('hard');
        } else if (e.key === '3') {
          e.preventDefault();
          handleRate('good');
        } else if (e.key === '4') {
          e.preventDefault();
          handleRate('easy');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, sessionCompleted, handleReveal, handleRate]);

  // If no cards were provided
  if (cardsToReview.length === 0) {
    return (
      <div className="brutal-card p-10 text-center bg-white max-w-lg mx-auto my-12">
        <h2 className="text-xl font-black text-[#111111]">{t('No Cards To Study')}</h2>
        <p className="text-sm text-zinc-600 mt-2">
          {t('There are no cards in this queue right now.')}
        </p>
        <button
          onClick={onFinishSession}
          className="brutal-btn brutal-btn-primary mt-6 !text-xs"
        >
          {t('Return to Dashboard')}
        </button>
      </div>
    );
  }

  // Session Summary Screen
  if (sessionCompleted) {
    const total = cardsToReview.length;
    const accuracy = Math.round(
      ((sessionStats.good + sessionStats.easy) / total) * 100
    );

    return (
      <div className="max-w-xl mx-auto my-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="brutal-card bg-white p-6 sm:p-8 text-center border-t-8 border-t-[#12A05C]">
          <div className="w-16 h-16 bg-[#EBFBEE] border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_#111]">
            <Trophy className="w-8 h-8 text-[#12A05C]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
            {t('Session Completed!')}
          </h2>
          <p className="text-sm font-semibold text-zinc-600 mt-1">
            {t('Excellent work! You have reviewed all scheduled flashcards.')}
          </p>

          {/* Score Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-6 text-left">
            <div className="p-3 bg-[#FFF5F5] border-2 border-black rounded shadow-[2px_2px_0px_#111]">
              <span className="text-[10px] font-black uppercase text-red-700 block">{t('Again')}</span>
              <span className="text-2xl font-black text-red-800">{sessionStats.again}</span>
            </div>
            <div className="p-3 bg-[#FFF9DB] border-2 border-black rounded shadow-[2px_2px_0px_#111]">
              <span className="text-[10px] font-black uppercase text-yellow-700 block">{t('Hard')}</span>
              <span className="text-2xl font-black text-yellow-800">{sessionStats.hard}</span>
            </div>
            <div className="p-3 bg-[#EBFBEE] border-2 border-black rounded shadow-[2px_2px_0px_#111]">
              <span className="text-[10px] font-black uppercase text-green-700 block">{t('Good')}</span>
              <span className="text-2xl font-black text-green-800">{sessionStats.good}</span>
            </div>
            <div className="p-3 bg-[#E7F5FF] border-2 border-black rounded shadow-[2px_2px_0px_#111]">
              <span className="text-[10px] font-black uppercase text-blue-700 block">{t('Easy')}</span>
              <span className="text-2xl font-black text-blue-800">{sessionStats.easy}</span>
            </div>
          </div>

          <div className="p-4 bg-[#F8F7F2] border-2 border-black rounded flex items-center justify-between text-xs font-bold text-zinc-700 mb-6">
            <span>{t('Overall Retention Accuracy:')}</span>
            <span className="text-base font-black text-[#12A05C]">{accuracy}%</span>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={onFinishSession}
              className="brutal-btn brutal-btn-primary"
            >
              <CheckCircle className="w-4 h-4" />
              {t('Return to Dashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Flashcard Study Review
  const progressPct = Math.round(((currentIndex) / cardsToReview.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onFinishSession}
          className="brutal-btn bg-white !py-1.5 !px-3 !text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('Quit Session')}
        </button>

        {/* Progress counter */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-zinc-700">
            {t('Card')} {currentIndex + 1} / {cardsToReview.length}
          </span>
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="p-1.5 bg-white border border-black rounded shadow-[1px_1px_0px_#111] hover:bg-zinc-100 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#111] transition-all"
            title={soundOn ? t('Disable Sound') : t('Enable Sound')}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-zinc-700" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#EAE6DF] border-2 border-black rounded-full overflow-hidden shadow-[1px_1px_0px_#111]">
        <div
          className="h-full bg-[#1769FF] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* FLASHCARD CONTAINER (Matches Reference Image 1) */}
      <div className="brutal-card bg-white overflow-hidden min-h-[380px] flex flex-col justify-between shadow-[5px_5px_0px_#111111]">
        {/* Card Header */}
        <div className="px-5 py-3 border-b-2 border-black bg-[#F8F7F2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full border border-black"
              style={{ backgroundColor: deck?.color || '#1769FF' }}
            />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-900">
              {deck?.title || t('StudyDeck Collection')}
            </span>
          </div>

          <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded border border-black bg-white shadow-[1px_1px_0px_#111]">
            {isRevealed ? t('Back / Answer') : t('Front / Question')}
          </span>
        </div>

        {/* Card Content Area with KaTeX rendering */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
          {/* Front Prompt */}
          <div className="space-y-4">
            <MathMarkdown content={currentCard.front} className="text-base sm:text-lg" />
          </div>

          {/* Back Revealed Section */}
          {isRevealed && (
            <div className="mt-6 pt-6 border-t-2 border-dashed border-black animate-in fade-in duration-200">
              <div className="p-4 bg-[#F8F7F2] border-2 border-black rounded shadow-[3px_3px_0px_#111]">
                <MathMarkdown content={currentCard.back} className="text-base sm:text-lg" />
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION PANEL */}
        <div className="p-4 border-t-2 border-black bg-[#F8F7F2]">
          {!isRevealed ? (
            /* Reveal Answer Button */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                <Keyboard className="w-3.5 h-3.5" />
                <span>{t('Press [Space] to reveal answer')}</span>
              </div>

              <button
                onClick={handleReveal}
                className="brutal-btn brutal-btn-primary w-full sm:w-auto !py-3 !px-8 text-base shadow-[4px_4px_0px_#111111]"
              >
                <RotateCw className="w-4 h-4" />
                {t('Reveal Answer')}
              </button>
            </div>
          ) : (
            /* SM-2 4-Rating Buttons (Matches Reference Image 1) */
            <div className="space-y-2">
              {reviewError && (
                <p role="alert" className="text-sm font-bold text-red-700">
                  {reviewError}
                </p>
              )}
              {isSavingReview && (
                <p role="status" className="text-sm font-bold text-zinc-600">
                  {t('Saving review...')}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1: Again */}
                <button
                  disabled={isSavingReview}
                  onClick={() => handleRate('again')}
                  className="brutal-btn !bg-[#FF6B6B] !text-black !border-black hover:!bg-[#FA5252] flex flex-col items-center !py-2.5 shadow-[3px_3px_0px_#111111]"
                >
                  <span className="text-sm font-black uppercase">{t('Again')}</span>
                  <span className="text-[11px] font-bold text-zinc-900 mt-0.5">
                    {predictedIntervals?.again.label || '1d'}
                  </span>
                  <span className="text-[10px] opacity-75 font-mono">[1]</span>
                </button>

                {/* 2: Hard */}
                <button
                  disabled={isSavingReview}
                  onClick={() => handleRate('hard')}
                  className="brutal-btn !bg-[#FF922B] !text-black !border-black hover:!bg-[#F76707] flex flex-col items-center !py-2.5 shadow-[3px_3px_0px_#111111]"
                >
                  <span className="text-sm font-black uppercase">{t('Hard')}</span>
                  <span className="text-[11px] font-bold text-zinc-900 mt-0.5">
                    {predictedIntervals?.hard.label || '3d'}
                  </span>
                  <span className="text-[10px] opacity-75 font-mono">[2]</span>
                </button>

                {/* 3: Good */}
                <button
                  disabled={isSavingReview}
                  onClick={() => handleRate('good')}
                  className="brutal-btn !bg-[#A9E34B] !text-black !border-black hover:!bg-[#94D82D] flex flex-col items-center !py-2.5 shadow-[3px_3px_0px_#111111]"
                >
                  <span className="text-sm font-black uppercase">{t('Good')}</span>
                  <span className="text-[11px] font-bold text-zinc-900 mt-0.5">
                    {predictedIntervals?.good.label || '6d'}
                  </span>
                  <span className="text-[10px] opacity-75 font-mono">[3]</span>
                </button>

                {/* 4: Easy */}
                <button
                  disabled={isSavingReview}
                  onClick={() => handleRate('easy')}
                  className="brutal-btn !bg-[#51CF66] !text-black !border-black hover:!bg-[#40C057] flex flex-col items-center !py-2.5 shadow-[3px_3px_0px_#111111]"
                >
                  <span className="text-sm font-black uppercase">{t('Easy')}</span>
                  <span className="text-[11px] font-bold text-zinc-900 mt-0.5">
                    {predictedIntervals?.easy.label || '14d'}
                  </span>
                  <span className="text-[10px] opacity-75 font-mono">[4]</span>
                </button>
              </div>

              <div className="text-center text-[11px] font-bold text-zinc-500 pt-1">
                {t('Keys [1] [2] [3] [4] to rate memory recall')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
