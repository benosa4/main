export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'video' | 'audio';
  url: string;
  name?: string;
  size?: number; // bytes
  mime?: string;
  width?: number;
  height?: number;
}

export interface MessageReaction {
  emoji: string; // e.g. "👍"
  count: number;
  byUserIds: string[];
}

export interface MessageViewInfo {
  count: number;
  lastViewedAt?: string; // ISO
}

export interface MessageModel {
  id: string; // globally unique
  conversationId: number;
  seqNo: number; // message number in conversation
  sender: 'me' | 'them';
  text?: string;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  views?: MessageViewInfo;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
  prevId?: string;
  nextId?: string;
}

