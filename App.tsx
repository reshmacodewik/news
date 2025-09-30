import "react-native-gesture-handler";
import React from "react";
import { StatusBar, useColorScheme, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ApplicationNavigator from "./src/Navigators/Index";
import { AuthProvider } from "./src/Screens/Auth/AuthContext";
 // <-- import AuthProvider

const queryClient = new QueryClient();

function App() {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider> {/* <-- Wrap the whole app */}
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <ApplicationNavigator />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
