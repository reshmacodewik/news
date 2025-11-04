import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme/colors';

interface ThemeColors {
  background: string;
  text: string;
  tabtext: string;
  card: string;
  headingtext: string;
  // Add all color properties matching your color files
}

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const THEME_KEY = '@app_theme';

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: lightColors,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>('light');
  const [loading, setLoading] = useState(true);

  // 🔹 Load saved theme from AsyncStorage (if available)
  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setTheme(storedTheme);
        } else {
          // fallback to system theme
          setTheme(systemScheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        console.warn('Failed to load theme from storage:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStoredTheme();
  }, [systemScheme]);

  // 🔹 Save theme to AsyncStorage when changed
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(THEME_KEY, theme).catch(err =>
        console.warn('Failed to save theme:', err)
      );
    }
  }, [theme, loading]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  const value = useMemo(() => ({ theme, colors, toggleTheme }), [theme, colors]);

  // Optional: while loading, you could show a blank screen or loader
  if (loading) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
