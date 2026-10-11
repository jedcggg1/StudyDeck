import React, { useState } from 'react';
import { Sparkles, BrainCircuit, HardDrive, ArrowRight, Check, X } from 'lucide-react';
import { useTranslation } from '../i18n';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(0);
  const { t } = useTranslation();

  if (!isOpen) return null;

  const steps = [
    {
      title: t('Welcome to StudyDeck'),
      subtitle: t('The Advanced Offline-First Flashcard Platform'),
      badge: t('Step 1 of 3'),
      color: '#1769FF',
      icon: Sparkles,
      content: (
        <div className="space-y-3 text-sm text-zinc-800 leading-relaxed">
          <p>
            StudyDeck helps you master complex subjects using <strong>SuperMemo 2 (SM-2) Spaced Repetition</strong>.
          </p>
          <div className="p-3 bg-[#EBFBEE] border-2 border-black rounded shadow-[2px_2px_0px_#111]">
            <p className="font-bold text-[#0B7A43]">
              {t('100% Offline-First Architecture')}
            </p>
            <p className="text-xs text-zinc-700 mt-1">
              All your decks, cards, and review intervals are stored directly on your device in IndexedDB. Study anywhere with zero latency, even on airplanes or spotty internet.
            </p>
          </div>
        </div>
      )
    },
    {
      title: t('LaTeX Math & Markdown'),
      subtitle: t('Built for STEM, Medicine, and Engineering'),
      badge: t('Step 2 of 3'),
      color: '#7950F2',
      icon: BrainCircuit,
      content: (
        <div className="space-y-3 text-sm text-zinc-800 leading-relaxed">
          <p>
            Write equations using standard KaTeX notation like <code className="bg-zinc-200 px-1 border border-black text-xs font-mono">$$\int x^2 dx$$</code> or <code className="bg-zinc-200 px-1 border border-black text-xs font-mono">PV = nRT</code>.
          </p>
          <div className="p-3 bg-[#FFF3BF] border-2 border-black rounded shadow-[2px_2px_0px_#111]">
            <p className="font-bold text-[#D9480F]">
              {t('📐 Pre-loaded STEM Decks')}
            </p>
            <p className="text-xs text-zinc-700 mt-1">
              We have pre-loaded comprehensive starter decks for <strong>Calculus</strong>, <strong>Chemistry</strong>, and <strong>Physics</strong> with explanations in both English and Thai.
            </p>
          </div>
        </div>
      )
    },
    {
      title: t('SM-2 Memory Scheduling'),
      subtitle: t('Remember More In Less Time'),
      badge: t('Step 3 of 3'),
      color: '#12A05C',
      icon: HardDrive,
      content: (
        <div className="space-y-3 text-sm text-zinc-800 leading-relaxed">
          <p>
            {t('When studying, reveal the answer and rate your recall:')}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <div className="p-2 bg-[#FFC9C9] border border-black rounded text-red-900">
              Again (1d) — Repeat soon
            </div>
            <div className="p-2 bg-[#FFE066] border border-black rounded text-yellow-950">
              Hard (3d) — Recalled with effort
            </div>
            <div className="p-2 bg-[#D3F9D8] border border-black rounded text-green-950">
              Good (6d) — Standard interval
            </div>
            <div className="p-2 bg-[#A9E34B] border border-black rounded text-black">
              Easy (7-14d) — Effortless recall
            </div>
          </div>
        </div>
      )
    }
  ];

  const current = steps[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="brutal-card bg-white w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Banner */}
        <div
          className="p-5 border-b-2 border-black flex items-center justify-between text-white"
          style={{ backgroundColor: current.color }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border-2 border-black rounded flex items-center justify-center text-black shadow-[2px_2px_0px_#111]">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-1.5 py-0.5 rounded">
                {current.badge}
              </span>
              <h3 className="text-lg font-black tracking-tight">{current.title}</h3>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="w-7 h-7 bg-white text-black border border-black rounded flex items-center justify-center shadow-[1.5px_1.5px_0px_#111] hover:bg-zinc-100"
            title={t('Skip onboarding')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            {current.subtitle}
          </p>
          {current.content}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-black bg-[#F8F7F2] flex items-center justify-between">
          <button
            onClick={onComplete}
            className="text-xs font-bold text-zinc-500 hover:text-black hover:underline"
          >
            {t('Skip for now')}
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="brutal-btn bg-white !py-1.5 !px-3 !text-xs"
              >
                {t('Back')}
              </button>
            )}
            <button
              onClick={handleNext}
              className="brutal-btn brutal-btn-primary !py-1.5 !px-4 !text-xs"
            >
              {step === steps.length - 1 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  {t('Get Started')}
                </>
              ) : (
                <>
                  {t('Next')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
