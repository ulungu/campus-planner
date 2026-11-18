import React from 'react';
import { ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../../src/components/ui/Screen';
import TaskForm from '../../../src/components/task/TaskForm';
import DraftBanner from '../../../src/components/task/DraftBanner';
import { getErrorMessage, isUnauthorized } from '../../../src/api/client';
import { useCreateTask } from '../../../src/features/tasks/useTaskMutations';
import { useTaskDraft } from '../../../src/hooks/useTaskDraft';
import { useTheme } from '../../../src/context/ThemeContext';
import { TaskFormValues } from '../../../src/types/task';
import { toCreateInput } from '../../../src/utils/task';

export default function NewTaskScreen() {
  const createMutation = useCreateTask();
  const { colors } = useTheme();
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

  if (draft.isLoading) {
    return (
      <Screen centered>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

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
