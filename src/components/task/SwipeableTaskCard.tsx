import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  FadeInDown,
  FadeOutLeft,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Task } from '../../types/task';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { fontSize, radius, spacing } from '../../theme/spacing';

// Насколько нужно сдвинуть карточку, чтобы действие сработало
export const SWIPE_ACTION_THRESHOLD = 96;
// Дальше этого карточка не уезжает, сколько бы палец ни тянул
export const SWIPE_MAX_OFFSET = 140;
// Жест начинается только после явного горизонтального движения:
// короткое смещение остаётся нажатием, вертикальное — прокруткой списка
const ACTIVATION_OFFSET_X = 12;
const FAIL_OFFSET_Y = 10;

const RETURN_SPRING = { damping: 18, stiffness: 220 };

interface SwipeableTaskCardProps {
  task: Task;
  // Свайп вправо дальше порога: переключить статус
  onSwipeRight: (id: string) => void;
  // Свайп влево дальше порога: запросить подтверждение удаления
  onSwipeLeft: (id: string) => void;
  children: React.ReactNode;
}

export default function SwipeableTaskCard({
  task,
  onSwipeRight,
  onSwipeLeft,
  children,
}: SwipeableTaskCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const translateX = useSharedValue(0);
  const id = task.id;
  const isCompleted = task.status === 'completed';

  const [labelCompleted, setLabelCompleted] = useState(isCompleted);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-ACTIVATION_OFFSET_X, ACTIVATION_OFFSET_X])
        .failOffsetY([-FAIL_OFFSET_Y, FAIL_OFFSET_Y])
        .onStart(() => {
          runOnJS(setLabelCompleted)(isCompleted);
        })
        .onUpdate((event) => {
          // Ограничиваем смещение в обе стороны
          translateX.value = Math.min(
            Math.max(event.translationX, -SWIPE_MAX_OFFSET),
            SWIPE_MAX_OFFSET
          );
        })
        .onEnd((_event, success) => {
          if (!success) return;
          if (translateX.value >= SWIPE_ACTION_THRESHOLD) {
            runOnJS(onSwipeRight)(id);
          } else if (translateX.value <= -SWIPE_ACTION_THRESHOLD) {
            runOnJS(onSwipeLeft)(id);
          }
        })
        .onFinalize(() => {
          translateX.value = withSpring(0, RETURN_SPRING);
        }),
    [id, isCompleted, onSwipeRight, onSwipeLeft, translateX]
  );

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Область «Выполнить» слева проявляется по мере свайпа вправо
  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_ACTION_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  // Область «Удалить» справа проявляется по мере свайпа влево
  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_ACTION_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  // Иконка «подпрыгивает», когда порог достигнут: видно, что отпускать уже можно
  const rightIconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [0, SWIPE_ACTION_THRESHOLD * 0.8, SWIPE_ACTION_THRESHOLD],
          [0.6, 0.9, 1.25],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const leftIconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [-SWIPE_ACTION_THRESHOLD, -SWIPE_ACTION_THRESHOLD * 0.8, 0],
          [1.25, 0.9, 0.6],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutLeft.duration(250)}
      style={styles.container}
    >
      {/* Фоновые области действий лежат под карточкой */}
      <Animated.View
        style={[styles.action, styles.completeAction, rightActionStyle]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Animated.Text style={[styles.actionIcon, rightIconStyle]}>
          {labelCompleted ? '↺' : '✓'}
        </Animated.Text>
        <Animated.Text style={styles.actionText}>
          {labelCompleted ? 'Вернуть' : 'Выполнить'}
        </Animated.Text>
      </Animated.View>

      <Animated.View
        style={[styles.action, styles.removeAction, leftActionStyle]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Animated.Text style={styles.actionText}>Удалить</Animated.Text>
        <Animated.Text style={[styles.actionIcon, leftIconStyle]}>🗑</Animated.Text>
      </Animated.View>

      <GestureDetector gesture={pan}>
        {/* Непрозрачная подложка: выполненная карточка полупрозрачна (ЛР №4),
            и без подложки сквозь неё просвечивали бы области действий */}
        <Animated.View style={[styles.plate, cardStyle]}>{children}</Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginHorizontal: spacing.md,
      marginVertical: spacing.xs + spacing.xxs,
    },
    action: {
      ...StyleSheet.absoluteFill,
      borderRadius: radius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    completeAction: {
      backgroundColor: colors.success,
      justifyContent: 'flex-start',
    },
    removeAction: {
      backgroundColor: colors.danger,
      justifyContent: 'flex-end',
    },
    actionIcon: {
      fontSize: fontSize.xl,
      color: colors.onPrimary,
      fontWeight: 'bold',
    },
    actionText: {
      fontSize: fontSize.md,
      color: colors.onPrimary,
      fontWeight: '600',
    },
    plate: {
      backgroundColor: colors.background,
      borderRadius: radius.lg,
    },
  });
