import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '../src/components/ui/Screen';
import { useTheme } from '../src/context/ThemeContext';
import { THEME_LABELS, ThemeColors, ThemeName } from '../src/theme/colors';
import { fontSize, radius, spacing } from '../src/theme/spacing';

const THEME_OPTIONS: ThemeName[] = ['light', 'dark'];

export default function SettingsScreen() {
  const { theme, colors, setTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Screen padding="md">
      <Text style={styles.sectionTitle}>Тема оформления</Text>
      <View style={styles.card}>
        {THEME_OPTIONS.map((option, index) => {
          const isSelected = theme === option;
          return (
            <Pressable
              key={option}
              style={[styles.row, index > 0 && styles.rowDivider]}
              onPress={() => setTheme(option)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={styles.rowText}>{THEME_LABELS[option]}</Text>
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    sectionTitle: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      marginBottom: spacing.sm,
      marginLeft: spacing.xs,
    },
    card: {
      borderRadius: radius.lg,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md - spacing.xxs,
    },
    rowDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    rowText: {
      fontSize: fontSize.lg,
      color: colors.text,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: {
      borderColor: colors.primary,
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
  });
