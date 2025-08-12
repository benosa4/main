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

// For local mocks: push an incoming message to the NATS log panel
export function emitIncoming(subject: string, payload: unknown) {
  const body = JSON.stringify(payload);
  natsStore.pushLog({ ts: Date.now(), dir: 'in', subject, payload: body });
}
