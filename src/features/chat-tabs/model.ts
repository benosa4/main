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

  async persist() {
    await saveTabsToDB(this.tabs);
  }

  addTab(label: string, chatIds: number[] = []) {
    const nextId = this.tabs.length ? Math.max(...this.tabs.map((t) => t.id)) + 1 : 1;
    const tab: ChatTab = { id: nextId, label, chatIds };
    this.tabs = [...this.tabs, tab];
    void this.persist();
    if (!this.selectedTabId) this.selectedTabId = tab.id;
  }

  removeTab(id: number) {
    // Protect the first built-in tab (All)
    if (id === 1) return;
    this.tabs = this.tabs.filter((t) => t.id !== id);
    if (this.selectedTabId === id) this.selectedTabId = this.tabs[0]?.id ?? null;
    void this.persist();
  }

  reorderTabs(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const arr = [...this.tabs];
    const [moved] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, moved);
    this.tabs = arr;
    void this.persist();
  }
}

export const chatTabsStore = new ChatTabsStore();
