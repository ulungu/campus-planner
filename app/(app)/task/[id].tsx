import React, { useMemo } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Screen from '../../../src/components/ui/Screen';
import AppButton from '../../../src/components/ui/AppButton';
import EmptyState from '../../../src/components/ui/EmptyState';
import PriorityBadge from '../../../src/components/task/PriorityBadge';
import { getErrorMessage, isNotFound, isUnauthorized } from '../../../src/api/client';
import { useTaskQuery } from '../../../src/features/tasks/useTasksQuery';
import { useDeleteTask, useToggleTaskStatus } from '../../../src/features/tasks/useTaskMutations';
import { useTheme } from '../../../src/context/ThemeContext';
import { ThemeColors } from '../../../src/theme/colors';
import { fontSize, radius, spacing } from '../../../src/theme/spacing';
import { STATUS_LABELS } from '../../../src/types/task';
import { TaskRouteParams } from '../../../src/types/navigation';
import { formatDueDate, isOverdue } from '../../../src/utils/task';
import { goBackOrHome, openEditTask } from '../../../src/navigation/actions';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<TaskRouteParams>();
  const taskQuery = useTaskQuery(id);
  const { toggle, pendingIds: togglingIds } = useToggleTaskStatus();
  const deleteMutation = useDeleteTask();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const notFound = (
    <Screen>
      <EmptyState
        title="Задача не найдена"
        description="Возможно, она уже удалена"
        actionLabel="К списку задач"
        onAction={goBackOrHome}
      />
    </Screen>
  );

  if (!id) return notFound;

  if (taskQuery.isPending) {
    return (
      <Screen centered>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  if (taskQuery.isError && !taskQuery.data) {
    // 404 — записи нет или она чужая; остальное — ошибка запроса с повтором
    if (isNotFound(taskQuery.error)) return notFound;
    return (
      <Screen>
        <EmptyState
          icon="⚠️"
          title="Не удалось загрузить задачу"
          description={getErrorMessage(taskQuery.error)}
          actionLabel={taskQuery.isFetching ? 'Загрузка…' : 'Повторить'}
          onAction={() => void taskQuery.refetch()}
        />
      </Screen>
    );
  }

  const task = taskQuery.data;
  if (!task) return notFound;

  const overdue = isOverdue(task);
  const isToggling = togglingIds.includes(task.id);
  const isDeleting = deleteMutation.isPending;
  const isBusy = isToggling || isDeleting;

  const handleDelete = () => {
    Alert.alert('Удалить задачу?', `«${task.title}» будет удалена.`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () =>
          deleteMutation.mutate(task.id, {
            onSuccess: goBackOrHome,
            onError: (error) => {
              if (!isUnauthorized(error)) {
                Alert.alert('Не удалось удалить задачу', getErrorMessage(error));
              }
            },
          }),
      },
    ]);
  };

  return (
    <Screen scroll padding="md">
      <View style={styles.card}>
        <Text style={styles.label}>Название</Text>
        <Text style={styles.title}>{task.title}</Text>

        <Text style={styles.label}>Предмет</Text>
        <Text style={styles.value}>{task.subject}</Text>

        <Text style={styles.label}>Приоритет</Text>
        <PriorityBadge priority={task.priority} size="md" />

        <Text style={styles.label}>Статус</Text>
        <Text style={styles.value}>{STATUS_LABELS[task.status]}</Text>

        <Text style={styles.label}>Срок</Text>
        <Text style={[styles.value, overdue && styles.overdue]}>
          {task.dueDate ? formatDueDate(task.dueDate) : 'Не указан'}
          {overdue ? ' (просрочено)' : ''}
        </Text>
      </View>

      <AppButton
        title={
          isToggling
            ? 'Сохранение…'
            : task.status === 'completed'
              ? 'Вернуть в работу'
              : 'Отметить выполненной'
        }
        variant="secondary"
        onPress={() => toggle(task)}
        disabled={isBusy}
        style={styles.firstButton}
      />
      <AppButton
        title="Редактировать"
        onPress={() => openEditTask(task.id)}
        disabled={isBusy}
        style={styles.nextButton}
      />
      <AppButton
        title={isDeleting ? 'Удаление…' : 'Удалить'}
        variant="ghost"
        onPress={handleDelete}
        disabled={isBusy}
        style={styles.nextButton}
      />
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.md,
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    label: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing.sm + spacing.xs,
      marginBottom: spacing.xs,
    },
    title: {
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: colors.text,
    },
    value: {
      fontSize: fontSize.lg,
      color: colors.text,
    },
    overdue: {
      color: colors.danger,
      fontWeight: '600',
    },
    firstButton: {
      marginTop: spacing.md,
    },
    nextButton: {
      marginTop: spacing.sm + spacing.xxs,
    },
  });
