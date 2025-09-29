import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthSession, clearSession, getSession, saveSession } from '../../storage/mmkvPersister';


type AuthContextType = {
  session: AuthSession | null;
  loading: boolean;
  signIn: (s: AuthSession) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
});

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Runs on cold start / refresh. Reads MMKV and restores session.
  useEffect(() => {
    const boot = () => {
      const s = getSession();
      if (s?.accessToken) setSession(s);
      setLoading(false);
    };
    boot();
  }, []);

  const value = useMemo(
    () => ({
      session,
      loading,
      signIn: (s: AuthSession) => {
        saveSession(s);
        setSession(s);
      },
      signOut: () => {
        clearSession();
        setSession(null);
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
