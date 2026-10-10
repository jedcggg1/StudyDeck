import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getStoredOrRefreshedSession,
  isSupabaseConfigured,
  signInWithPassword,
  signOutCurrentSession,
  signUpWithPassword,
  SupabaseSession,
  SupabaseUser
} from './supabaseAuth';

const OFFLINE_MODE_KEY = 'studydeck.offline-mode';

interface AuthContextValue {
  user: SupabaseUser | null;
  session: SupabaseSession | null;
  isConfigured: boolean;
  isLoading: boolean;
  isOfflineMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  continueOffline: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getStoredOrRefreshedSession()
      .then((storedSession) => {
        if (!isMounted) return;
        setSession(storedSession);
        setIsOfflineMode(window.sessionStorage.getItem(OFFLINE_MODE_KEY) === 'true');
      })
      .catch(() => {
        if (isMounted) setSession(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user || null,
      session,
      isConfigured: isSupabaseConfigured,
      isLoading,
      isOfflineMode,
      signIn: async (email, password) => {
        const nextSession = await signInWithPassword(email, password);
        setSession(nextSession);
        setIsOfflineMode(false);
        window.sessionStorage.removeItem(OFFLINE_MODE_KEY);
      },
      signUp: async (email, password) => {
        const result = await signUpWithPassword(email, password);
        if (result.session) {
          setSession(result.session);
          setIsOfflineMode(false);
          window.sessionStorage.removeItem(OFFLINE_MODE_KEY);
        }
        return { needsEmailConfirmation: !result.session };
      },
      signOut: async () => {
        await signOutCurrentSession(session);
        setSession(null);
        setIsOfflineMode(false);
        window.sessionStorage.removeItem(OFFLINE_MODE_KEY);
      },
      continueOffline: () => {
        window.sessionStorage.setItem(OFFLINE_MODE_KEY, 'true');
        setIsOfflineMode(true);
      }
    }),
    [isLoading, isOfflineMode, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
