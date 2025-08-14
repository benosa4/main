// src/emoji/AnimatedEmoji.tsx
export type EmojiKind = 'lottie'|'sprite'|'svg';

export interface AnimatedEmojiProps {
  name: string;            // ':thumbs_up:' (ключ в EMOJI_MAP)
  size?: number;           // px, default 32
  loop?: boolean;          // default true
  autoplay?: boolean;      // default true
  className?: string;
  onClick?: () => void;
  // internal:
  reducedMotion?: boolean; // переопределить media query, если нужно
}
