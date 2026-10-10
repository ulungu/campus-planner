import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { fontSize, radius, spacing } from '../../theme/spacing';
import { TaskFormValues } from '../../types/task';
import AppButton from '../ui/AppButton';

interface DraftBannerProps {
  draft: TaskFormValues;
  onRestore: () => void;
  onDiscard: () => void;
}

export default function DraftBanner({ draft, onRestore, onDiscard }: DraftBannerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.banner}>
      <Text style={styles.title}>Найден несохранённый черновик</Text>
      <Text style={styles.text} numberOfLines={2}>
        {draft.title || 'Без названия'}
        {draft.subject ? ` · ${draft.subject}` : ''}
      </Text>
      <View style={styles.buttons}>
        <AppButton title="Начать заново" variant="ghost" size="sm" onPress={onDiscard} />
        <AppButton title="Восстановить" size="sm" onPress={onRestore} />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    banner: {
      marginHorizontal: spacing.md,
      marginTop: spacing.sm + spacing.xs,
      padding: spacing.md - spacing.xxs,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.card,
    },
    title: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
    },
    text: {
      fontSize: fontSize.sm,
      marginTop: spacing.xs,
      color: colors.textSecondary,
    },
    buttons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: spacing.sm + spacing.xs,
      gap: spacing.sm,
    },
  });
