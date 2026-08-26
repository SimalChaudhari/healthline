import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_KEY } from '../config/storageKeys';
import { PASSWORD_MIN, PASSWORD_MAX } from '../utils/validation';

const AuthContext = createContext(null);

/** Demo-only — not cryptographic. Local UI auth until a real backend exists. */
function demoHash(password) {
  let h = 0;
  const s = String(password || '');
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `h${h.toString(16)}`;
}

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

const EMPTY = { session: null, accounts: {} };

export function AuthProvider({ children }) {
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState(null);
  const [accounts, setAccounts] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(AUTH_KEY);
        if (cancelled) return;
        if (raw) {
          const saved = JSON.parse(raw);
          setAccounts(saved.accounts && typeof saved.accounts === 'object' ? saved.accounts : {});
          setSession(saved.session || null);
        }
      } catch {
        // defaults
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (nextSession, nextAccounts) => {
    const payload = {
      session: nextSession,
      accounts: nextAccounts,
    };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(payload));
  }, []);

  const signUp = useCallback(
    async ({ email, password, firstName, lastName }) => {
      const key = normalizeEmail(email);
      if (!key || !key.includes('@')) {
        return { ok: false, error: 'Enter a valid email address.' };
      }
      if (!password || String(password).length < PASSWORD_MIN) {
        return { ok: false, error: `Password must be at least ${PASSWORD_MIN} characters.` };
      }
      if (String(password).length > PASSWORD_MAX) {
        return { ok: false, error: `Password must be at most ${PASSWORD_MAX} characters.` };
      }
      if (accounts[key]) {
        return { ok: false, error: 'An account with this email already exists.' };
      }
      const user = {
        id: `u-${Date.now()}`,
        email: key,
        firstName: String(firstName || '').trim(),
        lastName: String(lastName || '').trim(),
        createdAt: new Date().toISOString(),
      };
      const nextAccounts = {
        ...accounts,
        [key]: {
          ...user,
          passwordHash: demoHash(password),
        },
      };
      const nextSession = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
      setAccounts(nextAccounts);
      setSession(nextSession);
      await persist(nextSession, nextAccounts);
      return { ok: true, user: nextSession };
    },
    [accounts, persist],
  );

  const signIn = useCallback(
    async ({ email, password }) => {
      const key = normalizeEmail(email);
      const account = accounts[key];
      if (!account) {
        return { ok: false, error: 'No account found for that email.' };
      }
      const pwd = String(password || '');
      if (pwd.length < PASSWORD_MIN) {
        return { ok: false, error: `Password must be at least ${PASSWORD_MIN} characters.` };
      }
      if (pwd.length > PASSWORD_MAX) {
        return { ok: false, error: `Password must be at most ${PASSWORD_MAX} characters.` };
      }
      if (account.passwordHash !== demoHash(password)) {
        return { ok: false, error: 'Incorrect password.' };
      }
      const nextSession = {
        id: account.id,
        email: account.email,
        firstName: account.firstName || '',
        lastName: account.lastName || '',
      };
      setSession(nextSession);
      await persist(nextSession, accounts);
      return { ok: true, user: nextSession };
    },
    [accounts, persist],
  );

  const signOut = useCallback(async () => {
    setSession(null);
    await persist(null, accounts);
  }, [accounts, persist]);

  const requestPasswordReset = useCallback(async ({ email }) => {
    const key = normalizeEmail(email);
    if (!key || !key.includes('@')) {
      return { ok: false, error: 'Enter a valid email address.' };
    }
    // Demo: always succeed if format is valid (no email sent).
    return { ok: true };
  }, []);

  const clearAuthForTesting = useCallback(async () => {
    setSession(null);
    setAccounts({});
    await AsyncStorage.removeItem(AUTH_KEY);
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      user: session,
      isSignedIn: !!session,
      signUp,
      signIn,
      signOut,
      requestPasswordReset,
      clearAuthForTesting,
    }),
    [hydrated, session, signUp, signIn, signOut, requestPasswordReset, clearAuthForTesting],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
