import { useEffect, useState } from 'react';
import { TaskFormValues } from '../types/task';
import { clearDraft, loadDraft, saveDraft } from '../storage/draftStorage';

export function useTaskDraft() {
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDraft, setPendingDraft] = useState<TaskFormValues | null>(null);
  const [initialValues, setInitialValues] = useState<TaskFormValues | undefined>();
  // Смена key пересоздаёт форму с восстановленными значениями
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    loadDraft().then((draft) => {
      if (!isMounted) return;
      setPendingDraft(draft);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const restoreDraft = () => {
    if (!pendingDraft) return;
    setInitialValues(pendingDraft);
    setFormKey((key) => key + 1);
    setPendingDraft(null);
  };

  const discardDraft = () => {
    clearDraft();
    setPendingDraft(null);
  };

  const handleChange = (values: TaskFormValues) => {
    setPendingDraft(null);
    saveDraft(values);
  };

  return {
    isLoading,
    pendingDraft,
    initialValues,
    formKey,
    restoreDraft,
    discardDraft,
    handleChange,
    clearDraft,
  };
}
