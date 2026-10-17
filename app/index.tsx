import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { Stack } from 'expo-router';
import TaskCard from '../src/components/task/TaskCard';
import TaskProgressBar from '../src/components/task/TaskProgressBar';
import StatusFilter from '../src/components/task/StatusFilter';
import Screen from '../src/components/ui/Screen';
import AppButton from '../src/components/ui/AppButton';
import AppInput from '../src/components/ui/AppInput';
import EmptyState from '../src/components/ui/EmptyState';
import { useTasks } from '../src/hooks/useTasks';
import { useTaskFilters } from '../src/hooks/useTaskFilters';
import { useTheme } from '../src/context/ThemeContext';
import { ThemeColors } from '../src/theme/colors';
import { fontSize, spacing } from '../src/theme/spacing';
import { openEditTask, openNewTask, openSettings, openTask } from '../src/navigation/actions';

export default function TaskListScreen() {
  const { tasks, lastCreatedId, clearLastCreated, toggleTaskStatus, removeTask } =
    useTasks();
  const { status, setStatus, query, setQuery, visibleTasks, counts, isSearching } =
    useTaskFilters(tasks);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const emptyState = isSearching ? (
    <EmptyState
      icon="🔍"
      title="Ничего не найдено"
      description={`По запросу «${query.trim()}» задач нет`}
      actionLabel="Сбросить поиск"
      onAction={() => setQuery('')}
    />
  ) : (
    <EmptyState icon="📋" title="Список пока пуст" />
  );

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={openSettings}>
              <Text style={styles.headerLink}>Настройки</Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.header}>
        <TaskProgressBar completed={counts.completed} total={counts.total} />
        <AppInput
          value={query}
          onChangeText={setQuery}
          placeholder="Поиск по названию или предмету"
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
      </View>

      <StatusFilter value={status} onChange={setStatus} />

      <AppButton
        title="+ Добавить задачу"
        onPress={openNewTask}
        style={styles.addButton}
      />

      <Animated.FlatList
        data={visibleTasks}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        // Соседние карточки плавно сдвигаются, когда задача появляется, удаляется или раскрывается
        itemLayoutAnimation={LinearTransition}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            highlighted={item.id === lastCreatedId}
            onHighlightShown={clearLastCreated}
            onPress={openTask}
            onToggleStatus={toggleTaskStatus}
            onEdit={openEditTask}
            onRemove={removeTask}
          />
        )}
        ListEmptyComponent={emptyState}
        contentContainerStyle={
          visibleTasks.length === 0 ? styles.emptyListContent : undefined
        }
      />
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    headerLink: {
      color: colors.primary,
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm + spacing.xs,
      paddingBottom: spacing.sm,
    },
    addButton: {
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    emptyListContent: {
      flexGrow: 1,
    },
  });
