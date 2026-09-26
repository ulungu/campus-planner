import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Task, TaskPriority, PRIORITY_LABELS } from '../types/task';

interface TaskFormProps {
  onSubmit: (data: Omit<Task, 'id' | 'isCompleted'>) => void;
  onCancel: () => void;
}

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

export default function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    const trimmedSubject = subject.trim();

    if (!trimmedTitle || !trimmedSubject) {
      setError('Название и предмет не должны быть пустыми');
      return;
    }

    onSubmit({
      title: trimmedTitle,
      subject: trimmedSubject,
      priority,
    });

    setTitle('');
    setSubject('');
    setPriority('medium');
    setError(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Название задачи</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Например: Сделать домашку по матанализу"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Предмет</Text>
      <TextInput
        style={styles.input}
        value={subject}
        onChangeText={setSubject}
        placeholder="Например: Математический анализ"
        placeholderTextColor="#999"
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
            onPress={() => setPriority(p)}
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
          <Text style={styles.submitButtonText}>Добавить</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  label: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: '#222',
  },
  priorityRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  priorityOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  priorityOptionActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  priorityOptionText: {
    fontSize: 13,
    color: '#444',
  },
  priorityOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    color: '#F44336',
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
    color: '#666',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});