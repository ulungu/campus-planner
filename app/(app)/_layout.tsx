import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { TasksUiProvider } from '../../src/context/TasksContext';

// Защищённый раздел планировщика. Доступ к нему закрывает корневой layout
// (Stack.Protected), здесь — только навигация и UI-состояние списка.
// Сами задачи приходят с сервера через TanStack Query; при выходе
// кэш очищается в signOut, а TasksUiProvider размонтируется вместе с разделом
export default function AppLayout() {
  const { colors } = useTheme();

  return (
    <TasksUiProvider>
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
    </TasksUiProvider>
  );
}
