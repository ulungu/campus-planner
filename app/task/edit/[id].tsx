import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import TaskForm from '../../../src/components/TaskForm';
import { useTasks } from '../../../src/context/TasksContext';
import { useTheme } from '../../../src/context/ThemeContext';
import { TaskFormValues } from '../../../src/types/task';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTaskById, updateTask } = useTasks();
  const { colors } = useTheme();
  const task = id ? getTaskById(id) : undefined;

  if (!task) {
    return (
      <View style={styles.notFound}>
        <Text style={{ color: colors.text }}>Задача не найдена</Text>
      </View>
    );
  }

  const handleSubmit = (values: TaskFormValues) => {
    updateTask(task.id, values);
    router.back();
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <TaskForm
        initialValues={{
          title: task.title,
          subject: task.subject,
          priority: task.priority,
        }}
        submitLabel="Сохранить"
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
