export interface Conversation {
  id: number;
  title: string;
  avatar?: string;
  type: 'private' | 'group' | 'channel';
  participants?: number;
  lastMessageAt?: string; // ISO
  unreadCount?: number;
}

