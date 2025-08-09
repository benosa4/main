import { makeAutoObservable } from 'mobx';
import { Story, fetchStories } from './api';

class StoryStore {
  stories: Story[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  async load() {
    this.stories = await fetchStories();
  }
}

export const storyStore = new StoryStore();
