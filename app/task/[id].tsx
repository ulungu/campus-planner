import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Screen from '../../src/components/ui/Screen';
import AppButton from '../../src/components/ui/AppButton';
import EmptyState from '../../src/components/ui/EmptyState';
import PriorityBadge from '../../src/components/task/PriorityBadge';
import { useTasks } from '../../src/hooks/useTasks';
import { useTheme } from '../../src/context/ThemeContext';
import { ThemeColors } from '../../src/theme/colors';
import { fontSize, radius, spacing } from '../../src/theme/spacing';
import { STATUS_LABELS } from '../../src/types/task';
import { TaskRouteParams } from '../../src/types/navigation';
import { formatDueDate, isOverdue } from '../../src/utils/task';
import { goBackOrHome, openEditTask } from '../../src/navigation/actions';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<TaskRouteParams>();
  const { getTaskById, toggleTaskStatus } = useTasks();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const task = id ? getTaskById(id) : undefined;

  if (!task) {
    return (
      <Screen>
        <EmptyState
          title="Задача не найдена"
          actionLabel="К списку задач"
          onAction={goBackOrHome}
        />
      </Screen>
    );
  }

  const overdue = isOverdue(task);

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
        title={task.status === 'completed' ? 'Вернуть в работу' : 'Отметить выполненной'}
        variant="secondary"
        onPress={() => toggleTaskStatus(task.id)}
        style={styles.firstButton}
      />
      <AppButton
        title="Редактировать"
        onPress={() => openEditTask(task.id)}
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
