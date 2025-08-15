import { CSSProperties, useEffect, useRef, useState } from 'react';
import lottie from 'lottie-web';
import { resolveEmojiSrc, Tone } from './emojiMap';

const lottieCache = new Map<string, unknown>();

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
 * Для Lottie при animate=false отображаем статичное изображение.
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
  const [failed, setFailed] = useState(false);

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
    if (!divRef.current || kind !== 'lottie' || !src || !shouldAnimate) return;

    let anim: ReturnType<typeof lottie.loadAnimation> | null = null;
    let cancelled = false;
    setFailed(false);
    (async () => {
      try {
        const data =
          lottieCache.get(src) ?? (await fetch(src).then((r) => r.json()));
        lottieCache.set(src, data);
        if (cancelled) return;
        anim = lottie.loadAnimation({
          container: divRef.current!,
          animationData: data as object,
          loop: true,
          autoplay: true,
          renderer: 'svg',
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet',
            progressiveLoad: true,
            hideOnTransparent: true,
          },
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      anim?.destroy();
    };
  }, [src, kind, shouldAnimate]);

  if (!resolved) return null;

  if (kind === 'lottie') {
    const fallback = src
      ?.replace('/lottie/', '/svg/')
      .replace(/\.json$/, '.webp');
    if (shouldAnimate && !failed) {
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
    return (
      <img
        src={fallback}
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
