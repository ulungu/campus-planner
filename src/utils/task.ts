// Чистые функции для работы с задачами: без React, без побочных эффектов.
import {
  CreateTaskInput,
  Task,
  TaskFormValues,
  TaskCounts,
  TaskFilterOptions,
  TaskPriority,
  TaskStatus,
  TaskStatusFilter,
  UpdateTaskInput,
} from '../types/task';

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const DUE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// ---------- Подсчёт ----------

export function countTasks(tasks: readonly Task[]): TaskCounts {
  const completed = tasks.filter((task) => task.status === 'completed').length;
  return {
    total: tasks.length,
    active: tasks.length - completed,
    completed,
  };
}

// ---------- Сортировка ----------

// Сначала высокий приоритет; при равенстве сохраняется исходный порядок
export function sortByPriority(tasks: readonly Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
  );
}

// ---------- Фильтрация ----------

export function filterByStatus(
  tasks: readonly Task[],
  status: TaskStatusFilter
): Task[] {
  if (status === 'all') return [...tasks];
  return tasks.filter((task) => task.status === status);
}

export function matchesQuery(task: Task, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return (
    task.title.toLowerCase().includes(normalized) ||
    task.subject.toLowerCase().includes(normalized)
  );
}

// Поиск по названию или предмету вместе с фильтром по статусу
export function filterTasks(
  tasks: readonly Task[],
  { status, query }: TaskFilterOptions
): Task[] {
  return filterByStatus(tasks, status).filter((task) => matchesQuery(task, query));
}

// ---------- Сроки ----------

export function isValidDueDate(value: string): boolean {
  if (!DUE_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Задача просрочена, если она не выполнена и её срок уже прошёл (сегодня ещё не просрочка)
export function isOverdue(task: Task, now: Date = new Date()): boolean {
  if (task.status === 'completed' || !task.dueDate) return false;
  if (!isValidDueDate(task.dueDate)) return false;
  return task.dueDate < toDateKey(now);
}

// 2026-10-05 -> 05.10.2026
export function formatDueDate(dueDate: string): string {
  if (!isValidDueDate(dueDate)) return dueDate;
  const [year, month, day] = dueDate.split('-');
  return `${day}.${month}.${year}`;
}

// ---------- Статус ----------

export function toggleStatus(status: TaskStatus): TaskStatus {
  return status === 'completed' ? 'active' : 'completed';
}

// ---------- Проверка данных формы ----------

export type TaskInputErrors = Partial<Record<keyof TaskFormValues, string>>;

// Лимиты сервера (API.md, раздел 3): длина считается как string.length после trim()
export const TITLE_MAX_LENGTH = 120;
export const SUBJECT_MAX_LENGTH = 80;

export function validateTaskInput(input: TaskFormValues): TaskInputErrors {
  const errors: TaskInputErrors = {};
  const title = input.title.trim();
  const subject = input.subject.trim();
  if (!title) errors.title = 'Введите название задачи';
  else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Не длиннее ${TITLE_MAX_LENGTH} символов`;
  }
  if (!subject) errors.subject = 'Введите предмет';
  else if (subject.length > SUBJECT_MAX_LENGTH) {
    errors.subject = `Не длиннее ${SUBJECT_MAX_LENGTH} символов`;
  }
  if (input.dueDate && !isValidDueDate(input.dueDate)) {
    errors.dueDate = 'Дата в формате ГГГГ-ММ-ДД, например 2026-12-31';
  }
  return errors;
}

export function hasErrors(errors: TaskInputErrors): boolean {
  return Object.keys(errors).length > 0;
}

// Обрезает пробелы и убирает пустой срок
export function normalizeTaskInput(input: TaskFormValues): TaskFormValues {
  const dueDate = input.dueDate?.trim();
  return {
    title: input.title.trim(),
    subject: input.subject.trim(),
    priority: input.priority,
    ...(dueDate ? { dueDate } : {}),
  };
}

// ---------- Форма → тело запроса ----------

// POST: без срока поле не передаём, сервер поставит null
export function toCreateInput(values: TaskFormValues): CreateTaskInput {
  const normalized = normalizeTaskInput(values);
  return {
    title: normalized.title,
    subject: normalized.subject,
    priority: normalized.priority,
    ...(normalized.dueDate ? { dueDate: normalized.dueDate } : {}),
  };
}

// PATCH: очищенный в форме срок нужно явно удалить на сервере через null
export function toUpdateInput(values: TaskFormValues): UpdateTaskInput {
  const normalized = normalizeTaskInput(values);
  return {
    title: normalized.title,
    subject: normalized.subject,
    priority: normalized.priority,
    dueDate: normalized.dueDate ?? null,
  };
}

// Значения формы из серверной задачи (null-срок → пустое поле)
export function toFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    subject: task.subject,
    priority: task.priority,
    ...(task.dueDate ? { dueDate: task.dueDate } : {}),
  };
}
