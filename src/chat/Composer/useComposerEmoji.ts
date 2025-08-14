import { insertEmojiAtCaret } from '../../emoji';
import { Tone } from '../../emoji/emojiMap';

/**
 * Small helper around `insertEmojiAtCaret` used by the composer. It is exposed
 * as a hook to align with the project's React patterns.
 */
export function useComposerEmoji(root: HTMLElement | null) {
  return {
    insert: (name: string, tone: Tone = 'default') => {
      if (root) insertEmojiAtCaret({ root, name, tone });
    },
  };
}
