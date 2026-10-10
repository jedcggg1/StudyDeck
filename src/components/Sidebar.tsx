import React from 'react';
import {
  LayoutDashboard,
  Layers,
  GraduationCap,
  BarChart3,
  ArrowUpDown,
  Settings,
  HardDrive
} from 'lucide-react';
import { useTranslation } from '../i18n';

export type NavPage = 'dashboard' | 'decks' | 'study' | 'stats' | 'import-export' | 'settings';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  dueCardsCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  dueCardsCount = 0,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const { t } = useTranslation();
  const navItems: Array<{ id: NavPage; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: 'dashboard', label: t('Dashboard'), icon: LayoutDashboard },
    { id: 'decks', label: t('My Decks'), icon: Layers },
    { id: 'study', label: t('Study'), icon: GraduationCap, badge: dueCardsCount > 0 ? dueCardsCount : undefined },
    { id: 'stats', label: t('Stats'), icon: BarChart3 },
    { id: 'import-export', label: t('Import / Export'), icon: ArrowUpDown },
    { id: 'settings', label: t('Settings'), icon: Settings }
  ];

  const handleSelect = (page: NavPage) => {
    onNavigate(page);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed lg:static top-[61px] left-0 bottom-0 z-40 w-[86vw] max-w-[22rem] lg:w-64 bg-[var(--bg-page)] border-r-[2.5px] border-[var(--border-color)] p-5 lg:p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] flex flex-col justify-between overflow-y-auto transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation buttons */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 lg:px-3.5 lg:py-3 rounded text-base lg:text-sm font-bold border-2 transition-all duration-100 ${
                  isActive
                    ? 'bg-[#1769FF] text-white border-[#111111] shadow-[3px_3px_0px_#111111] translate-x-1'
                    : 'bg-white text-[#111111] border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#F1EFEA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-6 h-6 lg:w-5 lg:h-5 ${isActive ? 'text-white' : 'text-[#111111]'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-black border border-[#111111] ${
                      isActive
                        ? 'bg-[#FF922B] text-black shadow-[1px_1px_0px_#000]'
                        : 'bg-[#1769FF] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Local Storage status footer card */}
        <div className="mt-6 pt-4 border-t-2 border-[#111111]">
          <div className="brutal-card p-3 bg-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#12A05C]"></span>
              <span className="text-xs font-black text-[#111111] uppercase tracking-wider">
                {t('Local Storage')}
              </span>
            </div>
            <p className="text-[11px] text-[#555555] font-medium leading-relaxed">
              {t('All data is saved on your device. No internet required.')}
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-zinc-600 bg-[#F8F7F2] px-2 py-1 border border-[#111111] rounded">
              <HardDrive className="w-3.5 h-3.5 text-[#1769FF]" />
              <span>Dexie.js / IndexedDB</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
