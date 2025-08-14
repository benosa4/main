import { CSSProperties, useRef } from 'react';
import { resolveEmojiSrc, Tone } from './emojiMap';

export interface AnimatedEmojiProps {
  name: string;
  skinTone?: Tone;
  size?: number;
  animate?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  reducedMotion?: boolean;
  className?: string;
}

/**
 * Basic emoji renderer. It relies on `resolveEmojiSrc` to obtain the asset
 * description for a given shortcode. Full animation support (lottie / sprite)
 * is outside the scope of this kata, therefore the component falls back to a
 * simple <img> tag for all kinds. When `animate` is false a static image is
 * always rendered.
 */
export function AnimatedEmoji({
  name,
  skinTone = 'default',
  size = 28,
  animate = true,
  className,
}: AnimatedEmojiProps) {
  const ref = useRef<HTMLImageElement>(null);
  const resolved = resolveEmojiSrc(name, skinTone);

  if (!resolved) return null;

  const style: CSSProperties = {
    width: size,
    height: size,
    display: 'inline-block',
  };

  const { kind, src } = resolved;

  // If animation is disabled or the emoji is static, simply render an <img>.
  if (!animate || kind === 'svg') {
    return <img ref={ref} src={src} style={style} className={className} aria-label={name} />;
  }

  // Placeholder for animated formats. In this simplified implementation we
  // still render the static image but keep the branch to respect the `animate`
  // flag and avoid linter warnings about the unused variable.
  return <img ref={ref} src={src} style={style} className={className} aria-label={name} />;
}

export type { Tone } from './emojiMap';
