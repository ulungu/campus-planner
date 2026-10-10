import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { fontSize, radius, spacing } from '../../theme/spacing';

// Все стандартные свойства TextInput, кроме стиля и цвета подсказки (их задаёт тема)
interface AppInputProps
  extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  label?: string;
  error?: string | null;
}

export default function AppInput({ label, error, ...inputProps }: AppInputProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...inputProps}
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor={colors.placeholder}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginTop: spacing.sm,
    },
    label: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm + spacing.xs,
      paddingVertical: spacing.sm,
      fontSize: fontSize.md,
      color: colors.text,
      backgroundColor: colors.card,
    },
    inputError: {
      borderColor: colors.danger,
    },
    error: {
      fontSize: fontSize.sm,
      color: colors.danger,
      marginTop: spacing.xs,
    },
  });
