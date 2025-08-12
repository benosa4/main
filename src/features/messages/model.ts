import { makeAutoObservable, runInAction } from 'mobx';
import type { MessageModel } from '../../entities/message/types';
import { fetchMessages, fetchMessagesBefore, ensureMockSeeded } from './api';
import { groupByDate } from '../../shared/utils/dateGroups';
import { putMessagesToDB } from '../../shared/db';
import { publishMessage, emitIncoming } from '../../shared/nats/api';

export interface MessageGroup {
  key: string;
  label: string;
  items: MessageModel[];
}

class MessageStore {
  messagesByConversation = new Map<number, MessageModel[]>();
  groupsByConversation = new Map<number, MessageGroup[]>();
  loading = false;
  _pollTimer: any = null;
  // number of visible messages per conversation (tail window from the end)
  visibleCountByConversation = new Map<number, number>();
  defaultPageSize = 30;
  typingByConversation = new Map<number, boolean>();
  remoteTypingByConversation = new Map<number, boolean>();

  constructor() {
    makeAutoObservable(this);
  }

  async init() {
    await ensureMockSeeded();
  }

  async load(conversationId: number) {
    this.loading = true;
    try {
      const msgs = await fetchMessages(conversationId, this.defaultPageSize);
      runInAction(() => {
        this.messagesByConversation.set(conversationId, msgs);
        // показываем сразу весь загруженный хвост
        this.visibleCountByConversation.set(conversationId, msgs.length);
        this._recomputeGroups(conversationId);
      });
    } finally {
      this.loading = false;
    }
  }

  startPolling(conversationId: number, intervalMs = 1500) {
    if (this._pollTimer) clearInterval(this._pollTimer);
    this._pollTimer = setInterval(() => {
      this.refreshTail(conversationId).catch(() => {});
    }, intervalMs);
  }

  stopPolling() {
    if (this._pollTimer) clearInterval(this._pollTimer);
    this._pollTimer = null;
  }

  private _recomputeGroups(conversationId: number) {
    const all = this.messagesByConversation.get(conversationId) || [];
    const vis = this.visibleCountByConversation.get(conversationId) ?? this.defaultPageSize;
    const slice = vis >= all.length ? all : all.slice(all.length - vis);
    this.groupsByConversation.set(conversationId, groupByDate(slice) as any);
  }

  getGroups(conversationId: number) {
    return this.groupsByConversation.get(conversationId) || [];
  }

  getVisibleCount(conversationId: number) {
    return this.visibleCountByConversation.get(conversationId) ?? 0;
  }

  getTotalCount(conversationId: number) {
    return (this.messagesByConversation.get(conversationId) || []).length;
  }

  increaseVisible(conversationId: number, by: number) {
    const total = this.getTotalCount(conversationId);
    const cur = this.getVisibleCount(conversationId);
    const next = Math.min(total, cur + by);
    this.visibleCountByConversation.set(conversationId, next);
    this._recomputeGroups(conversationId);
  }

  // Подтянуть новую «последнюю страницу» из БД и смержить в конец
  async refreshTail(conversationId: number) {
    const tail = await fetchMessages(conversationId, this.defaultPageSize);
    runInAction(() => {
      const existing = this.messagesByConversation.get(conversationId) || [];
      // мердж по id, затем сортировка по времени ASC
      const byId = new Map<string, MessageModel>();
      for (const m of existing) byId.set(m.id, m);
      for (const m of tail) byId.set(m.id, m);
      const merged = Array.from(byId.values()).sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt)
      );
      this.messagesByConversation.set(conversationId, merged);
      // если видимое окно было привязано к концу, следим чтобы не уменьшалось
      const prevVis = this.getVisibleCount(conversationId);
      const nextVis = Math.max(prevVis, Math.min(merged.length, this.defaultPageSize));
      this.visibleCountByConversation.set(conversationId, nextVis);
      this._recomputeGroups(conversationId);
    });
  }

  // Догрузить более старые сообщения «до» первого загруженного
  async loadOlder(conversationId: number, pageSize = this.defaultPageSize): Promise<number> {
    const all = this.messagesByConversation.get(conversationId) || [];
    const first = all[0];
    if (!first) return 0;
    const older = await fetchMessagesBefore(conversationId, first.id, pageSize);
    if (!older.length) return 0;
    runInAction(() => {
      const merged = [...older, ...all];
      this.messagesByConversation.set(conversationId, merged);
      // расширяем окно видимости на объём догруженных
      const cur = this.getVisibleCount(conversationId);
      this.visibleCountByConversation.set(conversationId, cur + older.length);
      this._recomputeGroups(conversationId);
    });
    return older.length;
  }

  async sendMessage(conversationId: number, text: string, attachments?: MessageModel['attachments']) {
    const existing = this.messagesByConversation.get(conversationId) || [];
    const last = existing[existing.length - 1];
    const seqNo = (last?.seqNo ?? 0) + 1;
    const id = `${conversationId}-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const msg: MessageModel = {
      id,
      conversationId,
      seqNo,
      sender: 'me',
      text,
      createdAt,
      attachments,
      reactions: [],
      views: { count: 0 },
      prevId: last?.id,
    };
    // optimistic local insert
    const merged = [...existing, msg];
    runInAction(() => {
      this.messagesByConversation.set(conversationId, merged);
      const curVis = this.getVisibleCount(conversationId);
      const nextVis = Math.max(curVis, merged.length);
      this.visibleCountByConversation.set(conversationId, nextVis);
      this._recomputeGroups(conversationId);
    });
    await putMessagesToDB([msg]);
    // mock publish via NATS
    await publishMessage(`chat.${conversationId}.send`, { id, conversationId, text, createdAt });
    return msg;
  }

  toggleReaction(conversationId: number, messageId: string, emoji: string) {
    const list = this.messagesByConversation.get(conversationId) || [];
    const idx = list.findIndex((m) => m.id === messageId);
    if (idx < 0) return;
    const cur = list[idx];
    const reactions = [...(cur.reactions || [])];
    const rIdx = reactions.findIndex((r) => r.emoji === emoji);
    if (rIdx >= 0) {
      const nextCount = Math.max(0, reactions[rIdx].count - 1);
      if (nextCount === 0) reactions.splice(rIdx, 1);
      else reactions[rIdx] = { ...reactions[rIdx], count: nextCount };
    } else {
      reactions.push({ emoji, count: 1, byUserIds: [] });
    }
    const next = { ...cur, reactions } as MessageModel;
    const newList = [...list];
    newList[idx] = next;
    runInAction(() => {
      this.messagesByConversation.set(conversationId, newList);
      this._recomputeGroups(conversationId);
    });
    void putMessagesToDB([next]);
    void publishMessage(`chat.${conversationId}.reaction.toggle`, { messageId, emoji });
  }

  setTyping(conversationId: number, state: boolean) {
    this.typingByConversation.set(conversationId, state);
    void publishMessage(`chat.${conversationId}.typing`, { state });
  }

  isTyping(conversationId: number): boolean {
    return this.typingByConversation.get(conversationId) || false;
  }

  // mock: remote typing state (shown in UI)
  setRemoteTyping(conversationId: number, state: boolean) {
    this.remoteTypingByConversation.set(conversationId, state);
    emitIncoming(`chat.${conversationId}.typing`, { state });
  }

  isRemoteTyping(conversationId: number): boolean {
    return this.remoteTypingByConversation.get(conversationId) || false;
  }

  // mock: add an incoming message from the peer
  async addIncomingMessage(conversationId: number, text: string) {
    const existing = this.messagesByConversation.get(conversationId) || [];
    const last = existing[existing.length - 1];
    const seqNo = (last?.seqNo ?? 0) + 1;
    const id = `${conversationId}-in-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const msg: MessageModel = {
      id,
      conversationId,
      seqNo,
      sender: 'them',
      text,
      createdAt,
      reactions: [],
      views: { count: 0 },
      prevId: last?.id,
    };
    const merged = [...existing, msg];
    runInAction(() => {
      this.messagesByConversation.set(conversationId, merged);
      const curVis = this.getVisibleCount(conversationId);
      const nextVis = Math.max(curVis, merged.length);
      this.visibleCountByConversation.set(conversationId, nextVis);
      this._recomputeGroups(conversationId);
    });
    await putMessagesToDB([msg]);
    emitIncoming(`chat.${conversationId}.receive`, { id, conversationId, text, createdAt });
    return msg;
  }
}

export const messageStore = new MessageStore();
