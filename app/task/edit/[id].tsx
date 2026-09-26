import React from 'react';
import { ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import TaskForm from '../../../src/components/TaskForm';
import TaskNotFound from '../../../src/components/TaskNotFound';
import { useTasks } from '../../../src/context/TasksContext';
import { TaskFormValues } from '../../../src/types/task';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTaskById, updateTask } = useTasks();
  const task = id ? getTaskById(id) : undefined;

  if (!task) {
    return <TaskNotFound />;
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
