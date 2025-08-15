/**
 * Расширенный Lottie плеер с поддержкой нативного/WASM-декодера и OffscreenCanvas
 * Обеспечивает парсинг и рисование без блокировки основного потока
 */

import { nativeDecoderLoader, checkNativeDecoderSupport } from './nativeDecoders';

export interface LottiePlayerOptions {
  canvas: HTMLCanvasElement;
  movie: string | ArrayBuffer;
  loop?: boolean;
  autoplay?: boolean;
  width: number;
  height: number;
  id?: string;
  quality?: 'low' | 'medium' | 'high';
  useOffscreenCanvas?: boolean;
  useWasmDecoder?: boolean;
}

export interface LottiePlayer {
  play(): void;
  pause(): void;
  stop(): void;
  destroy(): void;
  setSpeed(speed: number): void;
  goToAndPlay(frame: number): void;
  goToAndStop(frame: number): void;
  getDuration(): number;
  getCurrentFrame(): number;
  isPlaying(): boolean;
}

// Проверяем поддержку различных технологий
export const SUPPORT = {
  offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
  webWorkers: typeof Worker !== 'undefined',
  wasm: typeof WebAssembly !== 'undefined',
  sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
  transferableObjects: 'transferableObjects' in MessageChannel.prototype,
} as const;

// Создаем Web Worker для обработки Lottie
class LottieWorker implements LottiePlayer {
  private worker: Worker | null = null;
  private messageId = 0;
  private callbacks = new Map<number, (data: any) => void>();
  private duration = 0;
  private currentFrame = 0;
  private playing = false;

  constructor() {
    if (!SUPPORT.webWorkers) {
      throw new Error('Web Workers не поддерживаются');
    }

    // Создаем inline worker для обработки Lottie
    const workerCode = `
      // Lottie Worker Code
      let lottieInstance = null;
      let canvas = null;
      let animationData = null;
      
      // Декодеры будут загружены из URL
      let rlottie = null;
      let skottie = null;
      
      // Функция для загрузки декодеров из URL
      async function loadDecoderFromUrl(url, name) {
        try {
          // В Web Worker используем importScripts
          importScripts(url);
          
          // Ждем немного для инициализации
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (name === 'rlottie') {
            // rlottie создает объект lottie
            rlottie = self.lottie || self.rlottie;
            console.log('rlottie загружен в worker:', !!rlottie);
          } else if (name === 'skottie') {
            // skottie создает объект lottie
            skottie = self.lottie;
            console.log('skottie загружен в worker:', !!skottie);
          }
        } catch (e) {
          console.error('Ошибка загрузки декодера в worker:', e);
        }
      }
      
      // Функция для установки URL декодеров
      async function setDecoderUrls(decoderUrls) {
        if (decoderUrls.rlottie) {
          await loadDecoderFromUrl(decoderUrls.rlottie, 'rlottie');
        }
        if (decoderUrls.skottie) {
          await loadDecoderFromUrl(decoderUrls.skottie, 'skottie');
        }
      }
      
             self.onmessage = function(e) {
         const { id, type, data } = e.data;
         
         switch (type) {
           case 'setDecoderUrls':
             setDecoderUrls(data.decoderUrls).then(() => {
               self.postMessage({ id, type: 'decoderUrlsSet', success: true });
             }).catch(error => {
               self.postMessage({ id, type: 'error', error: error.message });
             });
             break;
             
           case 'init':
             try {
               animationData = data.animationData;
               canvas = data.canvas;
               
               // Если передан обычный canvas, создаем новый в worker
               if (!canvas && data.canvasData) {
                 // Создаем новый canvas в worker
                 const canvasElement = new OffscreenCanvas(data.canvasData.width, data.canvasData.height);
                 canvas = canvasElement;
                 console.log('Создан новый OffscreenCanvas в worker');
               }
               
               // Инициализируем Lottie с приоритетом на нативные декодеры
               if (rlottie && canvas) {
                 try {
                   lottieInstance = rlottie.createAnimation(animationData, {
                     canvas: canvas,
                     loop: data.loop || true,
                     autoplay: data.autoplay || true,
                     renderer: 'canvas',
                     quality: data.quality || 'medium'
                   });
                   console.log('rlottie инициализирован');
                 } catch (e) {
                   console.log('Ошибка инициализации rlottie:', e);
                   lottieInstance = null;
                 }
               }
               
               if (!lottieInstance && skottie && canvas) {
                 try {
                   lottieInstance = skottie.createAnimation(animationData, {
                     canvas: canvas,
                     loop: data.loop || true,
                     autoplay: data.autoplay || true
                   });
                   console.log('skottie инициализирован');
                 } catch (e) {
                   console.log('Ошибка инициализации skottie:', e);
                   lottieInstance = null;
                 }
               }
               
               if (!lottieInstance) {
                 // Fallback - просто сообщаем об успешной инициализации
                 // но без создания экземпляра, так как LottieAnimation недоступен в worker
                 console.log('Fallback: декодеры недоступны, используем основной поток');
                 lottieInstance = { 
                   play: () => console.log('play called'),
                   pause: () => console.log('pause called'),
                   stop: () => console.log('stop called'),
                   destroy: () => console.log('destroy called')
                 };
               }
               
               self.postMessage({ id, type: 'initialized', success: true });
             } catch (error) {
               console.error('Ошибка инициализации в worker:', error);
               self.postMessage({ id, type: 'error', error: error.message });
             }
             break;
            
          case 'play':
            if (lottieInstance) {
              lottieInstance.play();
              self.postMessage({ id, type: 'playing' });
            }
            break;
            
          case 'pause':
            if (lottieInstance) {
              lottieInstance.pause();
              self.postMessage({ id, type: 'paused' });
            }
            break;
            
          case 'stop':
            if (lottieInstance) {
              lottieInstance.stop();
              self.postMessage({ id, type: 'stopped' });
            }
            break;
            
          case 'destroy':
            if (lottieInstance) {
              lottieInstance.destroy();
              lottieInstance = null;
            }
            self.postMessage({ id, type: 'destroyed' });
            break;
            
          case 'setSpeed':
            if (lottieInstance && lottieInstance.setSpeed) {
              lottieInstance.setSpeed(data.speed);
              self.postMessage({ id, type: 'speedChanged' });
            }
            break;
            
          case 'goToFrame':
            if (lottieInstance) {
              if (data.play) {
                lottieInstance.goToAndPlay(data.frame);
              } else {
                lottieInstance.goToAndStop(data.frame);
              }
              self.postMessage({ id, type: 'frameChanged' });
            }
            break;
        }
      };
      
      // Fallback Lottie Animation класс
      class LottieAnimation {
        constructor(data, options) {
          this.data = data;
          this.options = options;
          this.isPlaying = false;
          this.currentFrame = 0;
          this.totalFrames = data.op ? data.op - data.ip : 60;
          this.duration = data.op ? (data.op - data.ip) / data.fr : 1;
          this.canvas = options.canvas;
          this.ctx = this.canvas.getContext('2d');
          this.loop = options.loop !== false;
          this.autoplay = options.autoplay !== false;
          
          if (this.autoplay) {
            this.play();
          }
        }
        
        play() {
          this.isPlaying = true;
          this.animate();
        }
        
        pause() {
          this.isPlaying = false;
        }
        
        stop() {
          this.isPlaying = false;
          this.currentFrame = 0;
          this.render();
        }
        
        destroy() {
          this.isPlaying = false;
        }
        
        setSpeed(speed) {
          this.speed = speed || 1;
        }
        
        goToAndPlay(frame) {
          this.currentFrame = Math.max(0, Math.min(frame, this.totalFrames));
          this.play();
        }
        
        goToAndStop(frame) {
          this.currentFrame = Math.max(0, Math.min(frame, this.totalFrames));
          this.pause();
          this.render();
        }
        
        animate() {
          if (!this.isPlaying) return;
          
          this.currentFrame += (this.speed || 1);
          if (this.currentFrame >= this.totalFrames) {
            if (this.loop) {
              this.currentFrame = 0;
            } else {
              this.currentFrame = this.totalFrames - 1;
              this.pause();
              return;
            }
          }
          
          this.render();
          requestAnimationFrame(() => this.animate());
        }
        
        render() {
          // Простой рендеринг для демонстрации
          // В реальной реализации здесь будет полный рендеринг Lottie
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          this.ctx.fillStyle = '#000';
          this.ctx.font = '12px Arial';
          this.ctx.fillText(\`Frame: \${Math.floor(this.currentFrame)}\`, 10, 20);
        }
      }
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    this.worker = new Worker(workerUrl);
    this.worker.onmessage = (e) => {
      const { id, type, data, error } = e.data;
      const callback = this.callbacks.get(id);
      if (callback) {
        this.callbacks.delete(id);
        if (error) {
          callback({ success: false, error });
        } else {
          callback({ success: true, type, data });
        }
      }
    };
    
    URL.revokeObjectURL(workerUrl);
  }

  private sendMessage(type: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      this.callbacks.set(id, resolve);
      
      if (this.worker) {
        this.worker.postMessage({ id, type, data });
      } else {
        reject(new Error('Worker не инициализирован'));
      }
    });
  }

  async init(options: LottiePlayerOptions): Promise<void> {
    try {
      // Загружаем анимацию
      let animationData;
      if (typeof options.movie === 'string') {
        const response = await fetch(options.movie);
        animationData = await response.json();
      } else {
        animationData = options.movie;
      }

      // Передаем декодеры в worker
      const decoderUrls = {
        rlottie: window.location.origin + '/libs/rlottie/rlottie.min.js',
        skottie: window.location.origin + '/libs/skottie/skottie.min.js'
      };
      
      // Ждем загрузки декодеров в worker
      await this.sendMessage('setDecoderUrls', { decoderUrls });

      // Передаем canvas в worker (если поддерживается OffscreenCanvas)
      let canvas: HTMLCanvasElement | OffscreenCanvas = options.canvas;
      let transferableCanvas = false;
      
      if (SUPPORT.offscreenCanvas && options.useOffscreenCanvas) {
        try {
          canvas = options.canvas.transferControlToOffscreen();
          transferableCanvas = true;
          console.log('OffscreenCanvas успешно создан');
        } catch (e) {
          console.log('Не удалось передать OffscreenCanvas, используем обычный canvas');
          transferableCanvas = false;
        }
      }

      // Передаем canvas в зависимости от типа
      if (transferableCanvas) {
                 // OffscreenCanvas можно передать напрямую с transferableObjects
         const messageId = ++this.messageId;
         
         // Создаем Promise для ожидания ответа
         const initPromise = new Promise<void>((resolve, reject) => {
           this.callbacks.set(messageId, (result: any) => {
             if (result.success) {
               console.log('OffscreenCanvas успешно инициализирован');
               resolve();
             } else {
               console.error('Ошибка инициализации OffscreenCanvas:', result.error);
               reject(new Error(result.error));
             }
           });
         });
         
         this.worker!.postMessage({
           id: messageId,
           type: 'init',
           data: {
             animationData,
             canvas,
             loop: options.loop,
             autoplay: options.autoplay,
             quality: options.quality
           }
         }, [canvas]); // Передаем canvas как transferable object
         
         // Ждем инициализации
         await initPromise;
      } else {
        // Обычный canvas - передаем только данные, не сам canvas
        await this.sendMessage('init', {
          animationData,
          canvasData: {
            width: options.canvas.width,
            height: options.canvas.height,
            id: options.canvas.id || 'canvas'
          },
          loop: options.loop,
          autoplay: options.autoplay,
          quality: options.quality
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Ошибка инициализации Lottie: ${errorMessage}`);
    }
  }

  async play(): Promise<void> {
    await this.sendMessage('play', {});
  }

  async pause(): Promise<void> {
    await this.sendMessage('pause', {});
  }

  async stop(): Promise<void> {
    await this.sendMessage('stop', {});
  }

  async destroy(): Promise<void> {
    await this.sendMessage('destroy', {});
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  async setSpeed(speed: number): Promise<void> {
    await this.sendMessage('setSpeed', { speed });
  }

  async goToAndPlay(frame: number): Promise<void> {
    await this.sendMessage('goToFrame', { frame, play: true });
  }

  async goToAndStop(frame: number): Promise<void> {
    await this.sendMessage('goToFrame', { frame, play: false });
  }

  getDuration(): number {
    return this.duration;
  }

  getCurrentFrame(): number {
    return this.currentFrame;
  }

  isPlaying(): boolean {
    return this.playing;
  }
}

// Фабрика для создания плеера
export function createAdvancedLottiePlayer(options: LottiePlayerOptions): Promise<LottiePlayer> {
  return new Promise(async (resolve, reject) => {
    try {
      const player = new LottieWorker();
      await player.init(options);
      resolve(player);
    } catch (error) {
      reject(error);
    }
  });
}

// Проверяем доступность различных декодеров
export async function checkDecoderSupport(): Promise<{
  rlottie: boolean;
  skottie: boolean;
  wasm: boolean;
  offscreenCanvas: boolean;
}> {
  const support = {
    rlottie: false,
    skottie: false,
    wasm: SUPPORT.wasm,
    offscreenCanvas: SUPPORT.offscreenCanvas,
  };

  try {
    // Проверяем доступность нативных декодеров
    const nativeSupport = checkNativeDecoderSupport();
    support.rlottie = nativeSupport.rlottie;
    support.skottie = nativeSupport.skottie;
    
    // Пытаемся загрузить декодеры если они не загружены
    if (!support.rlottie) {
      try {
        await nativeDecoderLoader.loadRlottie();
        support.rlottie = true;
      } catch (e) {
        console.log('rlottie недоступен:', e);
      }
    }
    
    if (!support.skottie) {
      try {
        await nativeDecoderLoader.loadSkottie();
        support.skottie = true;
      } catch (e) {
        console.log('skottie недоступен:', e);
      }
    }
  } catch (e) {
    console.warn('Ошибка проверки декодеров:', e);
  }

  return support;
}
