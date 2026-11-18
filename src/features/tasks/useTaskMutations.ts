import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { getErrorMessage, isUnauthorized } from '../../api/client';
import { createTask, deleteTask, updateTask } from '../../api/tasks';
import { CreateTaskInput, Task, UpdateTaskInput } from '../../types/task';
import { toggleStatus } from '../../utils/task';
import { useTasksUi } from '../../hooks/useTasksUi';
import { taskKeys } from './taskKeys';
import { useTaskSession } from './useTaskSession';

const TOGGLE_KEY = ['tasks', 'toggle-status'] as const;
const DELETE_KEY = ['tasks', 'delete'] as const;

// После любого изменения список и детали пользователя перечитываются с сервера
function useInvalidateTasks() {
  const queryClient = useQueryClient();
  const { userId } = useTaskSession();
  return () => queryClient.invalidateQueries({ queryKey: taskKeys.all(userId) });
}

export function useCreateTask() {
  const { requireToken } = useTaskSession();
  const { setLastCreatedId } = useTasksUi();
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input, requireToken()),
    onSuccess: async (task) => {
      setLastCreatedId(task.id);
      await invalidate();
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { userId, requireToken } = useTaskSession();
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      updateTask(id, input, requireToken()),
    onSuccess: async (task) => {
      // Детали сразу показывают ответ сервера; префикс ['tasks', userId]
      // инвалидирует и списки, и ключ деталей этой задачи
      queryClient.setQueryData(taskKeys.detail(userId, task.id), task);
      await invalidate();
    },
  });
}

// Смена статуса из списка и карточки. pendingIds — задачи, чей PATCH ещё в пути:
// их чекбокс и свайп заблокированы, чтобы не отправить два противоположных запроса
export function useToggleTaskStatus() {
  const queryClient = useQueryClient();
  const { userId, requireToken } = useTaskSession();
  const invalidate = useInvalidateTasks();

  const mutation = useMutation({
    mutationKey: TOGGLE_KEY,
    mutationFn: (task: Task) =>
      updateTask(task.id, { status: toggleStatus(task.status) }, requireToken()),
    onSuccess: async (task) => {
      queryClient.setQueryData(taskKeys.detail(userId, task.id), task);
      await invalidate();
    },
    onError: (error) => {
      // 401 обрабатывает MutationCache (выход), остальное — сообщение
      if (!isUnauthorized(error)) {
        Alert.alert('Не удалось изменить статус', getErrorMessage(error));
      }
    },
  });

  const pendingIds = useMutationState({
    filters: { mutationKey: TOGGLE_KEY, status: 'pending' },
    select: (item) => (item.state.variables as Task).id,
  });

  return { toggle: mutation.mutate, pendingIds };
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { userId, requireToken } = useTaskSession();

  const mutation = useMutation({
    mutationKey: DELETE_KEY,
    mutationFn: (id: string) => deleteTask(id, requireToken()),
    onSuccess: async (_data, id) => {
      await Promise.all([
        // Ключ деталей удалённой задачи помечаем устаревшим без повторного запроса:
        // открытый экран деталей иначе успел бы получить 404 до перехода назад
        queryClient.invalidateQueries({
          queryKey: taskKeys.detail(userId, id),
          exact: true,
          refetchType: 'none',
        }),
        queryClient.invalidateQueries({
          queryKey: taskKeys.all(userId),
          predicate: (query) => query.queryKey[2] !== id,
        }),
      ]);
    },
  });

  const pendingIds = useMutationState({
    filters: { mutationKey: DELETE_KEY, status: 'pending' },
    select: (item) => item.state.variables as string,
  });

  return { ...mutation, pendingIds };
}
