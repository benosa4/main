import { makeAutoObservable, runInAction } from 'mobx';
import { ChatTab, fetchChatTabs } from './api';
import { loadTabsFromDB, saveTabsToDB } from '../../shared/db';

class ChatTabsStore {
  tabs: ChatTab[] = [];
  selectedTabId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async load() {
    const stored = await loadTabsFromDB();
    if (stored.length) {
      runInAction(() => {
        this.tabs = stored;
      });
    } else {
      const fetched = await fetchChatTabs();
      runInAction(() => {
        this.tabs = fetched;
      });
      await saveTabsToDB(fetched);
    }
    runInAction(() => {
      if (this.tabs.length && this.selectedTabId === null) {
        this.selectedTabId = this.tabs[0].id;
      }
    });
  }

  selectTab(id: number) {
    if (this.selectedTabId === id) return;
    this.selectedTabId = id;
  }

  get selectedTab(): ChatTab | undefined {
    return this.tabs.find((t) => t.id === this.selectedTabId);
  }
}

export const chatTabsStore = new ChatTabsStore();
