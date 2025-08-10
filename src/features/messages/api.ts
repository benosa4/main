import type { Conversation } from '../../entities/conversation/types';
import type { MessageModel } from '../../entities/message/types';
import { loadConversationsFromDB, saveConversationsToDB, loadMessagesByConversation, putMessagesToDB } from '../../shared/db';

let seeded = false;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isoMinutesAgo(mins: number) {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

function makeMockConversations(): Conversation[] {
  return [
    { id: 1, title: 'Alice', type: 'private', avatar: 'https://placehold.co/40x40?text=A' },
    { id: 2, title: 'Developers Group', type: 'group', avatar: 'https://placehold.co/40x40?text=D', participants: 12 },
    { id: 3, title: 'News Channel', type: 'channel', avatar: 'https://placehold.co/40x40?text=N', participants: 2300 },
  ];
}

function makeMessage(id: string, conversationId: number, seqNo: number, minutesAgo: number, sender: 'me' | 'them', text: string): MessageModel {
  const createdAt = isoMinutesAgo(minutesAgo);
  const base: MessageModel = {
    id,
    conversationId,
    seqNo,
    sender,
    text,
    createdAt,
    reactions: [],
    views: { count: randomInt(0, 42) },
  };
  return base;
}

function makeMockMessagesForConversation(conversationId: number): MessageModel[] {
  const count = randomInt(20, 30);
  const res: MessageModel[] = [];
  let minutesAgo = 60 * 24 * 5; // up to 5 days ago
  for (let i = 1; i <= count; i++) {
    const sender = i % 3 === 0 ? 'me' : 'them';
    const text = sender === 'me' ? `Моё сообщение #${i}` : `Их сообщение #${i}`;
    const id = `${conversationId}-${i}`;
    res.push(makeMessage(id, conversationId, i, minutesAgo, sender, text));
    minutesAgo -= randomInt(3, 120);
  }
  // wire prev/next
  for (let i = 0; i < res.length; i++) {
    res[i].prevId = res[i - 1]?.id;
    res[i].nextId = res[i + 1]?.id;
  }
  // add some attachments and reactions
  for (const m of res) {
    if (Math.random() < 0.15) {
      m.attachments = [
        {
          id: `${m.id}-att-1`,
          type: 'image',
          url: `https://placehold.co/320x180?text=${encodeURIComponent('IMG ' + m.seqNo)}`,
          width: 320,
          height: 180,
          mime: 'image/png',
        },
      ];
    }
    if (Math.random() < 0.25) {
      m.reactions = [
        { emoji: '👍', count: randomInt(1, 5), byUserIds: ['u1', 'u2'] },
        ...(Math.random() < 0.5 ? [{ emoji: '❤️', count: randomInt(1, 3), byUserIds: ['u3'] }] : []),
      ];
    }
  }
  // sort by createdAt asc
  res.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return res;
}

export async function ensureMockSeeded() {
  if (seeded) return;
  const existing = await loadConversationsFromDB();
  if (existing && existing.length) {
    seeded = true;
    return;
  }
  const convos = makeMockConversations();
  await saveConversationsToDB(convos);
  // initial batch write some early messages so UI has something
  const initial: MessageModel[] = [];
  for (const c of convos) {
    initial.push(...makeMockMessagesForConversation(c.id).slice(0, 10));
  }
  await putMessagesToDB(initial);
  // background continuation: add the remainder gradually
  setTimeout(async () => {
    for (const c of convos) {
      const all = makeMockMessagesForConversation(c.id);
      // write remaining messages in chunks to simulate background fetch
      let idx = 10;
      while (idx < all.length) {
        const chunk = all.slice(idx, idx + 5);
        // small jitter
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, randomInt(200, 1000)));
        // eslint-disable-next-line no-await-in-loop
        await putMessagesToDB(chunk);
        idx += 5;
      }
    }
  }, 0);
  seeded = true;
}

export async function listConversations(): Promise<Conversation[]> {
  await ensureMockSeeded();
  return loadConversationsFromDB();
}

export async function fetchMessages(conversationId: number, limit?: number) {
  await ensureMockSeeded();
  return loadMessagesByConversation({ conversationId, limit });
}

export async function fetchMessagesBefore(
  conversationId: number,
  beforeId: string,
  limit?: number
) {
  await ensureMockSeeded();
  return loadMessagesByConversation({ conversationId, beforeId, limit });
}
