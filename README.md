# Wallet Chat — Architecture and Data Flow

This project uses React + TypeScript + Vite with a feature-sliced structure. Below is a concise map of the chat data model, UI composition, scroll behavior, and how IndexedDB is populated in the background.

## Structure Overview

- app entry: `src/main.tsx`; routes: `src/app/routes.tsx`; global styles: `src/index.css`.
- feature-sliced folders: `src/app/`, `src/pages/`, `src/features/`, `src/entities/`, `src/shared/`, `src/assets/`.
- chat page: `src/pages/chat/ChatPage.tsx` (left panel with stories/tabs/chats, right panel with messages and input).
- messages UI: `src/features/messages/ui/MessagesContainer.tsx` -> `src/entities/message-date-group/ui/MessageDateGroup.tsx` -> `src/entities/message/ui/Message.tsx`.
- IndexedDB access: `src/shared/db.ts`.
- Mock API and seeding: `src/features/messages/api.ts`.

## Data Model

- Conversation: `id`, `title`, `type` ('private' | 'group' | 'channel'), `avatar`, optional `participants`.
- MessageModel: `id`, `conversationId`, `seqNo`, `sender` ('me'|'them'), optional `text`, optional `attachments[]`, optional `reactions[]`, optional `views`, `createdAt` (ISO), optional `updatedAt`, `prevId`, `nextId`.
- MessageAttachment: `id`, `type` ('image'|'file'|'video'|'audio'), `url`, optional `name`, `size`, `mime`, `width`, `height`.
- MessageReaction: `emoji`, `count`, `byUserIds[]`.
- Views counter: `views.count`, optional `lastViewedAt`.
- Stories: synthetic sample in `features/stories` used only for header UI (not persisted).

## UI Behavior

- Initial scroll: message list is anchored to the bottom (last message visible). No scrollbar is visible for the message pane (`hide-scrollbar` utility).
- Growing input: the multiline input (`TwemojiInput`) grows up to half of the current messages viewport height. As it grows, the messages pane shifts upward; if the user is anchored to bottom, the scroll remains at the latest message.
- Infinite history: when the user scrolls to the top edge of the message pane, older messages are revealed (fetched from the local cache/IndexedDB) and prepended without visual jump.
- Grouping: messages are grouped by day using `src/shared/utils/dateGroups.ts` and rendered with a sticky date label component.

## IndexedDB Schema and Pagination

- DB name: `chat-app`. Object stores: `conversations` (key: `id`), `messages` (key: `id`). Indexes on `messages`: `byConversation` and `byConversationAndCreatedAt` (if supported).
- APIs (`src/shared/db.ts`):
  - `saveConversationsToDB`, `loadConversationsFromDB` — conversations CRUD.
  - `putMessagesToDB` — batch upsert of messages.
  - `loadMessagesByConversation({ conversationId, limit, beforeId })` — returns messages sorted by time ASC; supports pagination:
    - last page: pass `limit` only to fetch the last N messages;
    - older page: pass `beforeId` + `limit` to fetch N messages older than `beforeId`.

## Background Seeding and Sync

- `ensureMockSeeded()` (in `src/features/messages/api.ts`) bootstraps mock conversations and messages into IndexedDB:
  - writes a small initial batch (first ~10 messages per conversation) so UI has data immediately.
  - then, in the background, writes the remaining messages in small chunks with random delay to simulate a live feed.
- `listConversations()` and `fetchMessages()` read from IndexedDB (no network).

## Store and Windowing

- Store: `src/features/messages/model.ts` maintains:
  - `messagesByConversation`: full in-memory cache for each conversation (from IndexedDB).
  - `visibleCountByConversation`: how many latest messages are currently visible (tail window).
  - `groupsByConversation`: grouped slice based on `visibleCount`.
  - `increaseVisible(conversationId, by)`: expands the window to reveal older messages (used by infinite scroll).
  - A light polling reload keeps the cache in sync with background inserts.

## Scroll Anchoring and Infinite Load

- The scroll container lives in `ChatPage` around `MessagesContainer`.
- On chat change, the container scrolls to bottom and sets an “anchor-to-bottom” flag.
- A `ResizeObserver` tracks content/viewport changes; if anchored, the list stays pinned to the bottom as new messages arrive or the input grows.
- When scrolled near the top, `increaseVisible` is called and the scroll offset is adjusted so the viewport doesn’t jump while older messages prepend.

## Environment Setup

Create a `.env` with:

- `VITE_NATS_URL` – NATS server URL
- `VITE_KEYCLOAK_URL` – Keycloak base URL
- `VITE_KEYCLOAK_REALM` – Keycloak realm name
- `VITE_KEYCLOAK_CLIENT_ID` – Keycloak client identifier

## Dev Commands

- `npm run dev` — Vite dev server with React Fast Refresh
- `npm run build` — Type-check and production build to `dist/`
- `npm run preview` — Serve the production build
- `npm run lint` — ESLint
