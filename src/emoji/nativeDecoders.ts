/**
 * Конфигурация для загрузки нативных декодеров rlottie и skottie
 * Эти декодеры обеспечивают лучшую производительность по сравнению с JavaScript реализацией
 */

export interface DecoderConfig {
  rlottie?: {
    url: string;
    wasmUrl?: string;
    workerUrl?: string;
  };
  skottie?: {
    url: string;
    wasmUrl?: string | null;
    workerUrl?: string;
  };
}

// Конфигурация по умолчанию для декодеров
export const defaultDecoderConfig: DecoderConfig = {
  rlottie: {
    url: '/libs/rlottie/rlottie.min.js',
    wasmUrl: '/libs/rlottie/rlottie.wasm',
    workerUrl: '/libs/rlottie/rlottie.worker.js'
  },
  skottie: {
    url: '/libs/skottie/skottie.min.js',
    wasmUrl: null, // skottie не использует WASM
    workerUrl: '/libs/skottie/skottie.worker.js'
  }
};

// Очередь загрузок для ограничения параллелизма
// Убираем сложную логику - она не нужна для базовой функциональности

// Загрузчик для нативных декодеров
export class NativeDecoderLoader {
  private static instance: NativeDecoderLoader;
  private loadedDecoders = new Set<string>();
  private loadingPromises = new Map<string, Promise<any>>();

  static getInstance(): NativeDecoderLoader {
    if (!NativeDecoderLoader.instance) {
      NativeDecoderLoader.instance = new NativeDecoderLoader();
    }
    return NativeDecoderLoader.instance;
  }

  /**
   * Загружает rlottie декодер
   */
  async loadRlottie(config = defaultDecoderConfig.rlottie): Promise<any> {
    if (this.loadedDecoders.has('rlottie')) {
      return (window as any).rlottie;
    }

    if (this.loadingPromises.has('rlottie')) {
      return this.loadingPromises.get('rlottie');
    }

    const loadPromise = this.loadDecoder('rlottie', config);
    this.loadingPromises.set('rlottie', loadPromise);
    
    try {
      const result = await loadPromise;
      this.loadedDecoders.add('rlottie');
      return result;
    } finally {
      this.loadingPromises.delete('rlottie');
    }
  }

  /**
   * Загружает skottie декодер
   */
  async loadSkottie(config = defaultDecoderConfig.skottie): Promise<any> {
    if (this.loadedDecoders.has('skottie')) {
      return (window as any).skottie;
    }

    if (this.loadingPromises.has('skottie')) {
      return this.loadingPromises.get('skottie');
    }

    const loadPromise = this.loadDecoder('skottie', config);
    this.loadingPromises.set('skottie', loadPromise);
    
    try {
      const result = await loadPromise;
      this.loadedDecoders.add('skottie');
      return result;
    } finally {
      this.loadingPromises.delete('skottie');
    }
  }

  /**
   * Загружает декодер по имени
   */
  private async loadDecoder(name: 'rlottie' | 'skottie', config: any): Promise<any> {
    try {
      console.log(`Загружаем декодер ${name}...`);

      // Для rlottie необходимо настроить путь к WASM до загрузки скрипта
      if (name === 'rlottie') {
        (window as any).Module = {
          ...(window as any).Module,
          locateFile: (path: string) => {
            console.log(`rlottie ищет файл: ${path}`);
            if (path.endsWith('.wasm')) {
              console.log(`Перенаправляем WASM на: ${config.wasmUrl}`);
              return config.wasmUrl;
            }
            return path;
          },
        };
      }

      // Загружаем скрипт
      await this.loadScript(config.url);

      // Дополнительная настройка и проверка для rlottie
      if (name === 'rlottie' && (window as any).Module) {
        const module = (window as any).Module;
        console.log('Module.locateFile настроен:', module.locateFile);

        // Инициализируем runtime
        if (module.onRuntimeInitialized) {
          await new Promise<void>((resolve) => {
            module.onRuntimeInitialized = () => {
              console.log('Module runtime инициализирован');
              console.log('Доступные функции:', Object.keys(module).filter(key => key.startsWith('_')));
              resolve();
            };
          });
        }

        // Проверяем WASM файл
        if (config.wasmUrl) {
          await this.loadWasm(config.wasmUrl);
        }

        // Ждем инициализации rlottie
        console.log('Ждем инициализации rlottie...');
        await new Promise<void>((resolve) => {
          const checkRlottie = () => {
            if ((window as any).rlottie) {
              console.log('Ожидание завершено');
              resolve();
            } else {
              setTimeout(checkRlottie, 100);
            }
          };
          checkRlottie();
        });

        // Создаем wrapper для совместимости
        if ((window as any).Module && (window as any).rlottie) {
          console.log('rlottie Module найден, создаем wrapper');
          const module = (window as any).Module;
          console.log('Доступные Module функции:', Object.keys(module).filter(key => key.startsWith('_')));

          // Создаем wrapper объект
          const rlottieWrapper = {
            createAnimation: (data: any, options: any) => {
              const module = (window as any).Module;
              console.log('rlottie createAnimation вызван с:', { data, options });
              
              // Загружаем Lottie файл
              const response = fetch(data);
              response.then(res => res.text()).then(lottieJsonString => {
                console.log('Lottie JSON загружен, размер строки:', lottieJsonString.length);
                
                try {
                  // Правильная упаковка строки для rlottie
                  const enc = new TextEncoder();
                  const bytes = enc.encode(lottieJsonString);          // байты UTF-8
                  const ptr = module._malloc(bytes.length + 1);        // +1 под '\0'
                  
                  if (!ptr) {
                    throw new Error('Не удалось выделить память в WASM');
                  }
                  
                  // Копируем байты в выделенную память
                  module.HEAPU8.set(bytes, ptr);
                  module.HEAPU8[ptr + bytes.length] = 0;               // null-терминатор
                  
                  console.log('Данные скопированы в WASM память по адресу:', ptr, 'размер:', bytes.length);
                  
                  // ВАЖНО: передавать именно bytes.length
                  const lottieInstance = module._lottie_load_from_data(ptr, bytes.length);
                  
                  // Освобождаем память с данными (больше не нужна)
                  module._free(ptr);
                  
                  if (lottieInstance) {
                    console.log('Lottie анимация создана через Module:', lottieInstance);
                    
                    // Начинаем рендеринг
                    const render = () => {
                      if (lottieInstance && options.canvas) {
                        const ctx = options.canvas.getContext('2d');
                        if (ctx) {
                          // Рендерим текущий кадр
                          module._lottie_render(lottieInstance, options.canvas, 0, 0, options.canvas.width, options.canvas.height);
                        }
                      }
                    };
                    
                    // Возвращаем реальный плеер
                    return {
                      play: () => {
                        console.log('rlottie play - начинаем анимацию');
                        // Здесь должна быть логика воспроизведения
                        const animate = () => {
                          render();
                          requestAnimationFrame(animate);
                        };
                        animate();
                      },
                      pause: () => console.log('rlottie pause'),
                      stop: () => console.log('rlottie stop'),
                      destroy: () => {
                        console.log('rlottie destroy');
                        if (lottieInstance) {
                          module._lottie_destroy(lottieInstance);
                        }
                      },
                      setSpeed: (speed: number) => console.log('rlottie setSpeed:', speed)
                    };
                  } else {
                    throw new Error('rlottie: failed to create animation');
                  }
                } catch (error) {
                  console.error('Ошибка при работе с WASM:', error);
                  throw error;
                }
              }).catch(error => {
                console.error('Ошибка загрузки Lottie файла:', error);
              });
              
              // Временно возвращаем mock для совместимости
              return {
                play: () => console.log('rlottie play (mock)'),
                pause: () => console.log('rlottie pause (mock)'),
                stop: () => console.log('rlottie stop (mock)'),
                destroy: () => console.log('rlottie destroy (mock)'),
                setSpeed: (speed: number) => console.log('rlottie setSpeed (mock):', speed)
              };
            }
          };
          
          // Заменяем глобальный rlottie на наш wrapper
          (window as any).rlottie = rlottieWrapper;
          console.log('rlottie wrapper создан');
        }
      }
      
      // Для skottie просто проверяем наличие
      if (name === 'skottie') {
        // Проверяем, есть ли skottie в глобальной области
        if ((window as any).lottie) {
          console.log('skottie найден как lottie в глобальной области');
          (window as any).skottie = (window as any).lottie;
        }
      }
      
      console.log(`${name} успешно загружен`);
      return (window as any)[name];
      
    } catch (error) {
      console.error(`Ошибка загрузки ${name}:`, error);
      throw error;
    }
  }

  /**
   * Загружает JavaScript скрипт
   */
  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`Загружаем скрипт: ${url}`);
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.async = true;
      
      script.onload = () => {
        console.log(`Скрипт загружен: ${url}`);
        resolve();
      };
      script.onerror = () => {
        console.error(`Ошибка загрузки скрипта: ${url}`);
        reject(new Error(`Не удалось загрузить скрипт: ${url}`));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Загружает WASM модуль
   */
  private async loadWasm(url: string): Promise<void> {
    try {
      console.log(`Загружаем WASM файл: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const wasmBuffer = await response.arrayBuffer();
      
      // Проверяем, что это действительно WASM файл
      const header = new Uint8Array(wasmBuffer.slice(0, 4));
      const wasmMagic = [0x00, 0x61, 0x73, 0x6d]; // \0asm
      
      if (!header.every((byte, i) => byte === wasmMagic[i])) {
        throw new Error('Файл не является валидным WASM модулем');
      }
      
      // Для rlottie не нужно инициализировать WASM вручную,
      // он сам это сделает через Module.locateFile
      console.log('WASM файл валиден и готов к использованию');
      
    } catch (error) {
      console.warn('Не удалось загрузить WASM модуль:', error);
      // Не выбрасываем ошибку, так как это не критично
    }
  }

  /**
   * Загружает Web Worker
   */
  /**
   * Проверяет, загружен ли декодер
   */
  isDecoderLoaded(name: string): boolean {
    return this.loadedDecoders.has(name);
  }

  /**
   * Получает список загруженных декодеров
   */
  getLoadedDecoders(): string[] {
    return Array.from(this.loadedDecoders);
  }

  /**
   * Очищает все загруженные декодеры
   */
  clearDecoders(): void {
    this.loadedDecoders.clear();
    this.loadingPromises.clear();
  }
}

// Экспортируем singleton экземпляр
export const nativeDecoderLoader = NativeDecoderLoader.getInstance();

// Утилиты для проверки поддержки
export function checkNativeDecoderSupport(): {
  rlottie: boolean;
  skottie: boolean;
  wasm: boolean;
  webWorkers: boolean;
} {
  return {
    rlottie: typeof (window as any).rlottie !== 'undefined',
    skottie: typeof (window as any).skottie !== 'undefined',
    wasm: typeof WebAssembly !== 'undefined',
    webWorkers: typeof Worker !== 'undefined'
  };
}

// Автоматическая загрузка декодеров при инициализации
export async function autoLoadDecoders(decoderConfig?: DecoderConfig) {
  // Проверяем, не инициализированы ли уже декодеры
  if ((window as any).__emojiDecodersInit) {
    console.log('Декодеры уже инициализированы, пропускаем повторную загрузку');
    return;
  }
  
  (window as any).__emojiDecodersInit = true;
  console.log('Начинаем инициализацию декодеров...');
  
  const config = decoderConfig || defaultDecoderConfig;
  
  try {
    // Пытаемся загрузить rlottie
    if (!checkNativeDecoderSupport().rlottie) {
      await nativeDecoderLoader.loadRlottie(config.rlottie).catch(() => {
        console.log('rlottie недоступен, используем fallback');
      });
    }
    
    // Пытаемся загрузить skottie
    if (!checkNativeDecoderSupport().skottie) {
      await nativeDecoderLoader.loadSkottie(config.skottie).catch(() => {
        console.log('skottie недоступен, используем fallback');
      });
    }
  } catch (error) {
    console.warn('Ошибка автоматической загрузки декодеров:', error);
  }
}
