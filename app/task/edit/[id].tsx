import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import Screen from '../../../src/components/ui/Screen';
import EmptyState from '../../../src/components/ui/EmptyState';
import TaskForm from '../../../src/components/task/TaskForm';
import { useTasks } from '../../../src/hooks/useTasks';
import { TaskFormValues } from '../../../src/types/task';
import { TaskRouteParams } from '../../../src/types/navigation';
import { goBackOrHome } from '../../../src/navigation/actions';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<TaskRouteParams>();
  const { getTaskById, updateTask } = useTasks();
  const task = id ? getTaskById(id) : undefined;

  if (!task) {
    return (
      <Screen>
        <EmptyState
          title="Задача не найдена"
          actionLabel="К списку задач"
          onAction={goBackOrHome}
        />
      </Screen>
    );
  }

  const handleSubmit = (values: TaskFormValues) => {
    // dueDate передаём явно: если поле очистили, срок у задачи удалится
    updateTask(task.id, { ...values, dueDate: values.dueDate });
    router.back();
  };

  return (
    <Screen scroll>
      <TaskForm
        initialValues={{
          title: task.title,
          subject: task.subject,
          priority: task.priority,
          dueDate: task.dueDate,
        }}
        submitLabel="Сохранить"
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </Screen>
  );
}
