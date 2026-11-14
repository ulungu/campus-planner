import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { Stack } from 'expo-router';
import TaskCard from '../../src/components/task/TaskCard';
import SwipeableTaskCard from '../../src/components/task/SwipeableTaskCard';
import UndoBar from '../../src/components/task/UndoBar';
import TaskProgressBar from '../../src/components/task/TaskProgressBar';
import StatusFilter from '../../src/components/task/StatusFilter';
import Screen from '../../src/components/ui/Screen';
import AppButton from '../../src/components/ui/AppButton';
import AppInput from '../../src/components/ui/AppInput';
import EmptyState from '../../src/components/ui/EmptyState';
import { useTasks } from '../../src/hooks/useTasks';
import { useTaskFilters } from '../../src/hooks/useTaskFilters';
import { UNDO_TIMEOUT, useRemoveWithUndo } from '../../src/hooks/useRemoveWithUndo';
import { useTheme } from '../../src/context/ThemeContext';
import { ThemeColors } from '../../src/theme/colors';
import { fontSize, spacing } from '../../src/theme/spacing';
import { openEditTask, openNewTask, openSettings, openTask } from '../../src/navigation/actions';

export default function TaskListScreen() {
  const { tasks, lastCreatedId, clearLastCreated, toggleTaskStatus } = useTasks();
  // Удаление теперь только с подтверждением и с возможностью отмены (ЛР №5)
  const { lastRemoved, confirmRemove, undo } = useRemoveWithUndo();
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
          // Свайп вправо — сменить статус, влево — удалить с подтверждением
          <SwipeableTaskCard
            task={item}
            onSwipeRight={toggleTaskStatus}
            onSwipeLeft={confirmRemove}
          >
            <TaskCard
              task={item}
              highlighted={item.id === lastCreatedId}
              onHighlightShown={clearLastCreated}
              onPress={openTask}
              onToggleStatus={toggleTaskStatus}
              onEdit={openEditTask}
              onRemove={confirmRemove}
            />
          </SwipeableTaskCard>
        )}
        ListEmptyComponent={emptyState}
        contentContainerStyle={
          visibleTasks.length === 0 ? styles.emptyListContent : styles.listContent
        }
      />

      {lastRemoved ? (
        <UndoBar
          key={lastRemoved.key}
          title={lastRemoved.task.title}
          duration={UNDO_TIMEOUT}
          onUndo={undo}
        />
      ) : null}
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
    // Запас снизу, чтобы плашка «Отменить» не закрывала последнюю карточку
    listContent: {
      paddingBottom: spacing.xl * 2,
    },
  });
