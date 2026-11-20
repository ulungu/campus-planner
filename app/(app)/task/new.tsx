import React from 'react';
import { router } from 'expo-router';
import Screen from '../../../src/components/ui/Screen';
import LoadingState from '../../../src/components/ui/LoadingState';
import TaskForm from '../../../src/components/task/TaskForm';
import DraftBanner from '../../../src/components/task/DraftBanner';
import { getErrorMessage, isUnauthorized } from '../../../src/api/client';
import { useCreateTask } from '../../../src/features/tasks/useTaskMutations';
import { useTaskDraft } from '../../../src/hooks/useTaskDraft';
import { TaskFormValues } from '../../../src/types/task';
import { toCreateInput } from '../../../src/utils/task';

export default function NewTaskScreen() {
  const createMutation = useCreateTask();
  const draft = useTaskDraft();

  const handleSubmit = (values: TaskFormValues) => {
    createMutation.mutate(toCreateInput(values), {
      // Черновик удаляем только после ответа сервера: при ошибке ввод не теряется
      onSuccess: async () => {
        await draft.clearDraft();
        router.back();
      },
    });
  };

  if (draft.isLoading) return <LoadingState />;

  const submitError =
    createMutation.isError && !isUnauthorized(createMutation.error)
      ? getErrorMessage(createMutation.error)
      : null;

  return (
    <Screen scroll>
      {draft.pendingDraft ? (
        <DraftBanner
          draft={draft.pendingDraft}
          onRestore={draft.restoreDraft}
          onDiscard={draft.discardDraft}
        />
      ) : null}

      <TaskForm
        key={draft.formKey}
        initialValues={draft.initialValues}
        submitLabel="Добавить"
        submittingLabel="Сохранение…"
        isSubmitting={createMutation.isPending}
        submitError={submitError}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        onChange={draft.handleChange}
      />
    </Screen>
  );
}
