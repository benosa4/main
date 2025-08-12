import { makeAutoObservable, runInAction } from 'mobx';
import { Chat, fetchChats } from './api';
import { loadChatsFromDB, saveChatsToDB } from '../../shared/db';
import appSettingsStore from '../../shared/config/appSettings';

class ChatStore {
  chats: Chat[] = [];
  selectedChatId: number | null = null;
  updating = false; // глобальная загрузка/обновление списков/сообщений

  constructor() {
    makeAutoObservable(this);
  }

  async load() {
    this.updating = true;
    try {
      const stored = await loadChatsFromDB();
      if (stored.length) {
        runInAction(() => {
          this.chats = stored;
        });
      } else {
        const fetched = await fetchChats();
        runInAction(() => {
          this.chats = fetched;
        });
        await saveChatsToDB(fetched);
      }
      runInAction(() => {
        if (this.chats.length && this.selectedChatId === null) {
          const preferred = appSettingsStore.state.lastConversationId;
          const exists = this.chats.find((c) => c.id === preferred);
          this.selectedChatId = exists ? exists.id : this.chats[0].id;
        }
      });
    } finally {
      runInAction(() => {
        this.updating = false;
      });
    }
  }

  selectChat(id: number) {
    this.selectedChatId = id;
    appSettingsStore.setLastConversation(id);
    // Имитация загрузки истории сообщений по API
    this.loadMessages(id).catch(() => {})
    // Сбросить непрочитанные для выбранного чата (mock read receipt)
    const i = this.chats.findIndex((c) => c.id === id);
    if (i >= 0) {
      this.chats[i] = { ...this.chats[i], unread: 0 };
      void saveChatsToDB(this.chats);
    }
  }

  get selectedChat(): Chat | undefined {
    return this.chats.find((c) => c.id === this.selectedChatId);
  }

  async loadMessages(id: number) {
    this.updating = true;
    try {
      // здесь мог бы быть вызов API для подгрузки сообщений чата
      // в нашем демо данные уже в chats, поэтому просто no-op
      void id;
    } finally {
      this.updating = false;
    }
  }
}

export const chatStore = new ChatStore();
