import React from 'react';
import { Wifi, WifiOff, HardDrive } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTranslation } from '../i18n';

interface OfflineBannerProps {
  className?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ className = '' }) => {
  const isOnline = useNetworkStatus();
  const { t } = useTranslation();

  if (!isOnline) {
    return (
      <div className={`brutal-banner bg-[#FF922B] text-[#111111] p-4 flex items-center justify-between gap-4 ${className}`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-white border-2 border-[#111111] rounded flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#111111]">
            <WifiOff className="w-6 h-6 text-[#111111]" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight uppercase flex items-center gap-2">
              {t('Offline-mode: Working 100% locally')}
            </h2>
            <p className="text-sm font-semibold text-[#222222]">
              {t('Your data is safe on this device. No internet connection needed.')}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-[#111111] text-white px-3 py-1.5 rounded border border-[#111111] text-xs font-bold uppercase tracking-wider shrink-0">
          <HardDrive className="w-4 h-4 text-[#FF922B]" />
          {t('IndexedDB Active')}
        </div>
      </div>
    );
  }

  return (
    <div className={`brutal-banner bg-[#EBFBEE] border-2 border-[#111111] text-[#111111] p-3.5 flex items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#12A05C] text-white border-2 border-[#111111] rounded flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#111111]">
          <Wifi className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-tight flex items-center gap-2 text-[#0B7A43]">
            {t('Online-ready: Local-first architecture')}
          </h2>
          <p className="text-xs font-medium text-zinc-700">
            {t('All reviews and changes persist instantly to your offline database.')}
          </p>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2 bg-white text-[#111111] px-2.5 py-1 rounded border-2 border-[#111111] text-xs font-bold shadow-[2px_2px_0px_#111111]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#12A05C] animate-pulse"></span>
        {t('Zero Latency')}
      </div>
    </div>
  );
};
