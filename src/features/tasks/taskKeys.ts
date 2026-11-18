import { TaskStatusFilter } from '../../types/task';

// Все ключи задач начинаются с ['tasks', userId]: у каждого пользователя свой кэш,
// а инвалидация по этому префиксу обновляет и списки, и детали.
// Токен в ключ не входит — он не определяет, какие данные лежат в записи
export const taskKeys = {
  all: (userId: string) => ['tasks', userId] as const,
  // Фильтр — часть ключа: у «Все», «Активные», «Выполненные» разные записи кэша
  list: (userId: string, status: TaskStatusFilter) =>
    ['tasks', userId, { status }] as const,
  detail: (userId: string, id: string) => ['tasks', userId, id] as const,
};
