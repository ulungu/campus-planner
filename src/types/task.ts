export type TaskStatus = 'active' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  subject: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  dueDate?: string;
}

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'status'>;
export type UpdateTaskInput = Partial<CreateTaskInput> & { status?: TaskStatus };

// Значения формы совпадают с данными для создания задачи
export type TaskFormValues = CreateTaskInput;

// Фильтр списка: конкретный статус или все задачи
export type TaskStatusFilter = TaskStatus | 'all';

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
