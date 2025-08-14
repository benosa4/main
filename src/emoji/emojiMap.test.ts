import { describe, expect, it } from 'vitest';
import { resolveEmojiSrc } from './emojiMap';

describe('resolveEmojiSrc', () => {
  it('falls back to default tone when variant missing', () => {
    const dark = resolveEmojiSrc(':smile:', 'dark');
    const def = resolveEmojiSrc(':smile:', 'default');
    expect(dark?.src).toBe(def?.src);
  });
});
