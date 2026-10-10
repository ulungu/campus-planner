import { useMemo, useState } from 'react';
import { Task, TaskStatusFilter } from '../types/task';
import { countTasks, filterTasks } from '../utils/task';

// Состояние фильтра и поиска для списка задач; сама фильтрация — в чистой filterTasks
export function useTaskFilters(tasks: readonly Task[]) {
  const [status, setStatus] = useState<TaskStatusFilter>('all');
  const [query, setQuery] = useState('');

  const visibleTasks = useMemo(
    () => filterTasks(tasks, { status, query }),
    [tasks, status, query]
  );
  const counts = useMemo(() => countTasks(tasks), [tasks]);

  return {
    status,
    setStatus,
    query,
    setQuery,
    visibleTasks,
    counts,
    isSearching: query.trim().length > 0,
  };
}
