import { useMemo, useState } from 'react';
import { Task } from '../types/task';
import { matchesQuery } from '../utils/task';

// Поиск по уже полученному списку. Статус фильтрует сервер (см. useTasksQuery),
// а поиск остаётся локальным: серверный LIKE чувствителен к регистру кириллицы
export function useTaskSearch(tasks: readonly Task[]) {
  const [query, setQuery] = useState('');

  const visibleTasks = useMemo(
    () => tasks.filter((task) => matchesQuery(task, query)),
    [tasks, query]
  );

  return {
    query,
    setQuery,
    visibleTasks,
    isSearching: query.trim().length > 0,
  };
}
