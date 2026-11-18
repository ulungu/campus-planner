import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  Extrapolation,
  LinearTransition,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Task, STATUS_LABELS } from '../../types/task';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { fontSize, radius, spacing } from '../../theme/spacing';
import { formatDueDate, isOverdue } from '../../utils/task';
import PriorityBadge from './PriorityBadge';

interface TaskCardProps {
  task: Task;
  // true для только что созданной задачи: карточка «подпрыгивает» и подсвечивается
  highlighted?: boolean;
  onHighlightShown?: () => void;
  onPress: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  // Для задачи выполняется запрос: текст «Сохранение…» / «Удаление…»
  // показывается вместо статуса, действия заблокированы
  busyLabel?: string | null;
}

const STATUS_DURATION = 250;
const EXPAND_DURATION = 200;
const HIGHLIGHT_DELAY = 300;

export default function TaskCard({
  task,
  highlighted = false,
  onHighlightShown,
  onPress,
  onToggleStatus,
  onEdit,
  onRemove,
  busyLabel = null,
}: TaskCardProps) {
  const isBusy = Boolean(busyLabel);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(false);
  const isCompleted = task.status === 'completed';
  const overdue = isOverdue(task);

  // 0 — задача активна, 1 — выполнена
  const statusProgress = useSharedValue(isCompleted ? 1 : 0);
  const iconProgress = useSharedValue(isCompleted ? 1 : 0);
  const chevronRotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const highlight = useSharedValue(0);

  useEffect(() => {
    statusProgress.value = withTiming(isCompleted ? 1 : 0, {
      duration: STATUS_DURATION,
    });
    iconProgress.value = withSpring(isCompleted ? 1 : 0, {
      damping: 10,
      stiffness: 220,
    });
  }, [isCompleted, statusProgress, iconProgress]);

  useEffect(() => {
    chevronRotation.value = withTiming(expanded ? 180 : 0, {
      duration: EXPAND_DURATION,
    });
  }, [expanded, chevronRotation]);

  useEffect(() => {
    if (!highlighted) return;
    scale.value = withDelay(
      HIGHLIGHT_DELAY,
      withSequence(
        withTiming(1.05, { duration: 150 }),
        withSpring(1, { damping: 8, stiffness: 180 })
      )
    );
    highlight.value = withDelay(
      HIGHLIGHT_DELAY,
      withSequence(
        withTiming(1, { duration: 150 }),
        withDelay(600, withTiming(0, { duration: 600 }))
      )
    );
    onHighlightShown?.();
  }, [highlighted, onHighlightShown, scale, highlight]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: 1 - statusProgress.value * 0.45,
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      highlight.value,
      [0, 1],
      [colors.card, colors.highlight]
    ),
  }));

  const checkboxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      statusProgress.value,
      [0, 1],
      ['transparent', colors.success]
    ),
    borderColor: interpolateColor(
      statusProgress.value,
      [0, 1],
      [colors.textSecondary, colors.success]
    ),
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    // Пружина может выйти за 1 и ниже 0 — для прозрачности значение ограничиваем
    opacity: interpolate(iconProgress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: Math.max(iconProgress.value, 0) }],
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  return (
    <Animated.View
      layout={LinearTransition.duration(EXPAND_DURATION)}
      style={[styles.card, cardStyle]}
    >
      <View style={styles.row}>
        <Pressable
          onPress={() => onToggleStatus(task.id)}
          disabled={isBusy}
          hitSlop={spacing.xs}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted, disabled: isBusy }}
        >
          <Animated.View style={[styles.checkbox, checkboxStyle]}>
            <Animated.Text style={[styles.checkboxMark, checkmarkStyle]}>
              ✓
            </Animated.Text>
          </Animated.View>
        </Pressable>

        <Pressable style={styles.info} onPress={() => onPress(task.id)}>
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          <View style={styles.metaRow}>
            <PriorityBadge priority={task.priority} />
            <Text style={styles.status}>
              {busyLabel ?? STATUS_LABELS[task.status]}
            </Text>
            <Pressable
              style={styles.moreButton}
              onPress={() => setExpanded((value) => !value)}
              hitSlop={spacing.xs}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
            >
              <Text style={styles.moreButtonText}>
                {expanded ? 'Скрыть' : 'Подробнее'}
              </Text>
              <Animated.Text style={[styles.moreButtonText, chevronStyle]}>
                ▾
              </Animated.Text>
            </Pressable>
          </View>
        </Pressable>

        <Pressable
          style={styles.iconButton}
          onPress={() => onRemove(task.id)}
          disabled={isBusy}
          hitSlop={spacing.xs}
          accessibilityRole="button"
          accessibilityLabel="Удалить задачу"
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </Pressable>
      </View>

      {expanded ? (
        <Animated.View
          entering={FadeIn.duration(EXPAND_DURATION)}
          exiting={FadeOut.duration(EXPAND_DURATION / 2)}
          style={styles.details}
        >
          <Text style={styles.detailsLabel}>Срок</Text>
          <Text style={[styles.detailsValue, overdue && styles.overdue]}>
            {task.dueDate ? formatDueDate(task.dueDate) : 'Не указан'}
            {overdue ? ' (просрочено)' : ''}
          </Text>

          <Text style={styles.detailsLabel}>Предмет</Text>
          <Text style={styles.detailsValue}>{task.subject}</Text>

          <View style={styles.actionsRow}>
            <Pressable onPress={() => onPress(task.id)} hitSlop={spacing.xs}>
              <Text style={styles.actionText}>Открыть</Text>
            </Pressable>
            <Pressable onPress={() => onEdit(task.id)} hitSlop={spacing.xs}>
              <Text style={styles.actionText}>Редактировать</Text>
            </Pressable>
            <Pressable
              onPress={() => onToggleStatus(task.id)}
              disabled={isBusy}
              hitSlop={spacing.xs}
            >
              <Text style={styles.actionText}>
                {isCompleted ? 'Вернуть в работу' : 'Выполнить'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.sm + spacing.xs,
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      marginRight: spacing.sm + spacing.xs,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxMark: {
      fontSize: fontSize.sm + 1,
      color: colors.onPrimary,
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
    iconButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs + spacing.xxs,
    },
    moreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
    },
    moreButtonText: {
      fontSize: fontSize.xs + 1,
      color: colors.primary,
      fontWeight: '600',
    },
    deleteButtonText: {
      fontSize: fontSize.lg,
      color: colors.danger,
      fontWeight: 'bold',
    },
    details: {
      marginTop: spacing.sm,
      paddingTop: spacing.xs,
      paddingLeft: 24 + spacing.sm + spacing.xs,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    detailsLabel: {
      fontSize: fontSize.xs + 1,
      color: colors.textSecondary,
      marginTop: spacing.xs + spacing.xxs,
    },
    detailsValue: {
      fontSize: fontSize.sm + 1,
      color: colors.text,
      marginTop: spacing.xxs,
    },
    actionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginTop: spacing.sm + spacing.xs,
    },
    actionText: {
      fontSize: fontSize.sm + 1,
      color: colors.primary,
      fontWeight: '600',
    },
  });
