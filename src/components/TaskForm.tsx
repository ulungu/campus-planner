import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { TaskFormValues, TaskPriority, PRIORITY_LABELS } from '../types/task';
import { useTheme } from '../context/ThemeContext';
import { ThemeColors } from '../theme/colors';

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

  const [title, setTitle] = useState(initialValues.title);
  const [subject, setSubject] = useState(initialValues.subject);
  const [priority, setPriority] = useState<TaskPriority>(initialValues.priority);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<TaskFormValues>) => {
    const next = { title, subject, priority, ...patch };
    if (patch.title !== undefined) setTitle(patch.title);
    if (patch.subject !== undefined) setSubject(patch.subject);
    if (patch.priority !== undefined) setPriority(patch.priority);
    onChange?.(next);
  };

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    const trimmedSubject = subject.trim();

    if (!trimmedTitle || !trimmedSubject) {
      setError('Название и предмет не должны быть пустыми');
      return;
    }

    setError(null);
    onSubmit({
      title: trimmedTitle,
      subject: trimmedSubject,
      priority,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Название задачи</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={(text) => update({ title: text })}
        placeholder="Например: Сделать домашку по матанализу"
        placeholderTextColor={colors.placeholder}
      />

      <Text style={styles.label}>Предмет</Text>
      <TextInput
        style={styles.input}
        value={subject}
        onChangeText={(text) => update({ subject: text })}
        placeholder="Например: Математический анализ"
        placeholderTextColor={colors.placeholder}
      />

      <Text style={styles.label}>Приоритет</Text>
      <View style={styles.priorityRow}>
        {PRIORITIES.map((p) => (
          <Pressable
            key={p}
            style={[
              styles.priorityOption,
              priority === p && styles.priorityOptionActive,
            ]}
            onPress={() => update({ priority: p })}
          >
            <Text
              style={[
                styles.priorityOptionText,
                priority === p && styles.priorityOptionTextActive,
              ]}
            >
              {PRIORITY_LABELS[p]}
            </Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.buttonsRow}>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </Pressable>
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{submitLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 12,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    label: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 4,
      marginTop: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 15,
      color: colors.text,
    },
    priorityRow: {
      flexDirection: 'row',
      marginTop: 6,
    },
    priorityOption: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      marginRight: 8,
    },
    priorityOptionActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    priorityOptionText: {
      fontSize: 13,
      color: colors.chipText,
    },
    priorityOptionTextActive: {
      color: colors.onPrimary,
      fontWeight: '600',
    },
    errorText: {
      color: colors.danger,
      fontSize: 13,
      marginTop: 10,
    },
    buttonsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 16,
    },
    cancelButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginRight: 8,
    },
    cancelButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    submitButtonText: {
      color: colors.onPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
  });
