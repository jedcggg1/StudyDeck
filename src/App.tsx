import { useState, useEffect, useCallback } from 'react';
import { db, getOrInitSettings } from './db/database';
import { seedInitialDataIfEmpty, SAMPLE_DECKS, SAMPLE_CARDS } from './db/seedData';
import { Deck, Flashcard, ReviewLog, AppSettings, StudyRating, FormulaTemplate } from './types';
import { calculateSM2, isCardDue } from './services/sm2';
import { Navbar } from './components/Navbar';
import { Sidebar, NavPage } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DecksPage } from './pages/DecksPage';
import { DeckDetailPage } from './pages/DeckDetailPage';
import { StudySession } from './pages/StudySession';
import { StatisticsPage } from './pages/StatisticsPage';
import { ImportExportPage } from './pages/ImportExportPage';
import { SettingsPage } from './pages/SettingsPage';
import { DeckEditorModal } from './components/DeckEditorModal';
import { CardEditorModal } from './components/CardEditorModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthScreen } from './components/AuthScreen';
import { useAuth } from './auth/AuthProvider';
import { LanguageProvider } from './i18n';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function App() {
  const { user, isLoading: isAuthLoading, isOfflineMode, signOut } = useAuth();

  // Database State
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  // Navigation State
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [studyQueue, setStudyQueue] = useState<Flashcard[] | null>(null);
  const [studyDeck, setStudyDeck] = useState<Deck | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Modals State
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [cardModalDeckId, setCardModalDeckId] = useState<string>('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) setShowLogin(false);
  }, [user]);

  // 1. Initialize Database & Seed Sample Data
  const loadData = useCallback(async () => {
    try {
      const appSettings = await getOrInitSettings();
      setSettings(appSettings);

      // Seed starter decks if empty
      await seedInitialDataIfEmpty(db);

      const allDecks = await db.decks.toArray();
      const allCards = await db.cards.toArray();
      const allLogs = await db.reviewLogs.toArray();

      setDecks(allDecks);
      setCards(allCards);
      setReviewLogs(allLogs);

      // Check onboarding state
      if (!appSettings.hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    } catch (err: any) {
      console.error('Failed to initialize local IndexedDB:', err);
      setInitError(err.message || 'IndexedDB could not be opened.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Apply Theme attribute to document element
  useEffect(() => {
    if (settings?.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
    document.documentElement.lang = settings?.language === 'th' ? 'th' : 'en';
  }, [settings?.theme, settings?.language]);

  // 2. Deck Actions
  const handleSaveDeck = async (
    deckData: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    const now = Date.now();
    if (id) {
      const updated: Deck = {
        ...deckData,
        id,
        createdAt: decks.find((d) => d.id === id)?.createdAt || now,
        updatedAt: now
      };
      await db.decks.put(updated);
      setDecks((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } else {
      const newDeck: Deck = {
        ...deckData,
        id: `deck-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        updatedAt: now
      };
      await db.decks.add(newDeck);
      setDecks((prev) => [...prev, newDeck]);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    await db.decks.delete(deckId);
    await db.cards.where('deckId').equals(deckId).delete();
    await db.reviewLogs.where('deckId').equals(deckId).delete();

    setDecks((prev) => prev.filter((d) => d.id !== deckId));
    setCards((prev) => prev.filter((c) => c.deckId !== deckId));
    setReviewLogs((prev) => prev.filter((l) => l.deckId !== deckId));

    if (activeDeckId === deckId) {
      setActiveDeckId(null);
      setCurrentPage('decks');
    }
  };

  const handleDuplicateDeck = async (deck: Deck) => {
    const now = Date.now();
    const newDeckId = `deck-${now}-${Math.random().toString(36).substring(2, 6)}`;
    const duplicatedDeck: Deck = {
      ...deck,
      id: newDeckId,
      title: `${deck.title} (Copy)`,
      createdAt: now,
      updatedAt: now
    };

    const deckCards = cards.filter((c) => c.deckId === deck.id);
    const duplicatedCards: Flashcard[] = deckCards.map((c) => ({
      ...c,
      id: `card-${now}-${Math.random().toString(36).substring(2, 6)}`,
      deckId: newDeckId,
      repetition: 0,
      interval: 0,
      easeFactor: 2.5,
      nextReviewDate: now,
      createdAt: now,
      updatedAt: now
    }));

    await db.decks.add(duplicatedDeck);
    if (duplicatedCards.length > 0) {
      await db.cards.bulkAdd(duplicatedCards);
    }

    setDecks((prev) => [...prev, duplicatedDeck]);
    setCards((prev) => [...prev, ...duplicatedCards]);
  };

  // 3. Card Actions
  const handleSaveCard = async (
    cardData: Omit<
      Flashcard,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'repetition'
      | 'interval'
      | 'easeFactor'
      | 'nextReviewDate'
    >,
    id?: string
  ) => {
    const now = Date.now();
    if (id) {
      const existing = cards.find((c) => c.id === id);
      const updated: Flashcard = {
        ...existing!,
        ...cardData,
        updatedAt: now
      };
      await db.cards.put(updated);
      setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } else {
      const newCard: Flashcard = {
        ...cardData,
        id: `card-${now}-${Math.random().toString(36).substring(2, 6)}`,
        repetition: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: now,
        createdAt: now,
        updatedAt: now
      };
      await db.cards.add(newCard);
      setCards((prev) => [...prev, newCard]);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    await db.cards.delete(cardId);
    await db.reviewLogs.where('cardId').equals(cardId).delete();
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setReviewLogs((prev) => prev.filter((l) => l.cardId !== cardId));
  };

  // 4. Study & SM-2 Engine Integration
  const startStudySession = (targetDeckId?: string) => {
    let pool: Flashcard[] = [];
    let selectedDeck: Deck | undefined = undefined;

    if (targetDeckId) {
      selectedDeck = decks.find((d) => d.id === targetDeckId);
      const deckCards = cards.filter((c) => c.deckId === targetDeckId);
      // First due cards, or all cards if cramming
      const due = deckCards.filter((c) => isCardDue(c));
      pool = due.length > 0 ? due : deckCards;
    } else {
      // Global study: all due cards
      const due = cards.filter((c) => isCardDue(c));
      pool = due.length > 0 ? due : cards;
    }

    setStudyQueue(pool);
    setStudyDeck(selectedDeck);
    setCurrentPage('study');
  };

  const handleRecordReview = async (card: Flashcard, rating: StudyRating) => {
    const now = Date.now();
    const sm2Result = calculateSM2(
      {
        repetition: card.repetition,
        interval: card.interval,
        easeFactor: card.easeFactor
      },
      rating
    );

    const updatedCard: Flashcard = {
      ...card,
      repetition: sm2Result.repetition,
      interval: sm2Result.interval,
      easeFactor: sm2Result.easeFactor,
      nextReviewDate: sm2Result.nextReviewDate,
      lastReviewedAt: now,
      updatedAt: now
    };

    // Log review history
    const log: ReviewLog = {
      id: `log-${now}-${Math.random().toString(36).substring(2, 6)}`,
      cardId: card.id,
      deckId: card.deckId,
      rating,
      quality: rating === 'again' ? 1 : rating === 'hard' ? 3 : rating === 'good' ? 4 : 5,
      previousInterval: card.interval,
      newInterval: sm2Result.interval,
      previousEaseFactor: card.easeFactor,
      newEaseFactor: sm2Result.easeFactor,
      reviewedAt: now
    };

    await db.cards.put(updatedCard);
    await db.reviewLogs.add(log);

    setCards((prev) => prev.map((c) => (c.id === card.id ? updatedCard : c)));
    setReviewLogs((prev) => [...prev, log]);
  };

  // 5. Settings, Imports & Maintenance
  const handleUpdateSettings = async (updates: Partial<AppSettings>) => {
    if (!settings) return;
    const updated = { ...settings, ...updates };
    await db.settings.put(updated);
    setSettings(updated);
  };

  const handleImportSuccess = async (importedDecks: Deck[], importedCards: Flashcard[]) => {
    await db.decks.bulkPut(importedDecks);
    await db.cards.bulkPut(importedCards);
    await loadData();
    setCurrentPage('dashboard');
  };

  const handleResetSampleData = async () => {
    await db.decks.clear();
    await db.cards.clear();
    await db.reviewLogs.clear();
    await db.decks.bulkAdd(SAMPLE_DECKS);
    await db.cards.bulkAdd(SAMPLE_CARDS);
    await loadData();
    alert('Starter STEM decks for Calculus, Chemistry, and Physics have been reloaded!');
  };

  const handleClearAllData = async () => {
    await db.decks.clear();
    await db.cards.clear();
    await db.reviewLogs.clear();
    await loadData();
  };

  // Loading Screen
  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-dvh bg-[var(--bg-page)] text-[var(--text-main)] flex flex-col items-center justify-center p-4">
        <div className="brutal-card p-8 bg-white text-center max-w-sm">
          <RefreshCw className="w-8 h-8 text-[#1769FF] animate-spin mx-auto mb-3" />
          <h2 className="text-xl font-black text-[#111111]">Loading StudyDeck</h2>
          <p className="text-xs font-semibold text-zinc-500 mt-1">
            Accessing offline IndexedDB storage...
          </p>
        </div>
      </div>
    );
  }

  // FLOW E: Database Initialization Failure
  if (initError) {
    return (
      <div className="min-h-dvh bg-[var(--bg-page)] text-[var(--text-main)] flex flex-col items-center justify-center p-4">
        <div className="brutal-card p-8 bg-white text-center max-w-md border-t-8 border-t-red-600">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <h2 className="text-xl font-black text-[#111111]">Database Access Error</h2>
          <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
            {initError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="brutal-btn brutal-btn-primary mt-6 !text-xs"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  if ((!user && !isOfflineMode) || (showLogin && !user)) {
    return (
      <LanguageProvider language={settings?.language || 'en'}>
        <AuthScreen onContinueOffline={() => setShowLogin(false)} />
      </LanguageProvider>
    );
  }

  const dueCardsCount = cards.filter((c) => isCardDue(c)).length;

  return (
    <LanguageProvider language={settings?.language || 'en'}>
      <div className="min-h-dvh flex flex-col bg-[var(--bg-page)] text-[var(--text-main)]">
      {/* 1. Global Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSettings={() => setCurrentPage('settings')}
        onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
        isSidebarOpen={isSidebarOpenMobile}
        userEmail={user?.email}
        onSignOut={user ? () => void signOut() : undefined}
        onOpenLogin={isOfflineMode ? () => setShowLogin(true) : undefined}
      />

      {/* 2. Main Layout Container: Sidebar + Page Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page);
            setActiveDeckId(null);
          }}
          dueCardsCount={dueCardsCount}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
        />

        {/* Page Content Body */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 xl:p-10">
          {currentPage === 'dashboard' && (
            <Dashboard
              decks={decks}
              cards={cards}
              reviewLogs={reviewLogs}
              searchQuery={searchQuery}
              onNavigate={setCurrentPage}
              onStartStudy={startStudySession}
              onOpenDeck={(deckId) => {
                setActiveDeckId(deckId);
                setCurrentPage('decks');
              }}
              onCreateDeck={() => {
                setEditingDeck(null);
                setIsDeckModalOpen(true);
              }}
              onImportClick={() => setCurrentPage('import-export')}
            />
          )}

          {currentPage === 'decks' && (
            activeDeckId ? (
              <DeckDetailPage
                deck={decks.find((d) => d.id === activeDeckId)!}
                cards={cards}
                onBack={() => setActiveDeckId(null)}
                onStartStudy={startStudySession}
                onAddCard={(deckId) => {
                  setCardModalDeckId(deckId);
                  setEditingCard(null);
                  setIsCardModalOpen(true);
                }}
                onDeleteDeck={handleDeleteDeck}
                onEditCard={(card) => {
                  setCardModalDeckId(card.deckId);
                  setEditingCard(card);
                  setIsCardModalOpen(true);
                }}
                onDeleteCard={handleDeleteCard}
              />
            ) : (
              <DecksPage
                decks={decks}
                cards={cards}
                onOpenDeck={(deckId) => setActiveDeckId(deckId)}
                onAddCard={(deckId) => {
                  setCardModalDeckId(deckId);
                  setEditingCard(null);
                  setIsCardModalOpen(true);
                }}
                onStartStudy={startStudySession}
                onCreateDeck={() => {
                  setEditingDeck(null);
                  setIsDeckModalOpen(true);
                }}
                onEditDeck={(deck) => {
                  setEditingDeck(deck);
                  setIsDeckModalOpen(true);
                }}
                onDuplicateDeck={handleDuplicateDeck}
                onDeleteDeck={handleDeleteDeck}
              />
            )
          )}

          {currentPage === 'study' && (
            <StudySession
              deck={studyDeck}
              cardsToReview={studyQueue || cards}
              soundEnabled={settings?.soundEnabled}
              onFinishSession={() => {
                setStudyQueue(null);
                setCurrentPage('dashboard');
              }}
              onRecordReview={handleRecordReview}
            />
          )}

          {currentPage === 'stats' && (
            <StatisticsPage
              decks={decks}
              cards={cards}
              reviewLogs={reviewLogs}
            />
          )}

          {currentPage === 'import-export' && (
            <ImportExportPage
              decks={decks}
              cards={cards}
              onImportSuccess={handleImportSuccess}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              settings={settings!}
              decks={decks}
              cards={cards}
              onUpdateSettings={handleUpdateSettings}
              onResetSampleData={handleResetSampleData}
              onClearAllData={handleClearAllData}
              onShowOnboarding={() => setShowOnboarding(true)}
            />
          )}
        </main>
      </div>

      {/* 3. Global Modals */}
      <DeckEditorModal
        isOpen={isDeckModalOpen}
        deckToEdit={editingDeck}
        onClose={() => {
          setIsDeckModalOpen(false);
          setEditingDeck(null);
        }}
        onSave={handleSaveDeck}
        onDelete={handleDeleteDeck}
      />

      <CardEditorModal
        isOpen={isCardModalOpen}
        deckId={cardModalDeckId}
        cardToEdit={editingCard}
        customFormulas={settings?.formulaTemplates ?? []}
        customCategories={settings?.customFormulaCategories ?? []}
        onAddFormula={(tmpl: FormulaTemplate) => {
          const current = settings?.formulaTemplates ?? [];
          void handleUpdateSettings({ formulaTemplates: [...current, tmpl] });
        }}
        onDeleteFormula={(id: string) => {
          const current = settings?.formulaTemplates ?? [];
          void handleUpdateSettings({ formulaTemplates: current.filter((f) => f.id !== id) });
        }}
        onAddCategory={(name: string) => {
          const current = settings?.customFormulaCategories ?? [];
          if (current.includes(name)) return;
          void handleUpdateSettings({ customFormulaCategories: [...current, name] });
        }}
        onDeleteCategory={(name: string) => {
          const current = settings?.customFormulaCategories ?? [];
          void handleUpdateSettings({ customFormulaCategories: current.filter((c) => c !== name) });
        }}
        onClose={() => {
          setIsCardModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={async () => {
          setShowOnboarding(false);
          await handleUpdateSettings({ hasCompletedOnboarding: true });
        }}
      />
      </div>
    </LanguageProvider>
  );
}
export default App;
