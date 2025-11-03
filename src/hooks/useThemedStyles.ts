// src/hooks/useThemedStyles.ts

import { useTheme } from '../context/ThemeContext';
import { lightColors, darkColors } from '../theme/colors';

export const useThemedColors = () => {
  const { theme } = useTheme();
  return theme === 'dark' ? darkColors : lightColors;
};
