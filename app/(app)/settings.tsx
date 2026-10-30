import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '../../src/components/ui/Screen';
import AppButton from '../../src/components/ui/AppButton';
import { useAuth } from '../../src/hooks/useAuth';
import { useTheme } from '../../src/context/ThemeContext';
import { THEME_LABELS, ThemeColors, ThemeName } from '../../src/theme/colors';
import { fontSize, radius, spacing } from '../../src/theme/spacing';

const THEME_OPTIONS: ThemeName[] = ['light', 'dark'];

export default function SettingsScreen() {
  const { theme, colors, setTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Удаляет токен из SecureStore и очищает сессию. Экран входа откроется сам:
  // корневой layout закрывает раздел (app), как только isAuthenticated = false
  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    await signOut();
  };

  return (
    <Screen padding="md">
      <Text style={styles.sectionTitle}>Аккаунт</Text>
      <View style={[styles.card, styles.accountCard]}>
        <Text style={styles.rowText}>{user?.name ?? 'Пользователь'}</Text>
        {user ? <Text style={styles.accountLogin}>{user.login}</Text> : null}
      </View>
      <AppButton
        title={isSigningOut ? 'Выход…' : 'Выйти'}
        variant="secondary"
        onPress={handleSignOut}
        disabled={isSigningOut}
        style={styles.signOutButton}
      />


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
    accountCard: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md - spacing.xxs,
    },
    accountLogin: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing.xxs,
    },
    signOutButton: {
      marginTop: spacing.sm + spacing.xs,
      marginBottom: spacing.lg,
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
