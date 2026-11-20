import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { fontSize, radius, spacing } from '../../theme/spacing';

interface ChipGroupProps<T extends string> {
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
  // Подпись слева от чипов, например «Сортировка»
  caption?: string;
}

// Ряд чипов с одним выбранным значением: фильтр статуса, сортировка
export default function ChipGroup<T extends string>({
  options,
  labels,
  value,
  onChange,
  caption,
}: ChipGroupProps<T>) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      {options.map((option) => {
        const isActive = value === option;
        return (
          <Pressable
            key={option}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onChange(option)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {labels[option]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    caption: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    chip: {
      paddingVertical: spacing.xs + spacing.xxs,
      paddingHorizontal: spacing.sm + spacing.xs + spacing.xxs,
      borderRadius: radius.pill,
      backgroundColor: colors.chip,
    },
    chipActive: {
      backgroundColor: colors.primary,
    },
    chipText: {
      fontSize: fontSize.sm,
      color: colors.chipText,
    },
    chipTextActive: {
      color: colors.onPrimary,
      fontWeight: '600',
    },
  });
