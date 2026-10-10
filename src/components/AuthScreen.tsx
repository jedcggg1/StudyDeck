import React, { FormEvent, useState } from 'react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LogIn,
  ShieldCheck,
  UserPlus,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useTranslation } from '../i18n';

type AuthMode = 'signin' | 'signup';

interface AuthScreenProps {
  onContinueOffline?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onContinueOffline }) => {
  const { t } = useTranslation();
  const { isConfigured, signIn, signUp, continueOffline } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleContinueOffline = () => {
    continueOffline();
    onContinueOffline?.();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isConfigured) {
      setError(t('Add Supabase keys to enable account login, or continue in Offline Mode.'));
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError(t('Passwords do not match.'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        const result = await signUp(email.trim(), password);
        if (result.needsEmailConfirmation) {
          setSuccess(t('Account created. Check your email to confirm your account, then sign in.'));
          setMode('signin');
          setPassword('');
          setConfirmPassword('');
        }
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('Authentication failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSignIn = mode === 'signin';

  return (
    <main className="min-h-dvh bg-[var(--bg-page)] text-[var(--text-main)] flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md space-y-5">
        <section className="brutal-card bg-[var(--bg-card)] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-7">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1769FF] mb-2">
                StudyDeck
              </p>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {isSignIn ? t('Welcome back') : t('Create your account')}
              </h1>
              <p className="text-sm font-medium text-[var(--text-muted)] mt-2 leading-relaxed">
                {isSignIn ? t('Sign in to continue studying.') : t('Save your study progress securely.')}
              </p>
            </div>
            <div className="w-12 h-12 shrink-0 border-2 border-[var(--border-color)] bg-[#1769FF] text-white shadow-[3px_3px_0px_var(--shadow-color)] rounded flex items-center justify-center">
              {isSignIn ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
            </div>
          </div>

          {!isConfigured && (
            <div className="mb-5 p-3.5 border-2 border-[var(--border-color)] bg-[#FFF3BF] text-[#6B4F00] rounded space-y-1.5">
              <div className="flex items-center gap-2 font-black text-sm">
                <KeyRound className="w-4 h-4 shrink-0" />
                {t('Supabase setup is pending')}
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                {t('Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local later to enable Login.')}
              </p>
            </div>
          )}

          {error && (
            <div role="alert" className="mb-5 p-3.5 border-2 border-red-700 bg-red-50 text-red-800 rounded flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs font-bold leading-relaxed">{error}</p>
            </div>
          )}

          {success && (
            <div role="status" className="mb-5 p-3.5 border-2 border-[#0B7A43] bg-[#EBFBEE] text-[#0B7A43] rounded flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs font-bold leading-relaxed">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="auth-email" className="block text-xs font-black uppercase tracking-wider mb-1.5">
                {t('Email address')}
              </label>
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="brutal-input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-black uppercase tracking-wider mb-1.5">
                {t('Password')}
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignIn ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="brutal-input pr-12"
                  placeholder={t('At least 6 characters')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded hover:bg-[var(--bg-subtle)] focus-visible:outline-2 focus-visible:outline-[#1769FF]"
                  aria-label={showPassword ? t('Hide password') : t('Show password')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isSignIn && (
              <div>
                <label htmlFor="auth-confirm-password" className="block text-xs font-black uppercase tracking-wider mb-1.5">
                  {t('Confirm password')}
                </label>
                <input
                  id="auth-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="brutal-input"
                  placeholder={t('Re-enter your password')}
                />
              </div>
            )}

            <button type="submit" disabled={isSubmitting || !email || !password} className="brutal-btn brutal-btn-primary w-full !py-3">
              {isSubmitting ? <LoaderCircle className="w-5 h-5 animate-spin" /> : isSignIn ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {isSubmitting ? t('Working...') : isSignIn ? t('Sign in') : t('Create account')}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6 text-xs font-black text-[var(--text-muted)] uppercase tracking-wider">
            <span className="h-px bg-[var(--border-color)] flex-1" />
            <span>{t('or')}</span>
            <span className="h-px bg-[var(--border-color)] flex-1" />
          </div>

          <button
            type="button"
            onClick={handleContinueOffline}
            className="brutal-btn w-full !py-3 bg-[var(--bg-card)]"
          >
            <WifiOff className="w-5 h-5" />
            {t('Continue in Offline Mode')}
          </button>

          <p className="text-center text-xs font-semibold text-[var(--text-muted)] mt-5">
            {isSignIn ? t('New to StudyDeck?') : t('Already have an account?')}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(isSignIn ? 'signup' : 'signin');
                setError(null);
                setSuccess(null);
              }}
              className="font-black text-[#1769FF] underline underline-offset-2 hover:text-[#0E56D8]"
            >
              {isSignIn ? t('Create an account') : t('Sign in instead')}
            </button>
          </p>
        </section>

        <p className="text-center text-[11px] font-semibold text-[var(--text-muted)] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          {t('Your local study data remains on this device.')}
        </p>
      </div>
    </main>
  );
};
