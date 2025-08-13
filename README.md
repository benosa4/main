# Wallet Chat — Architecture and Data Flow

This project uses React + TypeScript + Vite with a feature-sliced structure. Below is a concise map of the chat data model, UI composition, scroll behavior, and how IndexedDB is populated in the background.

## Theming

Light and dark theme tokens live in `src/assets/theme.light.css` and `src/assets/theme.dark.css`. They are imported via `src/assets/tokens.css` and applied by toggling the `data-theme` attribute on `:root`.

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
  - `settings` store (id: `app`): `{ theme, animations, version, lastConversationId }` — persisted app settings and last opened chat.
  - Drafts:
    - local drafts store `drafts` with key `conversationId` and shape `{ conversationId, text }`.
    - mock-remote drafts store `drafts_remote` (used by the mocked API below).

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

## Drafts and Sending Flow

- Drafts persistence:
  - On every input change, the current draft `{ conversationId, text }` is saved to IndexedDB (`drafts`) and mirrored to a mock remote store via API.
  - When switching to a conversation, the local draft is loaded and prefilled into the input.
  - On successful send, the draft is cleared locally and in the mock remote store.

- Sending messages:
  - The send button calls `messageStore.sendMessage(conversationId, text)` which:
    - creates an optimistic `MessageModel` with `sender='me'` and appends it to the UI,
    - persists it to IndexedDB `messages`,
    - publishes to NATS mock API (`publishMessage('chat.{id}.send', payload)`).

## Mock APIs

- NATS mock (`src/shared/nats/api.ts`):
  - `publishMessage(subject, payload)` — logs to `natsStore` and resolves after small delay; used by sending flow.

- Drafts mock (piggybacks on IndexedDB):
  - `saveDraftToRemote`, `loadDraftFromRemote`, `deleteDraftFromRemote` — use a separate store `drafts_remote` to emulate server-side draft persistence.

## Types

- `AppSettingsDTO`: `{ id: 'app', theme: 'dark'|'light', animations: boolean, version: 'A'|'K', lastConversationId?: number|null }`.
- `DraftDTO`: `{ conversationId: number, text: string }`.
- `MessageModel`: see `src/entities/message/types.ts`.

## API Design (REST vs NATS)

This section outlines the production‑grade API surface: what runs over REST (CRUD, pagination, uploads) vs NATS (real‑time commands/events). The current app mocks parts of this; the plan below reflects the final target.

### Principles

- Transport split:
  - REST: idempotent reads/writes, pagination, initial sync, file uploads/downloads, counters queries.
  - NATS: real‑time fan‑out (new message, edits, deletes, reactions), transient signals (typing, presence), write‑commands with request/reply ack.
- Auth: Keycloak OIDC; client attaches `Authorization: Bearer <token>` to REST and signs NATS connection (JWT) or uses a gateway.
- IDs: All entities use stable IDs; messages have per‑conversation `seqNo` for ordering.

### REST Endpoints

- Conversations
  - `GET /conversations`: list conversations for the user (filters: `type`, `q`).
  - `GET /conversations/{id}`: conversation details, counters snapshot (unread, mentions).
  - `GET /conversations/{id}/messages?limit&beforeId`: history pagination (ASC time), last‐page when only `limit`.
  - `POST /conversations/{id}/read`: body `{ messageId }` marks read up to message; returns counters snapshot.
  - `GET /conversations/{id}/counters`: `{ unread, mentions }`.

- Messages
  - `GET /messages/{id}`: single message.
  - `POST /conversations/{id}/messages` (optional): server‑side enqueue; in our design, preferred path is NATS command; REST remains as fallback.
  - `PATCH /messages/{id}`: edit text/attachments.
  - `DELETE /messages/{id}`: delete for me or for everyone.

- Reactions and Views
  - `POST /messages/{id}/reactions`: body `{ emoji }`.
  - `DELETE /messages/{id}/reactions`: body `{ emoji }`.
  - `GET /messages/{id}/views`: `{ count, userIds? }` (with pagination if expanded).

- Drafts (server‑side persistence)
  - `PUT /conversations/{id}/draft`: body `{ text }` upserts or clears (empty text clears).
  - `GET /conversations/{id}/draft`: `{ text } | { text: '' }`.

- Stories
  - `GET /stories`: list story headers for the user.
  - `GET /stories/{id}`: full story payload (segments with media URLs), gated by ACL.
  - `POST /stories/{id}/view`: body `{ segmentIds: [] }` marks viewed segments.

- Files/Media
  - `POST /files`: multipart upload or `POST /files/presign` then PUT to object storage.
  - `GET /files/{id}`: serve file with proper ACL; supports `Range`.
  - Thumbnails & image proxy handled by the media service; metadata on message attachments.

### NATS Subjects (Commands + Events)

- Message lifecycle
  - Command: `chat.{conversationId}.send` → payload `{ id, text, attachments?, clientTs }` → Reply `{ ok, messageId, serverTs }`.
  - Event: `chat.{conversationId}.message.created` → `{ message }` broadcast to participants.
  - Event: `chat.{conversationId}.message.edited` / `.deleted`.

- Reactions
  - Command: `chat.{conversationId}.reaction.add` → `{ messageId, emoji }`.
  - Command: `chat.{conversationId}.reaction.remove` → `{ messageId, emoji }`.
  - Event: `chat.{conversationId}.reaction.updated` → full reactions list or delta.

- Read/Typing/Presence
  - Command: `chat.{conversationId}.read` → `{ messageId }`; Event: `chat.{conversationId}.read.receipt`.
  - Event: `chat.{conversationId}.typing` → `{ userId, state: 'on'|'off' }` (ephemeral).
  - Event: `presence.user` → `{ userId, state: 'online'|'offline'|'away' }`.

- Counters
  - Event: `chat.{conversationId}.counters.updated` → `{ unread, mentions }`.

- Drafts (optional via NATS)
  - Command: `chat.{conversationId}.draft.set` → `{ text }`; Command: `.draft.clear`.
  - Event: `chat.{conversationId}.draft.updated` (if multi‑device sync required).

- Stories
  - Event: `stories.viewed` → `{ storyId, segmentIds, userId }` for analytics.

Notes
- Commands use request/reply (correlationId); events are fire‑and‑forget fan‑out.
- The client path is: initial sync via REST (conversations + last page), then incremental updates via NATS.

### Microservices (Suggested)

- `gateway-service`: REST API gateway, JWT verification, presigned uploads.
- `conversations-service`: CRUD, membership, counters aggregation hooks.
- `messages-service`: append/edit/delete messages, history pagination, indexing.
- `reactions-service`: add/remove reactions, dedupe, totals.
- `read-receipts-service`: read‑up‑to logic per user per conversation.
- `counters-service`: unread/mentions aggregation and push.
- `stories-service`: stories feed, segments, views tracking.
- `media-service`: file uploads/storage, thumbnails, URL signing.
- `drafts-service`: server‑side drafts (optional), multi‑device sync.
- `presence-service`: user presence + typing signals.
- `search-service` (optional): full‑text search over messages.
- `notifications-service` (optional): push delivery.
- Infra: `nats` cluster, object storage (S3‑compatible), DB (SQL/NoSQL), Keycloak.

### Payload Types (JSON)

- Message (event)
```
{
  "id": "m-123",
  "conversationId": 42,
  "seqNo": 101,
  "sender": { "id": "u1", "name": "Alice" },
  "text": "Hello",
  "attachments": [{ "id": "f1", "type": "image", "url": "...", "width": 320, "height": 180 }],
  "reactions": [{ "emoji": "👍", "count": 2 }],
  "views": { "count": 5 },
  "createdAt": "2024-01-01T12:34:56Z"
}
```

- Send command
```
{
  "id": "client-uuid",
  "text": "Hi",
  "attachments": [],
  "clientTs": 1700000000000
}
```

### Client Sync Strategy

- On app start: REST fetch conversations + last page of messages; seed IndexedDB.
- Subscribe via NATS to per‑conversation subjects; apply events to IndexedDB and in‑memory store.
- Use REST for history pagination and on reconnect (gap recovery).

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
