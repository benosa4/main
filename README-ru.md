# Обзор проекта (RU)

Веб‑клиент чатов на Vite + React (TypeScript), с локальным хранением в IndexedDB и мок‑API (через отдельные objectStore в IndexedDB).

## Основные фичи

- Профиль и настройки:
  - Общие настройки (тема, формат времени, раскладка клавиатуры, фон чатов, цвет).
  - Анимация и скорость: профили (Экономия/Баланс/Максимум), детальные чекбоксы (интерфейс, стикеры/эмодзи, автозапуск GIF/видео), мгновенное применение по data-атрибутам.
  - Уведомления: веб‑уведомления, уведомления в фоне, громкость, предпросмотр/включение по типам чатов.
  - Данные и память: автозагрузка фото/видео/GIF/файлов по категориям (контакты/личные/группы/каналы), ограничение максимального размера файла.
  - Конфиденциальность: чёрный список, код‑пароль, облачный пароль, активные сайты (заглушка), видимости (номер телефона, время захода, фото, о себе, др.), материалы 18+, название окна, удаление аккаунта (модалка).
  - Папки с чатами: создание, сортировка (drag), удаление, рекомендованные папки (Новые, Личные), связаны с "табы" переписок.
  - Активные сеансы: текущее устройство, список других сеансов, завершить другие, авто‑завершение по периоду.
  - Язык: отображать кнопку «Перевести», переводить чаты целиком (только Premium), выбор языка интерфейса.
  - Стикеры и эмодзи:
    - Подсказка по эмодзи (чекбокс).
    - Наборы эмодзи: пункт с количеством наборов, отдельный экран «Эмодзи» с переключателем «Показывать вместо стикеров» и подсказкой про @stickers.
    - Быстрая реакция: экран «Эмодзи» со списком доступных эмодзи (радиокнопки, картинка + название + выбор), выбранная реакция показывается в списке настроек.
    - Сначала недавние: чекбокс, влияющий на порядок наборов; подпись: «В начале списка будут отображаться недавно использованные наборы».
    - Мои наборы стикеров: информационный блок с подсказкой про @stickers.

- Чаты и сообщения:
  - Сайдбар с историями, табами, поиском; панели плавно анимируются с учётом настроек.
  - Сообщения: эмодзи (Twemoji), реакции, быстрые реакции, индикатор набора (точки), вложения (изображения/GIFы, видео, файлы).
  - Автозапуск и автозагрузка медиа зависят от соответствующих настроек.

## Локальные хранилища (IndexedDB, objectStore)

- `settings` / `settings_remote` — настройки приложения и их мок‑"удалённая" копия.
- `chats`, `conversations`, `messages`, `tabs` — данные чатов/сообщений и вкладок.
- `profile` — профиль пользователя.
- `drafts`, `drafts_remote` — черновики сообщений.
- `app_sessions`, `app_sessions_remote` — активные сеансы (клиентские сессии).

## Структуры настроек (фрагменты)

```ts
interface AppSettingsDTO {
  id: 'app';
  theme: 'dark'|'light'|'auto';
  animations: boolean;
  animationProfile?: 'low'|'balanced'|'max';
  animationPrefs?: { interface: {...}; stickers: {...}; autoplay: {...} };
  notifications?: {...};
  dataMemory?: {...};
  chatTabs?: { id: number; label: string; chatIds: number[] }[];
  selectedChatTabId?: number | null;
  sessionsConfig?: { autoEndAfter: '1w'|'1m'|'3m'|'6m' };
  premium?: boolean;
  language?: {
    showTranslateButton: boolean;
    translateWholeChats: boolean;
    selected: string;
    available: { code: string; nameNative: string; nameRu: string }[];
    resources?: Record<string, Record<string,string>>;
  };
  privacy?: {...};
  stickersEmoji?: {
    emojiHints: boolean;
    emojiSets: {
      showInsteadOfStickers: boolean;
      sets: { id: string; name: string; cover: string }[];
    };
    quickReaction: {
      selected: string; // native emoji
      options: { id: string; name: string; native: string }[];
    };
    recentFirst: boolean;
  } | null;
}
```

## Микросервисы и API (полная карта)

Ниже перечислены все АPI проекта, сгруппированные по микросервисам. Транспорт бывает:
- IndexedDB локально (`objectStore`)
- IndexedDB remote‑мок (`*_remote` stores)
- Внешний HTTP (Keycloak, `GET /api/wallets`)

Общий флоу: читаем из локального; если пусто — читаем из remote; если и там пусто — сидируем remote значениями по умолчанию и сохраняем локально; любые изменения сохраняем локально и стараемся синхронизировать в remote.

—

**Auth Service (Keycloak)**
- Конфиг: `.env` — `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`
- Методы (`src/features/auth/api.ts`):
  - `initKeycloak(): Promise<boolean | undefined>`
  - `login(): Promise<void>` — редирект на страницу логина
  - `logout(): Promise<void>` — редирект на логаут
  - `getToken(): string | undefined`

—

**Settings Service**
- Stores: `settings` (локально), `settings_remote` (remote‑мок), ключ `id='app'`
- Методы (`src/shared/db.ts`):
  - `loadAppSettingsFromDB(): Promise<AppSettingsDTO | null>`
  - `saveAppSettingsToDB(dto: AppSettingsDTO): Promise<void>`
  - `loadAppSettingsFromRemote(): Promise<AppSettingsDTO | null>`
  - `saveAppSettingsToRemote(dto: AppSettingsDTO): Promise<void>`
- `AppSettingsDTO` включает группу «Стикеры и эмодзи»:
  - `stickersEmoji: { emojiHints: boolean; emojiSets: { showInsteadOfStickers: boolean; sets: { id; name; cover }[] }; quickReaction: { selected: string; options: { id; name; native }[] }; recentFirst: boolean }`
- Bootstrap мок‑значений при первом запуске — в `src/shared/config/appSettings.ts` (метод `init`).

—

**Drafts Service**
- Stores: `drafts` (локально), `drafts_remote` (remote‑мок); ключ — `conversationId`
- Методы (`src/shared/db.ts`):
  - `loadDraftFromDB(conversationId: number)` → `Promise<{ conversationId: number; text: string } | null>`
  - `saveDraftToDB(draft)` → `Promise<void>`
  - `deleteDraftFromDB(conversationId)` → `Promise<void>`
  - `loadDraftFromRemote(conversationId)` / `saveDraftToRemote(draft)` / `deleteDraftFromRemote(conversationId)`

—

**Sessions Service**
- Stores: `app_sessions` (локально), `app_sessions_remote` (remote‑мок)
- Тип: `SessionDTO { id: string; browser: string; clientVersion: string; location: string; lastActiveAt: string }`
- Методы (`src/shared/db.ts`):
  - `loadSessionsFromDB()` / `saveSessionsToDB(sessions)`
  - `loadSessionsFromRemote()` / `saveSessionsToRemote(sessions)`

—

**Profile Service**
- Store: `profile` (локально), ключ `id='me'`;
- Методы IndexedDB (`src/shared/db.ts`): `loadProfileFromDB()`, `saveProfileToDB(profile)`
- REST‑мок (`src/features/profile/api.ts`): `fetchProfile(): Promise<{ displayName; username; phone; about?; birthdayLabel?; avatarUrl?; avatarCacheDataUrl? }>`

—

**Media Service** (`src/shared/media/api.ts`)
- `presignForUpload({ filename, mime }): Promise<{ uploadUrl; fileUrl; headers? }>`
- `uploadToPresignedUrl(uploadUrl, file, headers?): Promise<void>`
- `downloadFromUrl(url: string): Promise<string /* DataURL */>`

—

**NATS Bridge Service (мок)** (`src/shared/nats/api.ts`)
- `publishMessage(subject: string, payload: unknown): Promise<{ ok: true; subject: string }>`
- `emitIncoming(subject: string, payload: unknown): void`

—

**Chats Service** (`src/features/chats/api.ts`)
- `fetchChats(): Promise<Chat[]>`
- Типы: `Chat`, `Message` (облегчённые макапы)

—

**Chat Tabs Service** (`src/features/chat-tabs/api.ts`)
- `fetchChatTabs(): Promise<{ id: number; label: string; chatIds: number[] }[]>`

—

**Messages Service** (`src/features/messages/api.ts` + IndexedDB)
- `ensureMockSeeded(): Promise<void>` — сидирует беседы и сообщения в БД
- `listConversations(): Promise<Conversation[]>`
- `fetchMessages(conversationId: number, limit?: number): Promise<MessageModel[]>`
- `fetchMessagesBefore(conversationId: number, beforeId: string, limit?: number): Promise<MessageModel[]>`
- Stores/индексы: `conversations`, `messages` (`byConversation`, `byConversationAndCreatedAt`)

—

**Menu Service** (`src/features/menu/api.ts`)
- `fetchMenuItems(): Promise<{ id: string; label: string; icon: string; children?: MenuItem[] }[]>`

—

**Stories Service** (`src/features/stories/api.ts`)
- `fetchStories(): Promise<Story[]>` с сегментами историй

—

**Wallets Service** (`src/features/wallets/api.ts`)
- HTTP: `GET /api/wallets` → `Promise<any>` — список кошельков (схема у внешнего бэкенда)

—

**Low‑level Storage (IndexedDB)** (`src/shared/db.ts`)
- Чаты: `saveChatsToDB`, `loadChatsFromDB`
- Табы: `saveTabsToDB`, `loadTabsFromDB`
- Беседы: `saveConversationsToDB`, `loadConversationsFromDB`
- Сообщения: `putMessagesToDB`, `loadMessagesByConversation({ conversationId, limit?, beforeId? })`
- Настройки: `loadAppSettingsFromDB/Remote`, `saveAppSettingsToDB/Remote`
- Сессии: `loadSessionsFromDB/Remote`, `saveSessionsToDB/Remote`
- Профиль: `loadProfileFromDB`, `saveProfileToDB`
- Черновики: `loadDraftFromDB/Remote`, `saveDraftToDB/Remote`, `deleteDraftFromDB/Remote`

## i18n

- Доступные языки и выбранный язык находятся в `settings.language`.
- Ресурсы переводов (mock) также могут лежать в `settings.language.resources`. Клиент может подгрузить их и использовать (провайдер/утилита может быть добавлен при необходимости).

## Сборка и Dev

- `npm run dev` — Vite dev server
- `npm run build` — build + `tsc -b`
- `npm run preview` — serve production build
- `npm run lint` — ESLint
