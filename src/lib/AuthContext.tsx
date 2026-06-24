import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth, type AuthUser } from './api';

interface AuthContextValue {
  user: AuthUser | null;
  checking: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('nyai_access_token') ?? localStorage.getItem('access_token') ?? '';
    if (!storedToken) { setChecking(false); return; }
    auth.me()
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const login = async (email: string, password: string) => {
    const user = await auth.login(email, password);
    setUser(user);
  };

  const logout = async () => {
    await auth.logout().catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, checking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
