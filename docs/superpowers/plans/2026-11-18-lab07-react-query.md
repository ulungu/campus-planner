# ЛР №7: серверные задачи и TanStack Query — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** заменить локальный массив задач в `TasksContext` на задачи текущего пользователя из Campus API, управляемые TanStack Query (список, детали, создание, изменение, смена статуса, удаление).

**Architecture:** HTTP — только в `src/api/` (`client.ts` с помощником для Bearer-запросов, `tasks.ts` с пятью типизированными функциями). Серверное состояние — в хуках `src/features/tasks/` поверх `useQuery`/`useMutation`; ключи строятся одной фабрикой `taskKeys` и всегда содержат `user.id`. Один `QueryClient` создаётся на уровне модуля; его `QueryCache`/`MutationCache` при `401` вызывают зарегистрированный `AuthProvider` обработчик (`signOut` + `queryClient.clear()`). `TasksContext` остаётся только для UI-состояния (фильтр статуса, подсветка новой задачи).

**Tech Stack:** Expo SDK 58, expo-router, React 19.3, RN 0.88, TypeScript 6 (strict), `@tanstack/react-query` v5.

**Spec:** `D:\универ\7 семестр\Лаб практикум (МОБИЛКА)\lab-07-server-state-react-query.md` + `API.md` (разделы 3, 5, 6, 8).

## Global Constraints

- Маршруты: `GET /tasks`, `GET /tasks/:id`, `POST /tasks`, `PATCH /tasks/:id`, `DELETE /tasks/:id`; без завершающего `/`, без префикса `/api`.
- Заголовок каждого запроса задач: `Authorization: Bearer <access token>`; токен НЕ входит в `queryKey`.
- Ответы: список — `body.items`, одна задача/создание/изменение — `body.item`; `DELETE` → `204` без тела, функция возвращает `Promise<void>`.
- Серверная модель `Task`: `dueDate: string | null`, есть `updatedAt: string`, поля `description` НЕТ. Пустая строка вместо даты недопустима — `null`.
- Ключи: список `['tasks', user.id, { status }]`, детали `['tasks', user.id, id]`; инвалидация — по префиксу `['tasks', user.id]`.
- `enabled: Boolean(accessToken && user)` у всех запросов задач.
- `new QueryClient()` — только вне компонентов.
- Выход из сессии только при `401`; сеть / `400` / `404` / `500` — показать ошибку запроса.
- Во время отправки кнопки заблокированы, текст «Сохранение…» / «Удаление…».
- Перед кодом сверяться с документацией Expo (AGENTS.md); версия пакетов — совместимая с React 19.

## Review Focus

1. Пользователь A вышел, вошёл пользователь B — B не должен на миг увидеть задачи A (кэш очищается в `signOut`, ключи с `user.id`). Проверка — шаг ручного теста в Task 7.
2. Очистка срока при редактировании: поле очищено → в `PATCH` уходит `dueDate: null`, а не отсутствие поля и не `""`. Проверка — Task 5.
3. Открыта несуществующая/удалённая задача (`404`) — экран «Задача не найдена», без выхода и без бесконечных повторов (`retry` не повторяет 4xx). Проверка — Task 4.
4. Двойное нажатие «Добавить» — сервер создаст дубликат (идемпотентности нет); кнопка блокируется по `isPending`. Проверка — Task 5.
5. Фоновой refetch не должен включать спиннер pull-to-refresh: `refreshing` — от отдельного флага ручного обновления, а не от `isFetching`. Проверка — Task 4.

---

## Структура файлов

| Файл | Действие | Ответственность |
|---|---|---|
| `src/types/task.ts` | изменить | серверная модель: `Task`, `CreateTaskInput`, `UpdateTaskInput`, `TaskListParams`, `TaskListResponse`, `TaskResponse`; `TaskFormValues` (форма, `dueDate?: string`) |
| `src/api/client.ts` | изменить | `apiRequest` (как есть) + `authorizedRequest<T>(path, token, init?)` |
| `src/api/authorizedFetch.ts` | удалить | логика переезжает в `client.ts` |
| `src/api/auth.ts` | изменить | импорт `authorizedRequest` |
| `src/api/tasks.ts` | создать | `getTasks`, `getTaskById`, `createTask`, `updateTask`, `deleteTask` |
| `src/api/queryClient.ts` | создать | единственный `queryClient`, политика `retry`, глобальный перехват `401` |
| `src/features/tasks/taskKeys.ts` | создать | фабрика ключей |
| `src/features/tasks/useTasksQuery.ts` | создать | `useTasksQuery(status)`, `useTaskQuery(id)` |
| `src/features/tasks/useTaskMutations.ts` | создать | `useCreateTask`, `useUpdateTask`, `useToggleTaskStatus`, `useDeleteTask` |
| `src/auth/AuthContext.tsx` | изменить | убрать `authorizedFetch` из контекста; `signOut` чистит кэш; регистрация обработчика 401 |
| `src/context/TasksContext.tsx` | переписать | только UI: `statusFilter`, `lastCreatedId` |
| `src/hooks/useTasks.ts` → `useTasksUi.ts` | переименовать | доступ к UI-контексту |
| `src/hooks/useTaskFilters.ts` | изменить | статус — из контекста (серверный), поиск — локально по полученному списку |
| `src/hooks/useRemoveWithUndo.ts` | переписать | подтверждение → `DELETE`; «Отменить» = повторный `POST` копии |
| `src/utils/task.ts` | изменить | удалить `buildTask`, `applyTaskUpdate`; `normalizeTaskInput` без `description`; `toCreateInput`, `toUpdateInput` |
| `src/components/task/TaskForm.tsx` | изменить | без поля «Описание»; проп `isSubmitting` |
| `src/components/task/TaskCard.tsx` | изменить | без описания; проп `isBusy` блокирует чекбокс/удаление |
| `src/components/ui/ErrorState.tsx` | создать | текст ошибки + «Повторить» |
| `app/_layout.tsx` | изменить | `QueryClientProvider` снаружи `AuthProvider` |
| `app/(app)/index.tsx`, `task/[id].tsx`, `task/new.tsx`, `task/edit/[id].tsx` | изменить | перевод на хуки запросов/мутаций, состояния загрузки/ошибки/пусто/обновления |

Тестового фреймворка в проекте нет, и задание его не требует — проверка каждой задачи: `npx tsc --noEmit` + ручной сценарий в Expo Go. Jest не добавляем (YAGNI).

---

### Task 0: Ветка и зависимость

- [ ] `git checkout -b lb7` (в Windows-терминале проекта).
- [ ] `npm install @tanstack/react-query` → в `package.json` появляется `@tanstack/react-query` `^5.x`.
- [ ] `npx tsc --noEmit` — фиксируем исходное состояние (должно быть без ошибок).
- [ ] Commit: `lb7 - установка @tanstack/react-query`.

### Task 1: Серверные типы и API-слой задач

**Files:** изменить `src/types/task.ts`, `src/api/client.ts`, `src/api/auth.ts`, `src/utils/task.ts`; создать `src/api/tasks.ts`; удалить `src/api/authorizedFetch.ts`.

**Interfaces — Produces:**
- `Task { id; title; subject; priority; status; dueDate: string | null; createdAt; updatedAt }`
- `CreateTaskInput { title; subject; priority; status?: TaskStatus; dueDate?: string | null }`, `UpdateTaskInput = Partial<CreateTaskInput>`
- `TaskListParams { status?: TaskStatus; q?: string }`, `TaskListResponse { items: Task[] }`, `TaskResponse { item: Task }`
- `TaskFormValues { title: string; subject: string; priority: TaskPriority; dueDate?: string }`
- `authorizedRequest<T>(path: string, token: string, init?: RequestInit): Promise<T>` — ставит `Authorization: Bearer ${token}`, дальше `apiRequest` (он уже проверяет `response.ok`, бросает `ApiError` со `status`, обрабатывает `204`).
- `getTasks(token: string, params?: TaskListParams): Promise<Task[]>` — query через `URLSearchParams`, пустые значения не добавлять.
- `getTaskById(id: string, token: string): Promise<Task>` — `encodeURIComponent(id)`.
- `createTask(input: CreateTaskInput, token: string): Promise<Task>`
- `updateTask(id: string, input: UpdateTaskInput, token: string): Promise<Task>`
- `deleteTask(id: string, token: string): Promise<void>`
- `toCreateInput(values: TaskFormValues): CreateTaskInput` (нет даты → поле не передаётся), `toUpdateInput(values: TaskFormValues): UpdateTaskInput` (нет даты → `dueDate: null`).

- [ ] Обновить типы; убрать `description` из `TaskFormValues`, `validateTaskInput`, `normalizeTaskInput`. Удалить `buildTask`, `applyTaskUpdate` (больше не нужны); `toggleStatus` оставить.
- [ ] Добавить `authorizedRequest` в `client.ts`, перевести `auth.ts`, удалить `authorizedFetch.ts`.
- [ ] Создать `src/api/tasks.ts`.
- [ ] `npx tsc --noEmit` — ожидаемо ошибки только в экранах/контексте, использующих старые `description`/`buildTask` (исправляются в Task 3–5). Если хочется зелёного коммита — объединить Task 1 и Task 3 в один коммит.
- [ ] Commit: `lb7 - API-слой задач и серверная модель`.

### Task 2: QueryClient, перехват 401, очистка кэша

**Files:** создать `src/api/queryClient.ts`; изменить `app/_layout.tsx`, `src/auth/AuthContext.tsx`.

**Interfaces — Produces:**
- `export const queryClient: QueryClient`
- `export function setUnauthorizedHandler(handler: (() => void) | null): void`
- политика: `retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2`; у мутаций `retry: false`.
- `new QueryCache({ onError })` и `new MutationCache({ onError })`: если `isUnauthorized(error)` → вызвать обработчик.

- [ ] Создать модуль; в `app/_layout.tsx` обернуть: `GestureHandlerRootView > QueryClientProvider client={queryClient} > ThemeProvider > AuthProvider`.
- [ ] `AuthContext`: удалить `authorizedFetch` (из интерфейса, `tokenRef`, `useMemo`); в `signOut` добавить `queryClient.clear()`; в `useEffect` регистрировать `setUnauthorizedHandler(() => { void signOut(); })`, снимать при размонтировании. В `signIn` тоже `queryClient.clear()` перед установкой пользователя (смена аккаунта).
- [ ] `npx tsc --noEmit` по затронутым файлам.
- [ ] Commit: `lb7 - QueryClient и выход из сессии при 401`.

### Task 3: Хуки запросов/мутаций и UI-контекст

**Files:** создать `src/features/tasks/taskKeys.ts`, `useTasksQuery.ts`, `useTaskMutations.ts`; переписать `src/context/TasksContext.tsx`; `src/hooks/useTasks.ts` → `useTasksUi.ts`; изменить `useTaskFilters.ts`.

**Interfaces — Consumes:** Task 1 (API), `useAuth()` → `{ user, accessToken }`.
**Produces:**
- `taskKeys.all(userId) = ['tasks', userId] as const`; `taskKeys.list(userId, status: TaskStatusFilter) = ['tasks', userId, { status }]`; `taskKeys.detail(userId, id) = ['tasks', userId, id]`.
- `useTasksQuery(status: TaskStatusFilter)` — `getTasks(token, status === 'all' ? {} : { status })`, `enabled: Boolean(accessToken && user)`.
- `useTaskQuery(id: string | undefined)` — `enabled: Boolean(accessToken && user && id)`; `placeholderData` из списка `'all'` в кэше (детали открываются мгновенно).
- `useCreateTask()` → `mutateAsync(values: TaskFormValues)`; `onSuccess`: `setLastCreatedId(task.id)`, invalidate `taskKeys.all`.
- `useUpdateTask(id)` → `mutateAsync(values: TaskFormValues)`; `onSuccess`: invalidate `all` (детали входят в префикс).
- `useToggleTaskStatus()` → `mutate(task: Task)` → `PATCH { status: toggleStatus(task.status) }`; отдаёт `pendingId: string | null` (= `variables?.id` при `isPending`).
- `useDeleteTask()` → `mutateAsync(id)`; `onSuccess`: `removeQueries(detail)` + invalidate `all`.
- Без токена/пользователя хуки бросают `ApiError(401, 'Требуется авторизация.')`.
- `TasksContextValue { statusFilter; setStatusFilter; lastCreatedId; setLastCreatedId; clearLastCreated }` — никаких массивов задач.
- `useTaskFilters(tasks)` — `query` локально, `visibleTasks` = `filterTasks(tasks, { status: 'all', query })` (статус уже применён сервером).

- [ ] Реализовать файлы; удалить `initialTasks` и reducer.
- [ ] `npx tsc --noEmit`.
- [ ] Commit: `lb7 - хуки TanStack Query, TasksContext только для UI`.

### Task 4: Экран списка и экран деталей

**Files:** `app/(app)/index.tsx`, `app/(app)/task/[id].tsx`, создать `src/components/ui/ErrorState.tsx`; изменить `TaskCard.tsx` (убрать описание, проп `isBusy?: boolean`), `useRemoveWithUndo.ts`.

**Interfaces — Consumes:** Task 3. `ErrorState({ message: string; onRetry: () => void; retrying?: boolean })`.

Список:
- [ ] Данные: `useTasksQuery(statusFilter)` для списка, `useTasksQuery('all')` для `TaskProgressBar` (при фильтре «Все» это одна запись кэша и один запрос).
- [ ] Состояния: `isPending` → `ActivityIndicator`; `isError && !data` → `ErrorState` (`getErrorMessage(error)`, `refetch`); данных нет → `EmptyState` (отдельные тексты: «Список пока пуст» / «Нет активных задач» / «Ничего не найдено»); `isError && data` → небольшая плашка над списком «Не удалось обновить», данные остаются.
- [ ] Pull-to-refresh: `RefreshControl refreshing={isPullRefreshing} onRefresh` — локальный флаг `true` → `await refetch()` → `false` (Review Focus #5).
- [ ] Смена статуса — `useToggleTaskStatus`, удаление — `useRemoveWithUndo`, `isBusy` = id в работе.
- [ ] `useRemoveWithUndo`: `Alert` подтверждения → `deleteTask.mutateAsync(id)`; при ошибке — `Alert` с текстом; при успехе — плашка `UndoBar`; «Отменить» → `createTask.mutateAsync` с полями удалённой задачи (`status`, `dueDate` сохраняются; `id` будет новым). Индекс больше не нужен — сервер сортирует по `createdAt`.

Детали:
- [ ] `useTaskQuery(id)`: загрузка; `404` → «Задача не найдена» + «К списку» (Review Focus #3); иная ошибка → `ErrorState`; убрать блок «Описание».
- [ ] Кнопки: «Отметить выполненной/Вернуть в работу» (во время мутации — «Сохранение…», disabled), «Редактировать», новая «Удалить» (`Alert` → `useDeleteTask` → «Удаление…» → `goBackOrHome()`).
- [ ] Ручная проверка: список грузится после входа; пустой аккаунт показывает пустое состояние; авиарежим → ошибка + «Повторить» работает, выхода нет; открыть `/task/несуществующий-id` → «не найдена».
- [ ] Commit: `lb7 - список и детали через useQuery, pull-to-refresh, состояния`.

### Task 5: Создание и редактирование через мутации

**Files:** `app/(app)/task/new.tsx`, `app/(app)/task/edit/[id].tsx`, `src/components/task/TaskForm.tsx`.

- [ ] `TaskForm`: удалить поле «Описание»; новые пропы `isSubmitting?: boolean`, `submittingLabel?: string` — кнопка `disabled`, текст «Сохранение…»; повторный `handleSubmit` при `isSubmitting` игнорируется. Ошибка сервера показывается текстом над кнопками (проп `submitError?: string`).
- [ ] `new.tsx`: `useCreateTask`; успех → `draft.clearDraft()`, `router.back()`; ошибка → `submitError`, черновик сохраняется.
- [ ] `edit/[id].tsx`: начальные значения из `useTaskQuery(id)` (`dueDate ?? undefined`); загрузка/404/ошибка как в деталях; `useUpdateTask(id)` → `toUpdateInput` (Review Focus #2).
- [ ] Ручная проверка: двойной тап «Добавить» создаёт одну задачу (#4); очистить срок → в деталях «Не указан» после возврата; ошибка 400 (например, название 121+ символ, если клиентская валидация не ловит) показывается в форме.
- [ ] Commit: `lb7 - создание и изменение задач через useMutation`.

### Task 6 (доп. задание): серверный фильтр статуса

Уже заложен в Task 3–4: `StatusFilter` меняет `statusFilter` в UI-контексте → ключ `['tasks', user.id, { status }]` → `GET /tasks?status=active`. Поиск остаётся локальным (у сервера `LIKE` чувствителен к регистру кириллицы и ограничен 48 байтами).
- [ ] Проверить в Network/логах, что при смене фильтра уходит `?status=…`, а возврат к уже открытому фильтру показывает кэш мгновенно.
- [ ] Commit (если были правки): `lb7 - серверная фильтрация по статусу`.

### Task 7: Итоговая проверка по требованиям

- [ ] `npx tsc --noEmit` — 0 ошибок; `grep -rn "fetch(" src app` — только `src/api/client.ts`; `grep -rn "useTasks()" src app` — пусто.
- [ ] Сценарий: вход → список → создание → смена статуса (кнопкой и свайпом) → редактирование → фильтр → удаление + отмена → выход.
- [ ] 401: временно в `getTasks` подставить `token + 'x'` → сервер вернёт «Некорректный токен» → приложение выходит на экран входа, кэш пуст; вернуть код.
- [ ] Смена пользователя (Review Focus #1): выйти, войти другим логином (если выдан) — чужих задач нет ни на миг.
- [ ] Сверка с 9 обязательными требованиями ЛР (таблица в README/отчёте).
- [ ] Commit: `lb7 - финальная проверка`; слияние `lb7` в `master`, как в прошлых работах.
