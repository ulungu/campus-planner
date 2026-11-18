import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
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
import { getErrorMessage } from '../../src/api/client';
import { useTasksQuery } from '../../src/features/tasks/useTasksQuery';
import { useToggleTaskStatus } from '../../src/features/tasks/useTaskMutations';
import { useTasksUi } from '../../src/hooks/useTasksUi';
import { useTaskSearch } from '../../src/hooks/useTaskSearch';
import { UNDO_TIMEOUT, useRemoveWithUndo } from '../../src/hooks/useRemoveWithUndo';
import { useTheme } from '../../src/context/ThemeContext';
import { ThemeColors } from '../../src/theme/colors';
import { fontSize, radius, spacing } from '../../src/theme/spacing';
import { Task, TaskStatusFilter } from '../../src/types/task';
import { countTasks } from '../../src/utils/task';
import { openEditTask, openNewTask, openSettings, openTask } from '../../src/navigation/actions';

const NO_TASKS: Task[] = [];

const EMPTY_TITLES: Record<TaskStatusFilter, string> = {
  all: 'Список пока пуст',
  active: 'Нет активных задач',
  completed: 'Нет выполненных задач',
};

export default function TaskListScreen() {
  const { statusFilter, setStatusFilter, lastCreatedId, clearLastCreated } = useTasksUi();
  // Список с серверным фильтром и полный список для прогресса.
  // При фильтре «Все» это одна и та же запись кэша и один запрос
  const listQuery = useTasksQuery(statusFilter);
  const allQuery = useTasksQuery('all');
  const tasks = listQuery.data ?? NO_TASKS;

  const { query, setQuery, visibleTasks, isSearching } = useTaskSearch(tasks);
  const counts = useMemo(() => countTasks(allQuery.data ?? NO_TASKS), [allQuery.data]);

  const { toggle, pendingIds: togglingIds } = useToggleTaskStatus();
  const { lastRemoved, confirmRemove, undo, removingIds } = useRemoveWithUndo(tasks);

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Спиннер RefreshControl — только для жеста пользователя,
  // фоновые обновления после мутаций его не включают
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const { refetch: refetchList } = listQuery;
  const { refetch: refetchAll } = allQuery;
  const handleRefresh = useCallback(async () => {
    setIsPullRefreshing(true);
    try {
      await Promise.all([refetchList(), statusFilter === 'all' ? null : refetchAll()]);
    } finally {
      setIsPullRefreshing(false);
    }
  }, [refetchList, refetchAll, statusFilter]);

  const busyLabel = (id: string) => {
    if (removingIds.includes(id)) return 'Удаление…';
    if (togglingIds.includes(id)) return 'Сохранение…';
    return null;
  };

  const handleToggle = (id: string) => {
    if (busyLabel(id)) return;
    const task = tasks.find((item) => item.id === id);
    if (task) toggle(task);
  };

  const handleRemove = (id: string) => {
    if (busyLabel(id)) return;
    confirmRemove(id);
  };

  const header = (
    <Stack.Screen
      options={{
        headerRight: () => (
          <Pressable onPress={openSettings}>
            <Text style={styles.headerLink}>Настройки</Text>
          </Pressable>
        ),
      }}
    />
  );

  // Первая загрузка
  if (listQuery.isPending) {
    return (
      <Screen centered>
        {header}
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Загрузка задач…</Text>
      </Screen>
    );
  }

  // Ошибка, а показать нечего: сообщение и повтор. Выхода здесь нет —
  // при 401 сессию завершает QueryCache, остальные ошибки только показываются
  if (listQuery.isError && !listQuery.data) {
    return (
      <Screen>
        {header}
        <EmptyState
          icon="⚠️"
          title="Не удалось загрузить задачи"
          description={getErrorMessage(listQuery.error)}
          actionLabel={listQuery.isFetching ? 'Загрузка…' : 'Повторить'}
          onAction={() => void refetchList()}
        />
      </Screen>
    );
  }

  const emptyState = isSearching ? (
    <EmptyState
      icon="🔍"
      title="Ничего не найдено"
      description={`По запросу «${query.trim()}» задач нет`}
      actionLabel="Сбросить поиск"
      onAction={() => setQuery('')}
    />
  ) : (
    <EmptyState
      icon="📋"
      title={EMPTY_TITLES[statusFilter]}
      description="Потяните вниз, чтобы обновить"
    />
  );

  // Обновление не удалось, но старые данные есть: оставляем их и показываем плашку
  const refreshError =
    listQuery.isError && !listQuery.isFetching ? (
      <Pressable style={styles.errorBanner} onPress={() => void refetchList()}>
        <Text style={styles.errorBannerText}>
          Не удалось обновить: {getErrorMessage(listQuery.error)} Нажмите, чтобы повторить.
        </Text>
      </Pressable>
    ) : null;

  return (
    <Screen>
      {header}

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

      <StatusFilter value={statusFilter} onChange={setStatusFilter} />

      <AppButton
        title="+ Добавить задачу"
        onPress={openNewTask}
        style={styles.addButton}
      />

      {refreshError}

      <Animated.FlatList
        data={visibleTasks}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        // Соседние карточки плавно сдвигаются, когда задача появляется, удаляется или раскрывается
        itemLayoutAnimation={LinearTransition}
        refreshControl={
          <RefreshControl
            refreshing={isPullRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          // Свайп вправо — сменить статус, влево — удалить с подтверждением
          <SwipeableTaskCard
            task={item}
            onSwipeRight={handleToggle}
            onSwipeLeft={handleRemove}
          >
            <TaskCard
              task={item}
              highlighted={item.id === lastCreatedId}
              onHighlightShown={clearLastCreated}
              onPress={openTask}
              onToggleStatus={handleToggle}
              onEdit={openEditTask}
              onRemove={handleRemove}
              busyLabel={busyLabel(item.id)}
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
          onUndo={() => void undo()}
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
    loadingText: {
      marginTop: spacing.sm,
      fontSize: fontSize.sm,
      color: colors.textSecondary,
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
    errorBanner: {
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    errorBannerText: {
      fontSize: fontSize.sm,
      color: colors.danger,
    },
    emptyListContent: {
      flexGrow: 1,
    },
    // Запас снизу, чтобы плашка «Отменить» не закрывала последнюю карточку
    listContent: {
      paddingBottom: spacing.xl * 2,
    },
  });
