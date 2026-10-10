import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { fontSize, radius, spacing } from '../../theme/spacing';
import { STATUS_FILTER_LABELS, TaskStatusFilter } from '../../types/task';

const OPTIONS: TaskStatusFilter[] = ['all', 'active', 'completed'];

interface StatusFilterProps {
  value: TaskStatusFilter;
  onChange: (value: TaskStatusFilter) => void;
}

export default function StatusFilter({ value, onChange }: StatusFilterProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const isActive = value === option;
        return (
          <Pressable
            key={option}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onChange(option)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {STATUS_FILTER_LABELS[option]}
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
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    chip: {
      paddingVertical: spacing.xs + spacing.xxs,
      paddingHorizontal: spacing.sm + spacing.xs + spacing.xxs,
      borderRadius: radius.pill,
      backgroundColor: colors.chip,
      marginRight: spacing.sm,
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
