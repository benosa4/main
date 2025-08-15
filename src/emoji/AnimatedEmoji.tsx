import { CSSProperties, useEffect, useRef, useState } from 'react';
import {
  createPlayer,
  disposePlayer,
  isSupported as lottieSupported,
} from '@tamtam-chat/lottie-player';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  // Lottie через воркер и OffscreenCanvas
  useEffect(() => {
    if (!canvasRef.current || kind !== 'lottie' || !src) return;
    if (!shouldAnimate || !lottieSupported) return;
    setFailed(false);
    let disposed = false;
    const canvas = canvasRef.current;
    try {
      const player = createPlayer({
        canvas,
        movie: src,
        loop: true,
        width: size,
        height: size,
        id: src,
      });
      return () => {
        disposed = true;
        disposePlayer(player);
      };
    } catch {
      if (!disposed) setFailed(true);
    }
  }, [src, kind, shouldAnimate, size]);

  if (!resolved) return null;

  if (kind === 'lottie') {
    const fallback = src
      ?.replace('/lottie/', '/svg/')
      .replace(/\.json$/, '.webp');
    if (shouldAnimate && !failed && lottieSupported) {
      return (
        <canvas
          ref={canvasRef}
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
