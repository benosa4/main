import { makeAutoObservable, runInAction } from 'mobx';
import { ChatTab, fetchChatTabs } from './api';
import { loadTabsFromDB, saveTabsToDB } from '../../shared/db';
import appSettingsStore from '../../shared/config/appSettings';

class ChatTabsStore {
  tabs: ChatTab[] = [];
  selectedTabId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async load() {
    // Prefer tabs persisted inside settings
    const fromSettings = appSettingsStore.state.chatTabs;
    if (fromSettings && fromSettings.length) {
      this.tabs = JSON.parse(JSON.stringify(fromSettings));
    } else {
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
      // Save initial set into settings as source of truth
      appSettingsStore.setChatTabs(this.tabs);
    }
    runInAction(() => {
      const savedSel = appSettingsStore.state.selectedChatTabId;
      if (typeof savedSel === 'number' && this.tabs.some(t => t.id === savedSel)) this.selectedTabId = savedSel;
      else if (this.tabs.length && this.selectedTabId === null) this.selectedTabId = this.tabs[0].id;
    });
    appSettingsStore.setSelectedChatTabId(this.selectedTabId);
  }

  selectTab(id: number) {
    if (this.selectedTabId === id) return;
    this.selectedTabId = id;
    appSettingsStore.setSelectedChatTabId(id);
  }

  get selectedTab(): ChatTab | undefined {
    return this.tabs.find((t) => t.id === this.selectedTabId);
  }

  async persist() {
    await saveTabsToDB(this.tabs);
    appSettingsStore.setChatTabs(this.tabs);
  }

  addTab(label: string, chatIds: number[] = []) {
    const nextId = this.tabs.length ? Math.max(...this.tabs.map((t) => t.id)) + 1 : 1;
    const tab: ChatTab = { id: nextId, label, chatIds };
    this.tabs = [...this.tabs, tab];
    void this.persist();
    if (!this.selectedTabId) this.selectedTabId = tab.id;
    appSettingsStore.setSelectedChatTabId(this.selectedTabId);
  }

  removeTab(id: number) {
    // Protect the first built-in tab (All)
    if (id === 1) return;
    this.tabs = this.tabs.filter((t) => t.id !== id);
    if (this.selectedTabId === id) this.selectedTabId = this.tabs[0]?.id ?? null;
    void this.persist();
    appSettingsStore.setSelectedChatTabId(this.selectedTabId);
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
