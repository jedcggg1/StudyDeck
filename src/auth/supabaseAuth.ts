export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user: SupabaseUser;
}

interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user?: SupabaseUser;
  error?: string;
  error_description?: string;
  msg?: string;
  message?: string;
}

const SESSION_STORAGE_KEY = 'studydeck.supabase.session';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

function getErrorMessage(payload: AuthResponse, status: number): string {
  return (
    payload.error_description ||
    payload.msg ||
    payload.message ||
    payload.error ||
    `Supabase authentication failed (${status}).`
  );
}

async function request(path: string, options: RequestInit = {}): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }

  const response = await fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers: {
      apikey: supabaseKey,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const payload = (await response.json().catch(() => ({}))) as AuthResponse;
  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response.status));
  }

  return payload;
}

function toSession(payload: AuthResponse): SupabaseSession | null {
  if (!payload.access_token || !payload.refresh_token || !payload.user) {
    return null;
  }

  return {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    expires_in: payload.expires_in,
    expires_at: payload.expires_at,
    token_type: payload.token_type,
    user: payload.user
  };
}

export function readStoredSession(): SupabaseSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SupabaseSession) : null;
  } catch {
    return null;
  }
}

function writeStoredSession(session: SupabaseSession | null): void {
  if (session) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

async function refreshSession(refreshToken: string): Promise<SupabaseSession | null> {
  const payload = await request('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  return toSession(payload);
}

export async function getStoredOrRefreshedSession(): Promise<SupabaseSession | null> {
  if (!isSupabaseConfigured) return null;

  const stored = readStoredSession();
  if (!stored) return null;

  const expiresAt = stored.expires_at ? stored.expires_at * 1000 : 0;
  if (!expiresAt || expiresAt - Date.now() > 30_000) {
    return stored;
  }

  try {
    const refreshed = await refreshSession(stored.refresh_token);
    if (refreshed) writeStoredSession(refreshed);
    return refreshed;
  } catch {
    writeStoredSession(null);
    return null;
  }
}

export async function signInWithPassword(email: string, password: string): Promise<SupabaseSession> {
  const payload = await request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  const session = toSession(payload);
  if (!session) throw new Error('Supabase did not return a valid session.');
  writeStoredSession(session);
  return session;
}

export async function signUpWithPassword(
  email: string,
  password: string
): Promise<{ session: SupabaseSession | null; user: SupabaseUser | null }> {
  const payload = await request('/auth/v1/signup', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      options: { emailRedirectTo: window.location.origin }
    })
  });
  const session = toSession(payload);
  if (session) writeStoredSession(session);
  return { session, user: payload.user || session?.user || null };
}

export async function signOutCurrentSession(session: SupabaseSession | null): Promise<void> {
  try {
    if (session?.access_token && isSupabaseConfigured) {
      await request('/auth/v1/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
    }
  } finally {
    writeStoredSession(null);
  }
}
