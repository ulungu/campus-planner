import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import Screen from '../../../../src/components/ui/Screen';
import LoadingState from '../../../../src/components/ui/LoadingState';
import ErrorState from '../../../../src/components/ui/ErrorState';
import TaskNotFound from '../../../../src/components/task/TaskNotFound';
import TaskForm from '../../../../src/components/task/TaskForm';
import { getErrorMessage, isNotFound, isUnauthorized } from '../../../../src/api/client';
import { useTaskQuery } from '../../../../src/features/tasks/useTasksQuery';
import { useUpdateTask } from '../../../../src/features/tasks/useTaskMutations';
import { TaskFormValues } from '../../../../src/types/task';
import { TaskRouteParams } from '../../../../src/types/navigation';
import { toFormValues, toUpdateInput } from '../../../../src/utils/task';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<TaskRouteParams>();
  const taskQuery = useTaskQuery(id);
  const updateMutation = useUpdateTask();

  if (!id) return <TaskNotFound />;

  if (taskQuery.isPending) return <LoadingState />;

  if (taskQuery.isError && !taskQuery.data) {
    if (isNotFound(taskQuery.error)) return <TaskNotFound />;
    return (
      <ErrorState
        title="Не удалось загрузить задачу"
        error={taskQuery.error}
        onRetry={() => void taskQuery.refetch()}
        isRetrying={taskQuery.isFetching}
      />
    );
  }

  const task = taskQuery.data;
  if (!task) return <TaskNotFound />;

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
