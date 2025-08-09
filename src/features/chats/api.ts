export interface Message {
  id: number;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
}

export interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageDate: string;
  unread: number;
  pinnedMessages?: Message[];
  type: 'private' | 'group' | 'channel';
  participants?: number;
  lastSeen?: string;
  actions: string[];
  messages: Message[];
}

export const fetchChats = async (): Promise<Chat[]> => {
  const base: Chat[] = [
    {
      id: 1,
      name: 'Alice',
      avatar: 'https://placehold.co/40x40?text=A',
      lastMessage: 'Great to hear!',
      lastMessageDate: '10:00',
      unread: 2,
      pinnedMessages: [
        { id: 1, sender: 'them', text: 'Pinned hello', timestamp: '09:00' }
      ],
      type: 'private',
      lastSeen: 'online',
      actions: ['\uD83D\uDCDE', '\uD83D\uDCF9', '\u22EF'],
      messages: [
        { id: 1, sender: 'them', text: 'Hi! How are you?', timestamp: '08:00' },
        { id: 2, sender: 'me', text: "I'm good, thanks!", timestamp: '08:05' },
        { id: 3, sender: 'them', text: 'Great to hear!', timestamp: '08:06' }
      ]
    },
    {
      id: 2,
      name: 'Developers Group',
      avatar: 'https://placehold.co/40x40?text=D',
      lastMessage: 'Meeting at 5',
      lastMessageDate: 'Yesterday',
      unread: 0,
      type: 'group',
      participants: 12,
      actions: ['\uD83D\uDCDE', '\u22EF'],
      messages: [
        { id: 1, sender: 'them', text: 'Welcome to the group', timestamp: 'Yesterday' },
        { id: 2, sender: 'me', text: 'Hi everyone', timestamp: 'Yesterday' }
      ]
    },
    {
      id: 3,
      name: 'News Channel',
      avatar: 'https://placehold.co/40x40?text=N',
      lastMessage: 'Latest updates',
      lastMessageDate: 'Mon',
      unread: 5,
      pinnedMessages: [
        { id: 1, sender: 'them', text: 'Important announcement', timestamp: 'Mon' }
      ],
      type: 'channel',
      participants: 2300,
      actions: ['\u22EF'],
      messages: [
        { id: 1, sender: 'them', text: 'Latest updates', timestamp: 'Mon' }
      ]
    },
    {
      id: 4,
      name: 'Bob',
      avatar: 'https://placehold.co/40x40?text=B',
      lastMessage: "Let's meet tomorrow",
      lastMessageDate: 'Sun',
      unread: 0,
      type: 'private',
      lastSeen: 'last seen recently',
      actions: ['\uD83D\uDCDE', '\uD83D\uDCF9', '\u22EF'],
      messages: [
        { id: 1, sender: 'them', text: "Let's meet tomorrow", timestamp: 'Sun' }
      ]
    },
    {
      id: 5,
      name: 'Family',
      avatar: 'https://placehold.co/40x40?text=F',
      lastMessage: 'Dinner at 7',
      lastMessageDate: 'Sat',
      unread: 3,
      type: 'group',
      participants: 4,
      actions: ['\uD83D\uDCDE', '\uD83D\uDCF9', '\u22EF'],
      messages: [
        { id: 1, sender: 'them', text: 'Dinner at 7', timestamp: 'Sat' }
      ]
    }
  ];

  const extra: Chat[] = Array.from({ length: 45 }, (_, idx) => {
    const id = idx + 6;
    return {
      id,
      name: `Chat ${id}`,
      avatar: `https://placehold.co/40x40?text=${id}`,
      lastMessage: `Last message ${id}`,
      lastMessageDate: 'Today',
      unread: id % 4,
      type: 'private',
      actions: ['\uD83D\uDCDE', '\uD83D\uDCF9', '\u22EF'],
      messages: []
    };
  });

  return Promise.resolve([...base, ...extra]);
};
