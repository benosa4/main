import { natsStore } from './model';

export interface NatsPublishResult {
  ok: true;
  subject: string;
}

export async function publishMessage(subject: string, payload: unknown): Promise<NatsPublishResult> {
  const body = JSON.stringify(payload);
  natsStore.pushLog({ ts: Date.now(), dir: 'out', subject, payload: body });
  // simulate async i/o
  await new Promise((r) => setTimeout(r, 50));
  return { ok: true, subject };
}

