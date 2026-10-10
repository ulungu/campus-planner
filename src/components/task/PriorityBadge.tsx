import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { fontSize, radius, spacing } from '../../theme/spacing';
import { PRIORITY_LABELS, TaskPriority } from '../../types/task';

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'md';
}

export default function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.badge,
        size === 'md' && styles.badgeMd,
        { backgroundColor: colors.priority[priority] },
      ]}
    >
      <Text
        style={[styles.text, size === 'md' && styles.textMd, { color: colors.onPriority }]}
      >
        {PRIORITY_LABELS[priority]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  badgeMd: {
    paddingHorizontal: spacing.sm + spacing.xxs,
    paddingVertical: spacing.xxs + 1,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  textMd: {
    fontSize: fontSize.xs + 1,
  },
});
