import * as SecureStore from 'expo-secure-store';

// Токен хранится только в SecureStore (Keychain на iOS, Keystore на Android).
// В AsyncStorage, параметрах маршрута и логах его быть не должно.
// В ключах SecureStore допустимы только буквы, цифры, «.», «-» и «_»,
// поэтому вместо «@campus-planner/access-token» используется точка
export const ACCESS_TOKEN_KEY = 'campus-planner.access-token';

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function readToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch {
    // Повреждённое хранилище (например, после переустановки) — считаем, что токена нет
    return null;
  }
}

export async function removeToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  } catch {
    // Удалять нечего — это не ошибка для выхода
  }
}
