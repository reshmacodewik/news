import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthSession = {
  accessToken: string;
  user: any;
};

type AuthContextType = {
  session: AuthSession | null;
  signIn: (session: AuthSession) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  signIn: () => {},
  signOut: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session from AsyncStorage
  useEffect(() => {
    const loadSession = async () => {
      try {
        const saved = await AsyncStorage.getItem('userSession');
        if (saved) {
          setSession(JSON.parse(saved));
        }
      } catch (e) {
        console.log('Failed to load session:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const signIn = async (newSession: AuthSession) => {
    setSession(newSession);
    await AsyncStorage.setItem('userSession', JSON.stringify(newSession));
  };

  const signOut = async () => {
    setSession(null);
    await AsyncStorage.removeItem('userSession');
  };

  return (
    <AuthContext.Provider value={{ session, signIn, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
