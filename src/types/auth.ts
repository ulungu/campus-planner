// Типы на границе клиента и учебного Campus API (раздел «Авторизация» в API.md)

export interface User {
  id: string;
  login: string;
  name: string;
}

export interface LoginInput {
  login: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  // Срок жизни токена в секундах (например, 43200 — 12 часов)
  expiresIn: number;
  user: User;
}

export interface UserResponse {
  user: User;
}

// Единая форма ошибок сервера
export interface ApiErrorResponse {
  error: string;
}
