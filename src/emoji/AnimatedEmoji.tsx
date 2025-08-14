import { CSSProperties, useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import { resolveEmojiSrc, Tone } from './emojiMap';

export interface AnimatedEmojiProps {
  name: string;
  skinTone?: Tone;
  size?: number;
  animate?: boolean;
  reducedMotion?: boolean;
  className?: string;
  onClick?: () => void;
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
  reducedMotion = false,
  className,
  onClick,
}: AnimatedEmojiProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const resolved = resolveEmojiSrc(name, skinTone);
  const kind = resolved?.kind;
  const src = resolved?.src || '';
  const meta = resolved?.meta;

  const baseStyle: CSSProperties = {
    width: size,
    height: size,
    display: 'inline-block',
  };
  const shouldAnimate = animate && !reducedMotion;

  useEffect(() => {
    if (!divRef.current || kind !== 'lottie') return;
    const anim = lottie.loadAnimation({
      container: divRef.current,
      path: src,
      loop: true,
      autoplay: shouldAnimate,
    });
    if (!shouldAnimate) anim.goToAndStop(0, true);
    return () => anim.destroy();
  }, [src, kind, shouldAnimate]);

  if (!resolved) return null;

  if (kind === 'lottie') {
    return <div ref={divRef} style={baseStyle} className={className} aria-label={name} onClick={onClick} />;
  }

  if (kind === 'sprite') {
    const frames = parseInt(meta || '1', 10);
    const style: CSSProperties = {
      ...baseStyle,
      backgroundImage: `url(${src})`,
      backgroundSize: `${frames * 100}% 100%`,
    };
    if (shouldAnimate) {
      style.animation = `emoji-sprite ${frames * 80}ms steps(${frames}) infinite`;
    } else {
      style.backgroundPosition = '0 0';
    }
    return <div ref={divRef} style={style} className={className} aria-label={name} onClick={onClick} />;
  }

  return <img src={src} style={baseStyle} className={className} aria-label={name} onClick={onClick} />;
}

export type { Tone } from './emojiMap';
