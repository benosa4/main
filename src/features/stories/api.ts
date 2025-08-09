export interface StorySegment {
  id: number;
  viewed: boolean;
}

export interface Story {
  /** ID of the conversation this story belongs to */
  id: number;
  chatId: number;
  title: string;
  /** Image shown inside the circle */
  avatar: string;
  /** Segments representing each story in the conversation */
  segments: StorySegment[];
}

export const fetchStories = async (): Promise<Story[]> => {
  // Ten mock story sets bound to different chats. Each segment describes a
  // single story and whether it has been viewed.
  return Promise.resolve([
    {
      id: 1,
      chatId: 1,
      title: 'Chat 1',
      avatar: 'https://placehold.co/50x50?text=C1',
      segments: [
        { id: 1, viewed: false },
        { id: 2, viewed: true },
        { id: 3, viewed: false }
      ]
    },
    {
      id: 2,
      chatId: 2,
      title: 'Chat 2',
      avatar: 'https://placehold.co/50x50?text=C2',
      segments: [
        { id: 1, viewed: false },
        { id: 2, viewed: false }
      ]
    },
    {
      id: 3,
      chatId: 3,
      title: 'Chat 3',
      avatar: 'https://placehold.co/50x50?text=C3',
      segments: [{ id: 1, viewed: true }]
    },
    {
      id: 4,
      chatId: 4,
      title: 'Chat 4',
      avatar: 'https://placehold.co/50x50?text=C4',
      segments: [
        { id: 1, viewed: true },
        { id: 2, viewed: false }
      ]
    },
    {
      id: 5,
      chatId: 5,
      title: 'Chat 5',
      avatar: 'https://placehold.co/50x50?text=C5',
      segments: [
        { id: 1, viewed: false },
        { id: 2, viewed: false },
        { id: 3, viewed: false }
      ]
    },
    {
      id: 6,
      chatId: 6,
      title: 'Chat 6',
      avatar: 'https://placehold.co/50x50?text=C6',
      segments: [{ id: 1, viewed: false }]
    },
    {
      id: 7,
      chatId: 7,
      title: 'Chat 7',
      avatar: 'https://placehold.co/50x50?text=C7',
      segments: [
        { id: 1, viewed: true },
        { id: 2, viewed: true },
        { id: 3, viewed: false },
        { id: 4, viewed: false }
      ]
    },
    {
      id: 8,
      chatId: 8,
      title: 'Chat 8',
      avatar: 'https://placehold.co/50x50?text=C8',
      segments: [
        { id: 1, viewed: true },
        { id: 2, viewed: true }
      ]
    },
    {
      id: 9,
      chatId: 9,
      title: 'Chat 9',
      avatar: 'https://placehold.co/50x50?text=C9',
      segments: [
        { id: 1, viewed: true },
        { id: 2, viewed: false },
        { id: 3, viewed: false },
        { id: 4, viewed: false },
        { id: 5, viewed: false }
      ]
    },
    {
      id: 10,
      chatId: 10,
      title: 'Chat 10',
      avatar: 'https://placehold.co/50x50?text=C10',
      segments: [
        { id: 1, viewed: true },
        { id: 2, viewed: true },
        { id: 3, viewed: false }
      ]
    }
  ]);
};
