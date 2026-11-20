import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient, useRefetchOnAppFocus } from '../src/api/queryClient';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { LOADING_COLORS } from '../src/theme/colors';
import { AuthProvider } from '../src/auth/AuthContext';
import { useAuth } from '../src/hooks/useAuth';

function RootStack() {
  const { theme, colors, isLoading: isThemeLoading } = useTheme();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Пока тема читается из AsyncStorage, а сессия проверяется через /auth/me,
  // навигатор не рендерится — значит, никаких перенаправлений до конца проверки
  if (isThemeLoading || isAuthLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={LOADING_COLORS.indicator} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>

        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)/login" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useRefetchOnAppFocus();

  return (
    // Корневой контейнер жестов: без него GestureDetector внутри экранов не работает
    <GestureHandlerRootView style={styles.root}>
      {/* QueryClient создан один раз в модуле src/api/queryClient.ts */}
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <RootStack />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LOADING_COLORS.background,
  },
});
