import { resolveEmojiSrc, Tone } from './emojiMap';

/**
 * Convert an emoji shortcode and tone to the corresponding native Unicode string.
 */
export function nameToNative(name: string, tone: Tone = 'default'): string | null {
  const resolved = resolveEmojiSrc(name, tone);
  if (!resolved) return null;
  const file = resolved.src.split('/').pop()?.split('.')[0];
  if (!file) return null;
  try {
    return file
      .split('_')
      .map((cp) => String.fromCodePoint(parseInt(cp, 16)))
      .join('');
  } catch {
    return null;
  }
}
