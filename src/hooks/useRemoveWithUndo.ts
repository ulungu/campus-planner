import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { getErrorMessage, isUnauthorized } from '../api/client';
import { useCreateTask, useDeleteTask } from '../features/tasks/useTaskMutations';
import { Task } from '../types/task';

// Сколько миллисекунд доступна кнопка «Отменить» после удаления
export const UNDO_TIMEOUT = 5000;

export interface RemovedTask {
  task: Task;
  key: number;
}

function showError(title: string, error: unknown) {
  // При 401 приложение само выходит из сессии — сообщение не нужно
  if (!isUnauthorized(error)) Alert.alert(title, getErrorMessage(error));
}

// Удаление с подтверждением (ЛР №5) поверх серверных мутаций.
// Задача удаляется на сервере сразу (DELETE), а «Отменить» создаёт её заново
// с теми же полями (POST) — у восстановленной задачи будет новый id
export function useRemoveWithUndo(tasks: readonly Task[]) {
  const deleteMutation = useDeleteTask();
  const createMutation = useCreateTask();
  const [lastRemoved, setLastRemoved] = useState<RemovedTask | null>(null);
  const removalCounter = useRef(0);

  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    if (!lastRemoved) return;
    const timer = setTimeout(() => setLastRemoved(null), UNDO_TIMEOUT);
    return () => clearTimeout(timer);
  }, [lastRemoved]);

  const { mutateAsync: deleteAsync } = deleteMutation;

  const remove = useCallback(
    async (task: Task) => {
      try {
        await deleteAsync(task.id);
        removalCounter.current += 1;
        setLastRemoved({ task, key: removalCounter.current });
      } catch (error) {
        showError('Не удалось удалить задачу', error);
      }
    },
    [deleteAsync]
  );

  const confirmRemove = useCallback(
    (id: string) => {
      const task = tasksRef.current.find((item) => item.id === id);
      if (!task) return;
      Alert.alert(
        'Удалить задачу?',
        `«${task.title}» будет удалена.`,
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Удалить', style: 'destructive', onPress: () => void remove(task) },
        ],
        { cancelable: true }
      );
    },
    [remove]
  );

  const { mutateAsync: createAsync, isPending: isRestoring } = createMutation;

  const undo = useCallback(async () => {
    if (!lastRemoved || isRestoring) return;
    const { task } = lastRemoved;
    setLastRemoved(null);
    try {
      await createAsync({
        title: task.title,
        subject: task.subject,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
      });
    } catch (error) {
      showError('Не удалось восстановить задачу', error);
    }
  }, [lastRemoved, isRestoring, createAsync]);

  return { lastRemoved, confirmRemove, undo, removingIds: deleteMutation.pendingIds };
}
