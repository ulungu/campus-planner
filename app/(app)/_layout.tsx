import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { TasksProvider } from '../../src/context/TasksContext';

// Защищённый раздел планировщика. Доступ к нему закрывает корневой layout
// (Stack.Protected), здесь — только навигация и данные задач.
// TasksProvider живёт внутри раздела: при выходе он размонтируется,
// и локальные задачи одного пользователя не увидит следующий
export default function AppLayout() {
  const { colors } = useTheme();

  return (
    <TasksProvider>
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
        <Stack.Screen name="task/edit/[id]" options={{ title: 'Редактирование' }} />
        <Stack.Screen name="settings" options={{ title: 'Настройки' }} />
      </Stack>
    </TasksProvider>
  );
}
