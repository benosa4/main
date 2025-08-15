import { CSSProperties, useEffect, useRef, useState } from 'react';
import {
  createPlayer,
  disposePlayer,
  isSupported as lottieSupported,
} from '@tamtam-chat/lottie-player';
import { 
  createAdvancedLottiePlayer, 
  checkDecoderSupport,
  SUPPORT 
} from './AdvancedLottiePlayer';
import { resolveEmojiSrc, Tone } from './emojiMap';

export interface AnimatedEmojiProps {
  name: string;            // shortcode, напр. ':smile:'
  skinTone?: Tone;
  size?: number;           // px
  animate?: boolean;       // проигрывать анимацию (для пикера можно true/false)
  reducedMotion?: boolean; // уважать prefers-reduced-motion
  className?: string;
  onClick?: () => void;
  respectReducedMotion?: boolean; // автоматически определять prefers-reduced-motion
  useAdvancedPlayer?: boolean; // использовать расширенный плеер с OffscreenCanvas
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
  respectReducedMotion = true,
  useAdvancedPlayer = true, // использовать расширенный плеер
}: AnimatedEmojiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const [decoderSupport, setDecoderSupport] = useState<any>(null);
  const [useAdvanced, setUseAdvanced] = useState(false);

  const resolved = resolveEmojiSrc(name, skinTone);
  const kind = resolved?.kind;
  const src = resolved?.src;
  const meta = resolved?.meta;
  
  // Автоматически определяем prefers-reduced-motion если включено
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Проверяем поддержку декодеров и определяем, какой плеер использовать
  useEffect(() => {
    if (useAdvancedPlayer) {
      checkDecoderSupport().then(support => {
        setDecoderSupport(support);
        // Используем расширенный плеер если поддерживаются Web Workers и OffscreenCanvas
        setUseAdvanced(support.offscreenCanvas && SUPPORT.webWorkers);
      });
    } else {
      setUseAdvanced(false);
    }
  }, [useAdvancedPlayer]);
  
  useEffect(() => {
    if (respectReducedMotion) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [respectReducedMotion]);
  
  const shouldAnimate = animate && !reducedMotion && !prefersReducedMotion;

  const baseStyle: CSSProperties = {
    width: size,
    height: size,
    display: 'block',      // ровная геометрия ячейки
    boxSizing: 'border-box',
    border: '1px solid transparent', // временно для отладки
  };

  // Lottie через расширенный плеер с OffscreenCanvas и Web Workers
  useEffect(() => {
    if (!canvasRef.current || kind !== 'lottie' || !src) return;
    if (!shouldAnimate) return;
    
    setFailed(false);
    let disposed = false;
    const canvas = canvasRef.current;
    
    // Устанавливаем размеры canvas
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    
    console.log(`Инициализируем canvas для ${name}, размер: ${size}x${size}, src: ${src}`);
    
    const initPlayer = async () => {
      try {
        // Определяем, какой плеер использовать
        let player;
        
        console.log(`[${name}] decoderSupport:`, decoderSupport);
        console.log(`[${name}] useAdvancedPlayer:`, useAdvancedPlayer);
        console.log(`[${name}] SUPPORT.offscreenCanvas:`, SUPPORT.offscreenCanvas);
        console.log(`[${name}] window.rlottie:`, (window as any).rlottie);
        console.log(`[${name}] window.skottie:`, (window as any).skottie);
        console.log(`[${name}] window.lottie:`, (window as any).lottie);
        console.log(`[${name}] Условие для нативного плеера:`, {
          useAdvancedPlayer,
          decoderSupportExists: !!decoderSupport,
          decoderSupportWasm: decoderSupport?.wasm,
          offscreenCanvas: SUPPORT.offscreenCanvas,
          condition: useAdvancedPlayer && decoderSupport && decoderSupport.wasm && SUPPORT.offscreenCanvas
        });
        
        // Пытаемся использовать расширенный плеер если включен
        if (useAdvancedPlayer && SUPPORT.offscreenCanvas) {
          try {
            // Проверяем поддержку декодеров
            const hasNativeDecoders = (window as any).rlottie || (window as any).skottie;
            
            if (hasNativeDecoders) {
              console.log(`[${name}] Нативные декодеры доступны, пытаемся использовать`);
              
              // Проверяем размер файла для выбора декодера
              const MAX_RLOTTIE_BYTES = 200_000; // 200KB лимит для rlottie
              const fileSize = src.includes('lottie') ? 50000 : 0; // Примерный размер
              
              // Используем нативные декодеры
              if ((window as any).rlottie && fileSize <= MAX_RLOTTIE_BYTES) {
                console.log(`Используем rlottie напрямую для ${name} (размер: ${fileSize} байт)`);
                console.log(`Canvas размеры: ${canvas.width}x${canvas.height}, стили: ${canvas.style.width}x${canvas.style.height}`);
                player = (window as any).rlottie.createAnimation(src, {
                  canvas: canvas,
                  loop: true,
                  autoplay: true
                });
                console.log(`rlottie плеер создан:`, player);
              } else if ((window as any).skottie) {
                console.log(`Используем skottie для ${name} (размер: ${fileSize} байт, rlottie лимит: ${MAX_RLOTTIE_BYTES})`);
                console.log(`Canvas размеры: ${canvas.width}x${canvas.height}, стили: ${canvas.style.width}x${canvas.style.height}`);
                player = (window as any).skottie.createAnimation(src, {
                  canvas: canvas,
                  loop: true,
                  autoplay: true
                });
                console.log(`skottie плеер создан:`, player);
              }
              
              if (player) {
                console.log(`Нативный декодер инициализирован для ${name}`);
              }
            } else {
              console.log(`[${name}] Нативные декодеры недоступны, используем стандартный плеер`);
            }
          } catch (error) {
            console.warn(`Расширенный плеер не удался для ${name}:`, error);
            player = null;
          }
        }
        
        // Если расширенный плеер не сработал, используем стандартный
        if (!player && lottieSupported) {
           try {
             console.log(`Создаем стандартный плеер для ${name} с canvas:`, canvas);
             console.log(`Canvas размеры: ${canvas.width}x${canvas.height}, стили: ${canvas.style.width}x${canvas.style.height}`);
             player = createPlayer({
               canvas,
               movie: src,
               loop: true,
               width: size,
               height: size,
               id: src,
             });
             console.log(`Стандартный плеер инициализирован для ${name}:`, player);
           } catch (error) {
             console.warn(`Стандартный плеер не удался для ${name}:`, error);
             player = null;
           }
         }
         
         if (!player) {
           throw new Error('Не удалось инициализировать ни один Lottie плеер');
         }
         
         console.log(`[${name}] Итоговый плеер:`, player);
         console.log(`[${name}] Тип плеера:`, typeof player);
         console.log(`[${name}] Методы плеера:`, Object.keys(player));
         
         return player;
      } catch (error) {
        console.error('Ошибка инициализации Lottie:', error);
        if (!disposed) setFailed(true);
        return null;
      }
    };
    
    initPlayer().then(player => {
      if (player && !disposed) {
        // Плеер успешно инициализирован
        console.log(`Lottie анимация загружена для ${name} с ${useAdvancedPlayer ? 'расширенным' : 'стандартным'} плеером`);
        console.log(`[${name}] Плеер после инициализации:`, player);
        
        // Проверяем, что canvas видимый
        const canvas = canvasRef.current;
        if (canvas) {
          console.log(`[${name}] Canvas после инициализации:`, {
            width: canvas.width,
            height: canvas.height,
            styleWidth: canvas.style.width,
            styleHeight: canvas.style.height,
            offsetWidth: canvas.offsetWidth,
            offsetHeight: canvas.offsetHeight,
            clientWidth: canvas.clientWidth,
            clientHeight: canvas.clientHeight,
            visible: canvas.offsetWidth > 0 && canvas.offsetHeight > 0
          });
        }
      }
    });
    
    return () => {
      disposed = true;
      // Очистка будет выполнена автоматически при размонтировании
    };
  }, [src, kind, shouldAnimate, size, useAdvancedPlayer, decoderSupport, name]);

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
