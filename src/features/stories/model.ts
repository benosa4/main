import { makeAutoObservable, runInAction } from 'mobx';
import { Story, fetchStories } from './api';

class StoryStore {
  stories: Story[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  async load() {
    const data = await fetchStories();
    runInAction(() => {
      this.stories = data;
    });
  }
}

export const storyStore = new StoryStore();
