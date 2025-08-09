import { makeAutoObservable } from 'mobx';
import { Chat, fetchChats } from './api';
import { loadChatsFromDB, saveChatsToDB } from '../../shared/db';

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
        this.chats = stored;
      } else {
        this.chats = await fetchChats();
        await saveChatsToDB(this.chats);
      }
      if (this.chats.length && this.selectedChatId === null) {
        this.selectedChatId = this.chats[0].id;
      }
    } finally {
      this.updating = false;
    }
  }

  selectChat(id: number) {
    this.selectedChatId = id;
    // Имитация загрузки истории сообщений по API
    this.loadMessages(id).catch(() => {})
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
