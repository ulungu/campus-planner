import React from 'react';
import { ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../../src/components/ui/Screen';
import TaskForm from '../../../src/components/task/TaskForm';
import DraftBanner from '../../../src/components/task/DraftBanner';
import { useTasks } from '../../../src/hooks/useTasks';
import { useTaskDraft } from '../../../src/hooks/useTaskDraft';
import { useTheme } from '../../../src/context/ThemeContext';
import { TaskFormValues } from '../../../src/types/task';

export default function NewTaskScreen() {
  const { createTask } = useTasks();
  const { colors } = useTheme();
  const draft = useTaskDraft();

  const handleSubmit = async (values: TaskFormValues) => {
    createTask(values);
    await draft.clearDraft();
    router.back();
  };

  if (draft.isLoading) {
    return (
      <Screen centered>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

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
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        onChange={draft.handleChange}
      />
    </Screen>
  );
}
