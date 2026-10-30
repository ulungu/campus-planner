import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { fontSize, radius, spacing } from '../../theme/spacing';

interface UndoBarProps {
  title: string;
  // За это время полоска внизу плашки сжимается до нуля
  duration: number;
  onUndo: () => void;
}

// Плашка «Задача удалена · Отменить». Скрывает её родитель: когда компонент
// убирается из дерева, срабатывает exiting-анимация
export default function UndoBar({ title, duration, onUndo }: UndoBarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const progress = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(0, { duration, easing: Easing.linear });
  }, [duration, progress]);

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      exiting={FadeOutDown.duration(300)}
      style={styles.bar}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.row}>
        <Text style={styles.text} numberOfLines={1}>
          Удалено: {title}
        </Text>
        <Pressable onPress={onUndo} hitSlop={spacing.sm} accessibilityRole="button">
          <Text style={styles.undo}>Отменить</Text>
        </Pressable>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.progress, progressStyle]} />
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    bar: {
      position: 'absolute',
      left: spacing.md,
      right: spacing.md,
      bottom: spacing.md,
      backgroundColor: colors.text,
      borderRadius: radius.lg,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + spacing.xs,
      gap: spacing.md,
    },
    text: {
      flex: 1,
      fontSize: fontSize.md,
      color: colors.background,
    },
    undo: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.primary,
    },
    track: {
      height: 3,
    },
    progress: {
      flex: 1,
      backgroundColor: colors.primary,
      // scaleX сжимает полоску к левому краю
      transformOrigin: 'left',
    },
  });
