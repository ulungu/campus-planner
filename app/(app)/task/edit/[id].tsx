import React from 'react';
import { ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Screen from '../../../../src/components/ui/Screen';
import EmptyState from '../../../../src/components/ui/EmptyState';
import TaskForm from '../../../../src/components/task/TaskForm';
import { getErrorMessage, isNotFound, isUnauthorized } from '../../../../src/api/client';
import { useTaskQuery } from '../../../../src/features/tasks/useTasksQuery';
import { useUpdateTask } from '../../../../src/features/tasks/useTaskMutations';
import { useTheme } from '../../../../src/context/ThemeContext';
import { TaskFormValues } from '../../../../src/types/task';
import { TaskRouteParams } from '../../../../src/types/navigation';
import { toFormValues, toUpdateInput } from '../../../../src/utils/task';
import { goBackOrHome } from '../../../../src/navigation/actions';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<TaskRouteParams>();
  const taskQuery = useTaskQuery(id);
  const updateMutation = useUpdateTask();
  const { colors } = useTheme();

  const notFound = (
    <Screen>
      <EmptyState
        title="Задача не найдена"
        actionLabel="К списку задач"
        onAction={goBackOrHome}
      />
    </Screen>
  );

  if (!id) return notFound;

  if (taskQuery.isPending) {
    return (
      <Screen centered>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  if (taskQuery.isError && !taskQuery.data) {
    if (isNotFound(taskQuery.error)) return notFound;
    return (
      <Screen>
        <EmptyState
          icon="⚠️"
          title="Не удалось загрузить задачу"
          description={getErrorMessage(taskQuery.error)}
          actionLabel={taskQuery.isFetching ? 'Загрузка…' : 'Повторить'}
          onAction={() => void taskQuery.refetch()}
        />
      </Screen>
    );
  }

  const task = taskQuery.data;
  if (!task) return notFound;

  const handleSubmit = (values: TaskFormValues) => {
    // toUpdateInput передаёт dueDate: null, если срок в форме очищен
    updateMutation.mutate(
      { id: task.id, input: toUpdateInput(values) },
      { onSuccess: () => router.back() }
    );
  };

  const submitError =
    updateMutation.isError && !isUnauthorized(updateMutation.error)
      ? getErrorMessage(updateMutation.error)
      : null;

  return (
    <Screen scroll>
      <TaskForm
        key={task.id}
        initialValues={toFormValues(task)}
        submitLabel="Сохранить"
        submittingLabel="Сохранение…"
        isSubmitting={updateMutation.isPending}
        submitError={submitError}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </Screen>
  );
}
