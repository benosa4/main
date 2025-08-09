import { makeAutoObservable } from 'mobx';
import { Chat, fetchChats } from './api';
import { loadChatsFromDB, saveChatsToDB } from '../../shared/db';

class ChatStore {
  chats: Chat[] = [];
  selectedChatId: number | null = null;
  status: 'idle' | 'updating' = 'idle';

  constructor() {
    makeAutoObservable(this);
  }

  async load() {
    this.status = 'updating';
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
    this.status = 'idle';
  }

  async selectChat(id: number) {
    this.selectedChatId = id;
    this.status = 'updating';
    // imitate loading messages/history from API
    await new Promise((r) => setTimeout(r, 300));
    this.status = 'idle';
  }

  get selectedChat(): Chat | undefined {
    return this.chats.find((c) => c.id === this.selectedChatId);
  }
}

export const chatStore = new ChatStore();
