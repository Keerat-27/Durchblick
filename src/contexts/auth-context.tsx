import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { PublicUser } from '@/api/auth-api';
import {
  getStoredAccessToken,
  loginRequest,
  logoutRequest,
  meRequest,
  refreshRequest,
  registerRequest,
  setStoredAccessToken,
} from '@/api/auth-api';

type AuthStatus = 'loading' | 'ready';

type AuthContextValue = {
  user: PublicUser | null;
  accessToken: string | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    getStoredAccessToken()
  );
  const [status, setStatus] = useState<AuthStatus>('loading');

  const bootstrap = useCallback(async () => {
    setStatus('loading');
    const token = getStoredAccessToken();

    async function loadUser(t: string) {
      const u = await meRequest(t);
      setUser(u);
      setAccessToken(t);
      setStoredAccessToken(t);
    }

    try {
      if (token) {
        try {
          await loadUser(token);
          setStatus('ready');
          return;
        } catch {
          /* fall through to refresh */
        }
      }
      const refreshed = await refreshRequest();
      setStoredAccessToken(refreshed.accessToken);
      setUser(refreshed.user);
      setAccessToken(refreshed.accessToken);
    } catch {
      setUser(null);
      setAccessToken(null);
      setStoredAccessToken(null);
    } finally {
      setStatus('ready');
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    setStoredAccessToken(data.accessToken);
    setUser(data.user);
    setAccessToken(data.accessToken);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const data = await registerRequest(email, password);
    setStoredAccessToken(data.accessToken);
    setUser(data.user);
    setAccessToken(data.accessToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setStoredAccessToken(null);
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      status,
      login,
      register,
      logout,
    }),
    [user, accessToken, status, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with AuthProvider
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
