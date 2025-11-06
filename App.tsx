import 'react-native-gesture-handler';
import React from 'react';
import {
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import ApplicationNavigator from './src/Navigators/Index';
import { AuthProvider } from './src/Screens/Auth/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const queryClient = new QueryClient();

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width } = useWindowDimensions();
 const isTablet = width >= (Platform.OS === 'ios' ? 768 : 720);

  // Dynamically calculate max width (e.g., 90% of total width on tablets)
  const dynamicMaxWidth = isTablet ? Math.min(width * 1.1, 1200) : width;

  return (
    <View style={styles.appRoot}>
      <View
        style={[
          styles.appContent,
          isTablet && { maxWidth: dynamicMaxWidth, alignSelf: 'center' },
        ]}
      >
        {children}
      </View>
    </View>
  );
};
// ----------------------------------------------------------------

const AppContent = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AppShell>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#000' : '#fff'}
      />
      <ApplicationNavigator />
      <Toast />
    </AppShell>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appRoot: { flex: 1, alignItems: 'center' },
  appContent: { flex: 1, width: '100%' },
});
