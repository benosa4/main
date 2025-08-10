// src/shared/emoji/twemojify.ts
import twemoji from 'twemoji';

// Берём ассеты с jsDelivr (в 14.0.2 лежат в assets/svg и assets/72x72)
export const TWEMOJI_BASE =
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/';

// Unicode → codepoint(s) "1f469-200d-1f4bb"
export function toCodePoint(unicode: string, sep = '-') {
  const r: number[] = [];
  let c = 0, p = 0;
  for (let i = 0; i < unicode.length; i++) {
    c = unicode.charCodeAt(i);
    if (p) {
      r.push(((p - 0xd800) * 0x400 + (c - 0xdc00) + 0x10000) >>> 0);
      p = 0;
    } else if (0xd800 <= c && c <= 0xdbff) {
      p = c;
    } else {
      r.push(c);
    }
  }
  return r.map((x) => x.toString(16)).join(sep).toLowerCase();
}

export function emojiToSvgUrl(unicode: string) {
  const code = toCodePoint(unicode);
  return `${TWEMOJI_BASE}svg/${code}.svg`;
}

export function emojiToPngUrl(unicode: string) {
  const code = toCodePoint(unicode);
  return `${TWEMOJI_BASE}72x72/${code}.png`;
}

export function toTwemojiHTML(text: string) {
  try {
    return twemoji.parse(text || '', {
      base: TWEMOJI_BASE,
      folder: 'svg',
      ext: '.svg',
      className: 'twemoji',
    });
  } catch {
    // Fallback: вернём текст без подмены (но не сломаем разметку)
    return (text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
