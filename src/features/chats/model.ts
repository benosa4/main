import { makeAutoObservable } from 'mobx';
import { Chat, fetchChats } from './api';
import { loadChatsFromDB, saveChatsToDB } from '../../shared/db';

class ChatStore {
  chats: Chat[] = [];
  selectedChatId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async load() {
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
  }

  selectChat(id: number) {
    this.selectedChatId = id;
  }

  get selectedChat(): Chat | undefined {
    return this.chats.find((c) => c.id === this.selectedChatId);
  }
}

export const chatStore = new ChatStore();
