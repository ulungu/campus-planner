import React, { useMemo } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { fontSize, radius, spacing } from '../../theme/spacing';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost';
export type AppButtonSize = 'md' | 'sm';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
}: AppButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    md: {
      paddingVertical: spacing.sm + spacing.xs,
      paddingHorizontal: spacing.md + spacing.xs,
    },
    sm: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.sm,
    },
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    secondary: {
      borderColor: colors.primary,
    },
    ghost: {},
    pressed: {
      opacity: 0.8,
    },
    disabled: {
      opacity: 0.4,
    },
    text: {
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    primaryText: {
      color: colors.onPrimary,
    },
    secondaryText: {
      color: colors.primary,
    },
    ghostText: {
      color: colors.textSecondary,
      fontWeight: '400',
    },
  });
