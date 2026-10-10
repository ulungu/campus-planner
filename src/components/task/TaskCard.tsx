import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Task, STATUS_LABELS } from '../../types/task';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { fontSize, radius, spacing } from '../../theme/spacing';
import { formatDueDate, isOverdue } from '../../utils/task';
import PriorityBadge from './PriorityBadge';

interface TaskCardProps {
  task: Task;
  onPress: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function TaskCard({
  task,
  onPress,
  onToggleStatus,
  onRemove,
}: TaskCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isCompleted = task.status === 'completed';
  const overdue = isOverdue(task);

  return (
    <View style={[styles.card, isCompleted && styles.cardCompleted]}>
      <Pressable
        style={styles.checkbox}
        onPress={() => onToggleStatus(task.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted }}
      >
        {isCompleted ? <Text style={styles.checkboxMark}>✓</Text> : null}
      </Pressable>

      <Pressable style={styles.info} onPress={() => onPress(task.id)}>
        <Text
          style={[styles.title, isCompleted && styles.titleCompleted]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <Text style={styles.subject}>{task.subject}</Text>

        <View style={styles.metaRow}>
          <PriorityBadge priority={task.priority} />
          <Text style={styles.status}>{STATUS_LABELS[task.status]}</Text>
          {task.dueDate ? (
            <Text style={[styles.status, overdue && styles.overdue]}>
              {overdue ? 'Просрочено: ' : 'до '}
              {formatDueDate(task.dueDate)}
            </Text>
          ) : null}
        </View>
      </Pressable>

      <Pressable
        style={styles.deleteButton}
        onPress={() => onRemove(task.id)}
        hitSlop={spacing.sm}
        accessibilityRole="button"
        accessibilityLabel="Удалить задачу"
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.sm + spacing.xs,
      marginHorizontal: spacing.md,
      marginVertical: spacing.xs + spacing.xxs,
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    cardCompleted: {
      opacity: 0.55,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.textSecondary,
      marginRight: spacing.sm + spacing.xs,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxMark: {
      fontSize: fontSize.sm + 1,
      color: colors.success,
      fontWeight: 'bold',
    },
    info: {
      flex: 1,
    },
    title: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: colors.text,
    },
    titleCompleted: {
      textDecorationLine: 'line-through',
      color: colors.textSecondary,
    },
    subject: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing.xxs,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginTop: spacing.xs + spacing.xxs,
      gap: spacing.sm,
    },
    status: {
      fontSize: fontSize.xs + 1,
      color: colors.textSecondary,
    },
    overdue: {
      color: colors.danger,
      fontWeight: '600',
    },
    deleteButton: {
      paddingHorizontal: spacing.sm + spacing.xxs,
      paddingVertical: spacing.xs + spacing.xxs,
    },
    deleteButtonText: {
      fontSize: fontSize.lg,
      color: colors.danger,
      fontWeight: 'bold',
    },
  });
