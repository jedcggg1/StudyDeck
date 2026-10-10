import React from 'react';
import { Search, Settings, Wifi, WifiOff, Menu, X, LogIn, LogOut, UserRound } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTranslation } from '../i18n';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSettings: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  userEmail?: string;
  onSignOut?: () => void;
  onOpenLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenSettings,
  onToggleSidebar,
  isSidebarOpen,
  userEmail,
  onSignOut,
  onOpenLogin
}) => {
  const isOnline = useNetworkStatus();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-page)] border-b-[2.5px] border-[var(--border-color)] px-3 py-2.5 sm:px-6 sm:py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden -ml-2 p-2 rounded-md text-[#111111] transition-colors hover:bg-[#EAE6DF] hover:text-[#1769FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1769FF]"
              aria-label={t('Toggle navigation menu')}
              aria-expanded={isSidebarOpen}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}

          <div className="flex items-center select-none shrink-0">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#111111]">
                  StudyDeck
                </span>
                <span className="hidden md:inline-block text-[10px] font-black uppercase px-1.5 py-0.5 bg-[#FF922B] text-[#111111] border border-[#111111] rounded">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-[#555555] tracking-tight -mt-0.5 hidden xs:block">
                {t('Learn Better. Offline. Always.')}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 min-w-0 max-w-xl mx-1 sm:mx-6">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t('Search decks, cards, or topics...')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="brutal-input !pl-10 pr-4 py-2 text-xs sm:text-sm bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-black"
                title={t('Clear search')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right actions: Online indicator & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {userEmail && onSignOut ? (
            <div className="flex items-center gap-1.5">
              <div
                className="flex items-center gap-1.5 max-w-44 px-2 py-1.5 border-2 border-[var(--border-color)] bg-[var(--bg-card)] shadow-[2px_2px_0px_var(--shadow-color)] rounded"
                title={userEmail}
              >
                <UserRound className="w-4 h-4 shrink-0 text-[#1769FF]" />
                <span className="hidden sm:inline truncate text-xs font-bold">{userEmail}</span>
              </div>
              <button
                onClick={onSignOut}
                className="brutal-btn brutal-icon-btn bg-white !p-2"
                title={t('Sign out')}
                aria-label={t('Sign out')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : onOpenLogin ? (
            <button
              onClick={onOpenLogin}
              className="brutal-btn brutal-btn-primary !px-2.5 sm:!px-3"
              title={t('Sign in')}
              aria-label={t('Sign in')}
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline text-xs">{t('Sign in')}</span>
            </button>
          ) : null}

          <div
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded border-2 border-[var(--border-color)] text-xs font-bold shadow-[2px_2px_0px_var(--shadow-color)] ${
              isOnline ? 'bg-[#EBFBEE] text-[#0B7A43]' : 'bg-[#FFF3BF] text-[#D9480F]'
            }`}
            title={isOnline ? t('Connected to internet') : t('Working offline locally')}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#12A05C]" />
                <span className="hidden sm:inline">{t('Online')}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-[#FF922B]" />
                <span className="hidden sm:inline">{t('Offline')}</span>
              </>
            )}
          </div>

          <button
            onClick={onOpenSettings}
            className="brutal-btn bg-white !p-2"
            title={t('Settings')}
            aria-label={t('Application Settings')}
          >
            <Settings className="w-5 h-5 text-[#111111]" />
          </button>
        </div>
      </div>
    </header>
  );
};
