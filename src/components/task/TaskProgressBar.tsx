import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { fontSize, radius, spacing } from '../../theme/spacing';

interface TaskProgressBarProps {
  completed: number;
  total: number;
}

export default function TaskProgressBar({ completed, total }: TaskProgressBarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Нет задач — прогресс 0; значение всегда в диапазоне от 0 до 1
  const ratio = total === 0 ? 0 : Math.min(Math.max(completed / total, 0), 1);
  const progress = useSharedValue(ratio);

  useEffect(() => {
    progress.value = withTiming(ratio, { duration: 400 });
  }, [ratio, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100], Extrapolation.CLAMP)}%`,
    // Когда всё выполнено, полоса становится зелёной
    backgroundColor: interpolateColor(
      progress.value,
      [0.99, 1],
      [colors.primary, colors.success]
    ),
  }));

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: completed }}
    >
      <Text style={styles.title}>Прогресс</Text>
      <Text style={styles.label}>
        Выполнено {completed} из {total} · {Math.round(ratio * 100)}%
      </Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.xs,
    },
    title: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xxs,
    },
    label: {
      fontSize: fontSize.sm + 1,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    track: {
      height: 8,
      borderRadius: radius.sm,
      backgroundColor: colors.track,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: radius.sm,
    },
  });
