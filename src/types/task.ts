export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  subject: string;
  priority: TaskPriority;
  isCompleted: boolean;
}

export type TaskFormValues = Omit<Task, 'id' | 'isCompleted'>;

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
};