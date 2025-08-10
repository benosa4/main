import { makeAutoObservable } from 'mobx';
import { appSettingsStore } from '../../shared/config/appSettings';
import { MenuItem, fetchMenuItems } from './api';

class MenuStore {
  items: MenuItem[] = [];
  version: 'K' | 'A' = 'K';

  constructor() {
    makeAutoObservable(this);
  }

  async load() {
    this.items = await fetchMenuItems();
  }

  toggleVersion() {
    this.version = this.version === 'K' ? 'A' : 'K';
  }

  // Items with dynamic label for the version switch
  get renderedItems(): MenuItem[] {
    const items = this.items.map((it) => {
      if (it.id !== 'more' || !it.children) return it;
      const children = it.children.map((c) => {
        if (c.id === 'version') {
          return {
            ...c,
            label:
              this.version === 'K'
                ? 'Переключить в А версию'
                : 'Переключить в К версию',
          };
        }
        if (c.id === 'dark') {
          return {
            ...c,
            label:
              appSettingsStore.state.theme === 'dark'
                ? 'Включить светлый режим'
                : 'Включить темный режим',
          };
        }
        if (c.id === 'anim') {
          return {
            ...c,
            label: appSettingsStore.state.animations
              ? 'Выключить анимацию'
              : 'Включить анимацию',
          };
        }
        return c;
      });
      return { ...it, children } as MenuItem;
    });
    return items;
  }

  // Flattened view to merge child menu items with parent when in A version
  get flattenedItems(): MenuItem[] {
    const base: MenuItem[] = [];
    for (const it of this.renderedItems) {
      if (it.id === 'more' && it.children && this.version === 'A') {
        base.push(
          ...it.children.map((c) => ({ ...c }))
        );
      } else {
        base.push(it);
      }
    }
    return base;
  }
}

export const menuStore = new MenuStore();
