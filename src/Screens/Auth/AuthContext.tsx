import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearSession, getSession, saveSession } from '../../storage/mmkvPersister';

// -------------- TYPES -----------------
export type User = {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role?: number;
  photo?: string;
};

export type AuthSession = {
  accessToken: string;
  user: User;
};

type AuthContextType = {
  session: AuthSession | null;
  loading: boolean;
  signIn: (s: AuthSession) => void;
  signOut: () => void;
};

// -------------- CONTEXT -----------------
const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
});

// -------------- PROVIDER -----------------
export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from storage
  useEffect(() => {
    const boot = async () => {
      const s = await getSession();
      if (s?.accessToken && s.user) {
        setSession(s);
      }
      setLoading(false);
    };
    boot();
  }, []);

  const value = useMemo(() => ({
    session,
    loading,
    signIn: (s: AuthSession) => {
      saveSession(s);
      setSession(s);
    },
    signOut: () => {
      clearSession();
      setSession(null);
    }
  }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// -------------- HOOK -----------------
export const useAuth = () => useContext(AuthContext);
