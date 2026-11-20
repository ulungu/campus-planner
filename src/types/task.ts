// Типы на границе клиента и Campus API (раздел 3 API.md)
export type TaskStatus = 'active' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  subject: string;
  priority: TaskPriority;
  status: TaskStatus;
  // Сервер всегда присылает поле: дата YYYY-MM-DD или null, если срока нет
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  subject: string;
  priority: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
}

// В PATCH отсутствие поля — «оставить как было», dueDate: null — убрать срок
export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface TaskListParams {
  status?: TaskStatus;
  q?: string;
}

export interface TaskListResponse {
  items: Task[];
}

export interface TaskResponse {
  item: Task;
}

// Значения формы: пустой срок в форме — отсутствие поля, а не null
export interface TaskFormValues {
  title: string;
  subject: string;
  priority: TaskPriority;
  dueDate?: string;
}

// Фильтр списка: конкретный статус или все задачи
export type TaskStatusFilter = TaskStatus | 'all';

// Порядок списка (собственная функция ЛР №8): как пришло с сервера — новые сверху,
// по ближайшему сроку или по приоритету
export type TaskSort = 'created' | 'dueDate' | 'priority';

export const SORT_LABELS: Record<TaskSort, string> = {
  created: 'Новые',
  dueDate: 'По сроку',
  priority: 'По приоритету',
};

export interface TaskFilterOptions {
  status: TaskStatusFilter;
  query: string;
}

export interface TaskCounts {
  total: number;
  active: number;
  completed: number;
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  active: 'В процессе',
  completed: 'Выполнено',
};

export const STATUS_FILTER_LABELS: Record<TaskStatusFilter, string> = {
  all: 'Все',
  active: 'Активные',
  completed: 'Выполненные',
};
