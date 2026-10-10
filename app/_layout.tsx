import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { LOADING_COLORS } from '../src/theme/colors';
import { TasksProvider } from '../src/context/TasksContext';

function RootStack() {
  const { theme, colors, isLoading } = useTheme();

  if (isLoading) {
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
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Campus Planner' }} />
        <Stack.Screen name="task/new" options={{ title: 'Новая задача' }} />
        <Stack.Screen name="task/[id]" options={{ title: 'Задача' }} />
        <Stack.Screen
          name="task/edit/[id]"
          options={{ title: 'Редактирование' }}
        />
        <Stack.Screen name="settings" options={{ title: 'Настройки' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TasksProvider>
        <RootStack />
      </TasksProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LOADING_COLORS.background,
  },
});
