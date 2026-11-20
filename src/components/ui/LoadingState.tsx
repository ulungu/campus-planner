import React from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { fontSize, spacing } from '../../theme/spacing';
import Screen from './Screen';

interface LoadingStateProps {
  // Подпись под индикатором, например «Загрузка задач…»
  label?: string;
}

// Экран первой загрузки данных
export default function LoadingState({ label }: LoadingStateProps) {
  const { colors } = useTheme();

  return (
    <Screen centered>
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
  },
});
