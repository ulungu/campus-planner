import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTaskById, getTasks } from '../../api/tasks';
import { Task, TaskStatusFilter } from '../../types/task';
import { taskKeys } from './taskKeys';
import { useTaskSession } from './useTaskSession';

// Список задач текущего пользователя. Фильтр по статусу выполняет сервер:
// GET /tasks?status=active (доп. задание ЛР №7)
export function useTasksQuery(status: TaskStatusFilter) {
  const { userId, isReady, requireToken } = useTaskSession();

  return useQuery({
    queryKey: taskKeys.list(userId, status),
    queryFn: () => getTasks(requireToken(), status === 'all' ? {} : { status }),
    enabled: isReady,
    // При смене фильтра старый список виден, пока не придёт новый — без мигания экрана
    placeholderData: keepPreviousData,
  });
}

// Одна задача. Если она уже есть в загруженном списке, экран открывается сразу,
// а свежие данные с сервера подменяют её после ответа
export function useTaskQuery(id: string | undefined) {
  const queryClient = useQueryClient();
  const { userId, isReady, requireToken } = useTaskSession();

  return useQuery({
    queryKey: taskKeys.detail(userId, id ?? ''),
    queryFn: () => getTaskById(id as string, requireToken()),
    enabled: isReady && Boolean(id),
    placeholderData: () =>
      queryClient
        .getQueryData<Task[]>(taskKeys.list(userId, 'all'))
        ?.find((task) => task.id === id),
  });
}
