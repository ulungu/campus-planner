import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { TaskFormValues, TaskPriority, PRIORITY_LABELS } from '../../types/task';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { fontSize, radius, spacing } from '../../theme/spacing';
import {
  SUBJECT_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  TaskInputErrors,
  hasErrors,
  normalizeTaskInput,
  validateTaskInput,
} from '../../utils/task';
import AppInput from '../ui/AppInput';
import AppButton from '../ui/AppButton';

interface TaskFormProps {
  initialValues?: TaskFormValues;
  submitLabel?: string;
  onSubmit: (data: TaskFormValues) => void;
  onCancel: () => void;
  onChange?: (data: TaskFormValues) => void;
  // Пока запрос в пути, кнопка заблокирована: повторный POST создал бы дубликат
  isSubmitting?: boolean;
  submittingLabel?: string;
  // Ошибка сервера (400, сеть, 500) — показывается над кнопками
  submitError?: string | null;
}

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

const EMPTY_VALUES: TaskFormValues = {
  title: '',
  subject: '',
  priority: 'medium',
};

export default function TaskForm({
  initialValues = EMPTY_VALUES,
  submitLabel = 'Добавить',
  onSubmit,
  onCancel,
  onChange,
  isSubmitting = false,
  submittingLabel = 'Сохранение…',
  submitError = null,
}: TaskFormProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [values, setValues] = useState<TaskFormValues>(initialValues);
  const [errors, setErrors] = useState<TaskInputErrors>({});

  const update = (patch: Partial<TaskFormValues>) => {
    const next = { ...values, ...patch };
    setValues(next);
    onChange?.(next);
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    const normalized = normalizeTaskInput(values);
    const nextErrors = validateTaskInput(normalized);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    onSubmit(normalized);
  };

  return (
    <View style={styles.container}>
      <AppInput
        label="Название задачи"
        value={values.title}
        onChangeText={(title) => update({ title })}
        placeholder="Например: Сделать домашку по матанализу"
        maxLength={TITLE_MAX_LENGTH}
        error={errors.title}
      />

      <AppInput
        label="Предмет"
        value={values.subject}
        onChangeText={(subject) => update({ subject })}
        placeholder="Например: Математический анализ"
        maxLength={SUBJECT_MAX_LENGTH}
        error={errors.subject}
      />

      <Text style={styles.label}>Приоритет</Text>
      <View style={styles.priorityRow}>
        {PRIORITIES.map((p) => {
          const isActive = values.priority === p;
          return (
            <Pressable
              key={p}
              style={[styles.priorityOption, isActive && styles.priorityOptionActive]}
              onPress={() => update({ priority: p })}
            >
              <Text
                style={[
                  styles.priorityOptionText,
                  isActive && styles.priorityOptionTextActive,
                ]}
              >
                {PRIORITY_LABELS[p]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <AppInput
        label="Срок (необязательно)"
        value={values.dueDate ?? ''}
        onChangeText={(dueDate) => update({ dueDate })}
        placeholder="ГГГГ-ММ-ДД"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        error={errors.dueDate}
      />

      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

      <View style={styles.buttonsRow}>
        <AppButton
          title="Отмена"
          variant="ghost"
          onPress={onCancel}
          style={styles.cancelButton}
        />
        <AppButton
          title={isSubmitting ? submittingLabel : submitLabel}
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginVertical: spacing.sm + spacing.xs,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    label: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      marginTop: spacing.sm,
    },
    priorityRow: {
      flexDirection: 'row',
      marginTop: spacing.xs,
    },
    priorityOption: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      paddingVertical: spacing.xs + spacing.xxs,
      paddingHorizontal: spacing.sm + spacing.xs,
      marginRight: spacing.sm,
    },
    priorityOptionActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    priorityOptionText: {
      fontSize: fontSize.sm,
      color: colors.chipText,
    },
    priorityOptionTextActive: {
      color: colors.onPrimary,
      fontWeight: '600',
    },
    submitError: {
      marginTop: spacing.md,
      fontSize: fontSize.sm,
      color: colors.danger,
    },
    buttonsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: spacing.md,
    },
    cancelButton: {
      marginRight: spacing.sm,
    },
  });
