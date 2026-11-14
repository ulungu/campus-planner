import { LoginInput, LoginResponse, User, UserResponse } from '../types/auth';
import { apiRequest } from './client';
import { authorizedFetch } from './authorizedFetch';

// POST /auth/login. При неверных данных сервер отвечает 401
// с текстом «Неверный логин или пароль.» — он уходит в ApiError.message
export function signIn(credentials: LoginInput): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      login: credentials.login.trim(),
      password: credentials.password,
    }),
  });
}

// GET /auth/me — проверка, что сохранённый токен ещё действует
export async function getCurrentUser(token: string): Promise<User> {
  const body = await authorizedFetch<UserResponse>('/auth/me', token);
  return body.user;
}
