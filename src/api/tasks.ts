import {
  CreateTaskInput,
  Task,
  TaskListParams,
  TaskListResponse,
  TaskResponse,
  UpdateTaskInput,
} from '../types/task';
import { authorizedRequest } from './client';

// Все HTTP-обращения к задачам — только здесь. Экраны получают готовые Task

function taskPath(id: string): string {
  return `/tasks/${encodeURIComponent(id)}`;
}

// GET /tasks?status=…&q=… — пустые параметры в URL не попадают
export async function getTasks(token: string, params: TaskListParams = {}): Promise<Task[]> {
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  const q = params.q?.trim();
  if (q) search.set('q', q);
  const query = search.toString();

  const body = await authorizedRequest<TaskListResponse>(
    query ? `/tasks?${query}` : '/tasks',
    token
  );
  return body.items;
}

export async function getTaskById(id: string, token: string): Promise<Task> {
  const body = await authorizedRequest<TaskResponse>(taskPath(id), token);
  return body.item;
}

export async function createTask(input: CreateTaskInput, token: string): Promise<Task> {
  const body = await authorizedRequest<TaskResponse>('/tasks', token, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return body.item;
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
  token: string
): Promise<Task> {
  const body = await authorizedRequest<TaskResponse>(taskPath(id), token, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return body.item;
}

// 204 без тела: apiRequest не читает JSON, здесь просто ждём успешный статус
export async function deleteTask(id: string, token: string): Promise<void> {
  await authorizedRequest<void>(taskPath(id), token, { method: 'DELETE' });
}
