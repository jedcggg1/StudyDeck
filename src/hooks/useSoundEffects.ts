import { useCallback } from 'react';

/**
 * Web Audio API synthesized sound effects.
 * 100% offline, zero external sound files required.
 */
export function useSoundEffects(enabled: boolean = true) {
  const playTone = useCallback(
    (freq: number, type: OscillatorType, duration: number, gainValue = 0.08) => {
      if (!enabled) return;
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(gainValue, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {
        // Ignore audio playback errors if audio context blocked
      }
    },
    [enabled]
  );

  const playClick = useCallback(() => {
    playTone(600, 'sine', 0.04, 0.05);
  }, [playTone]);

  const playFlip = useCallback(() => {
    playTone(380, 'triangle', 0.08, 0.06);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    if (!enabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playNote = (f: number, start: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + 0.15);
      };

      playNote(440, 0);       // A4
      playNote(554.37, 0.08); // C#5
      playNote(659.25, 0.16); // E5
    } catch {
      // Ignore
    }
  }, [enabled]);

  const playFail = useCallback(() => {
    playTone(180, 'sawtooth', 0.15, 0.06);
  }, [playTone]);

  return { playClick, playFlip, playSuccess, playFail };
}
