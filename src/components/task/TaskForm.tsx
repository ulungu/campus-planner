import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { TaskFormValues, TaskPriority, PRIORITY_LABELS } from '../../types/task';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { fontSize, radius, spacing } from '../../theme/spacing';
import {
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
        error={errors.title}
      />

      <AppInput
        label="Предмет"
        value={values.subject}
        onChangeText={(subject) => update({ subject })}
        placeholder="Например: Математический анализ"
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

      <AppInput
        label="Описание (необязательно)"
        value={values.description ?? ''}
        onChangeText={(description) => update({ description })}
        placeholder="Что именно нужно сделать"
        multiline
        textAlignVertical="top"
        maxLength={300}
      />

      <View style={styles.buttonsRow}>
        <AppButton
          title="Отмена"
          variant="ghost"
          onPress={onCancel}
          style={styles.cancelButton}
        />
        <AppButton title={submitLabel} onPress={handleSubmit} />
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
    buttonsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: spacing.md,
    },
    cancelButton: {
      marginRight: spacing.sm,
    },
  });
