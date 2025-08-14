import { CSSProperties, useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import { resolveEmojiSrc, Tone } from './emojiMap';

export interface AnimatedEmojiProps {
  name: string;            // shortcode, напр. ':smile:'
  skinTone?: Tone;
  size?: number;           // px
  animate?: boolean;       // проигрывать анимацию (для пикера можно true/false)
  reducedMotion?: boolean; // уважать prefers-reduced-motion
  className?: string;
  onClick?: () => void;
}

/**
 * Рендер эмодзи всех видов (svg/webp как img, lottie, sprite).
 * Если animate=false, у Lottie показываем 1-й кадр (goToAndStop(0)).
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
  const src = resolved?.src;
  const meta = resolved?.meta;
  const shouldAnimate = animate && !reducedMotion;

  const baseStyle: CSSProperties = {
    width: size,
    height: size,
    display: 'block',      // ровная геометрия ячейки
    boxSizing: 'border-box',
  };

  // Lottie
  useEffect(() => {
    if (!divRef.current || kind !== 'lottie' || !src) return;

    let anim: ReturnType<typeof lottie.loadAnimation> | null = null;
    let cancelled = false;

    fetch(src)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !divRef.current) return;
        anim = lottie.loadAnimation({
          container: divRef.current,
          animationData: data,
          loop: true,
          autoplay: shouldAnimate,
          renderer: 'svg',
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet',
            progressiveLoad: true,
            hideOnTransparent: true,
          },
        });
        if (!shouldAnimate) anim.goToAndStop(0, true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      anim?.destroy();
    };
  }, [src, kind, shouldAnimate]);

  if (!resolved) return null;

  if (kind === 'lottie') {
    return (
      <div
        ref={divRef}
        style={baseStyle}
        className={className}
        aria-label={name}
        onClick={onClick}
      />
    );
  }

  if (kind === 'sprite') {
    const frames = Math.max(1, parseInt(meta || '1', 10));
    const style: CSSProperties = {
      ...baseStyle,
      backgroundImage: `url(${src})`,
      backgroundSize: `${frames * 100}% 100%`,
      imageRendering: 'auto',
      animation: shouldAnimate
        ? `emoji-sprite ${frames * 160}ms steps(${frames}) infinite`
        : undefined,
      backgroundPosition: shouldAnimate ? undefined : '0 0',
    };
    return (
      <div
        ref={divRef}
        style={style}
        className={className}
        aria-label={name}
        onClick={onClick}
      />
    );
  }

  return (
    <img
      src={src}
      style={baseStyle}
      className={className}
      aria-label={name}
      onClick={onClick}
    />
  );
}

export type { Tone } from './emojiMap';
