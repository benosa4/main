import { describe, expect, it, beforeEach } from 'vitest';
import { bumpUsage, getTopRecents } from './emojiDb';

beforeEach(() => {
  localStorage.clear();
});

describe('emojiDb usage', () => {
  it('sorts recents by lastUsedAt then count', async () => {
    await bumpUsage(':smile:', 'default');
    await bumpUsage(':grin:', 'default');
    await bumpUsage(':smile:', 'default');
    const rows = await getTopRecents(10);
    expect(rows[0].name).toBe(':smile:');
    expect(rows[0].count).toBe(2);
    expect(rows[1].name).toBe(':grin:');
  });
});
