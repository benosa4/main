// src/shared/emoji/twemojify.ts
export const TWEMOJI_BASE =
  'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/';

// Unicode → codepoint(s) "1f469-200d-1f4bb"
export function toCodePoint(unicode: string, sep = '-') {
  const r: number[] = [];
  let c = 0;
  let p = 0;
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
  const tw = (globalThis as any).twemoji;
  if (!tw || typeof tw.parse !== 'function') {
    // Fallback: вернём текст без подмены (но не сломаем разметку)
    return (text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  return tw.parse(text, {
    base: TWEMOJI_BASE,
    folder: 'svg',
    ext: '.svg',
    className: 'twemoji'
  });
}
