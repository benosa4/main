/**
 * Инициализация EmojiPicker с автоматической загрузкой декодеров
 * Этот файл должен быть импортирован в main.tsx для автоматической настройки
 */

import { autoLoadDecoders, checkNativeDecoderSupport } from './nativeDecoders';
import { emojiConfig } from './config';

// Интерфейс для конфигурации инициализации
export interface EmojiPickerInitOptions {
  autoLoadDecoders?: boolean;
  preloadLottieFiles?: boolean;
  enableOffscreenCanvas?: boolean;
  enableWasmDecoder?: boolean;
  logLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug';
  decoders?: {
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
  };
}

// Класс для управления инициализацией EmojiPicker
export class EmojiPickerInitializer {
  private static instance: EmojiPickerInitializer;
  private initialized = false;
  private options: EmojiPickerInitOptions;

  private constructor(options: EmojiPickerInitOptions = {}) {
    this.options = {
      autoLoadDecoders: true,
      preloadLottieFiles: false,
      enableOffscreenCanvas: true,
      enableWasmDecoder: true,
      logLevel: 'info',
      ...options
    };
  }

  static getInstance(options?: EmojiPickerInitOptions): EmojiPickerInitializer {
    if (!EmojiPickerInitializer.instance) {
      EmojiPickerInitializer.instance = new EmojiPickerInitializer(options);
    }
    return EmojiPickerInitializer.instance;
  }

  /**
   * Инициализирует EmojiPicker
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.log('info', 'EmojiPicker уже инициализирован');
      return;
    }

    try {
      this.log('info', 'Начинаем инициализацию EmojiPicker...');

      // Проверяем поддержку браузера
      const support = await this.checkBrowserSupport();
      this.log('info', 'Поддержка браузера:', support);

      // Автоматически загружаем декодеры если включено
      if (this.options.autoLoadDecoders) {
        await this.loadDecoders();
      }

      // Предзагружаем Lottie файлы если включено
      if (this.options.preloadLottieFiles) {
        await this.preloadLottieFiles();
      }

      // Обновляем конфигурацию
      this.updateConfig();

      this.initialized = true;
      this.log('info', 'EmojiPicker успешно инициализирован');
      
      // Вызываем событие инициализации
      this.dispatchEvent('emojiPickerInitialized', { support, config: emojiConfig });
      
    } catch (error) {
      this.log('error', 'Ошибка инициализации EmojiPicker:', error);
      throw error;
    }
  }

  /**
   * Проверяет поддержку браузера
   */
  private async checkBrowserSupport(): Promise<any> {
    const support = {
      ...checkNativeDecoderSupport(),
      offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
      webWorkers: typeof Worker !== 'undefined',
      wasm: typeof WebAssembly !== 'undefined',
      sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
      transferableObjects: 'transferableObjects' in MessageChannel.prototype,
    };

    return support;
  }

  /**
   * Загружает декодеры
   */
  private async loadDecoders(): Promise<void> {
    try {
      this.log('info', 'Загружаем нативные декодеры...');
      await autoLoadDecoders(this.options.decoders);
      this.log('info', 'Декодеры загружены');
    } catch (error) {
      this.log('warn', 'Не удалось загрузить декодеры:', error);
    }
  }

  /**
   * Предзагружает популярные Lottie файлы
   */
  private async preloadLottieFiles(): Promise<void> {
    try {
      this.log('info', 'Предзагружаем Lottie файлы...');
      
      // Список популярных эмодзи для предзагрузки
      const popularEmojis = [
        '/emoji/lottie/1f600.json', // 😀
        '/emoji/lottie/1f603.json', // 😃
        '/emoji/lottie/1f604.json', // 😄
        '/emoji/lottie/1f601.json', // 😁
        '/emoji/lottie/1f606.json', // 😆
        '/emoji/lottie/1f605.json', // 😅
        '/emoji/lottie/1f602.json', // 😂
        '/emoji/lottie/1f923.json', // 🤣
      ];

      // Создаем предзагрузчики
      const preloadPromises = popularEmojis.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await response.json(); // Загружаем и парсим JSON
            this.log('debug', `Предзагружен: ${url}`);
          }
        } catch (error) {
          // Игнорируем ошибки предзагрузки
        }
      });

      await Promise.allSettled(preloadPromises);
      this.log('info', 'Предзагрузка Lottie файлов завершена');
      
    } catch (error) {
      this.log('warn', 'Ошибка предзагрузки Lottie файлов:', error);
    }
  }

  /**
   * Обновляет конфигурацию
   */
  private updateConfig(): void {
    // Обновляем конфигурацию на основе возможностей браузера
    if (this.options.enableOffscreenCanvas && typeof OffscreenCanvas !== 'undefined') {
      emojiConfig.offscreenCanvas = true;
    }
    
    if (this.options.enableWasmDecoder && typeof WebAssembly !== 'undefined') {
      emojiConfig.wasmDecoder = true;
    }

    this.log('info', 'Конфигурация обновлена:', emojiConfig);
  }

  /**
   * Логирует сообщения
   */
  private log(level: string, message: string, ...args: any[]): void {
    if (this.options.logLevel === 'none') return;
    
    const levels = { none: 0, error: 1, warn: 2, info: 3, debug: 4 };
    const currentLevel = levels[this.options.logLevel || 'info'];
    const messageLevel = levels[level as keyof typeof levels] || 0;
    
    if (messageLevel <= currentLevel) {
      const prefix = `[EmojiPicker] ${level.toUpperCase()}:`;
      
      switch (level) {
        case 'error':
          console.error(prefix, message, ...args);
          break;
        case 'warn':
          console.warn(prefix, message, ...args);
          break;
        case 'info':
          console.info(prefix, message, ...args);
          break;
        case 'debug':
          console.debug(prefix, message, ...args);
          break;
      }
    }
  }

  /**
   * Вызывает событие
   */
  private dispatchEvent(name: string, detail: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    }
  }

  /**
   * Получает статус инициализации
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Получает текущие опции
   */
  getOptions(): EmojiPickerInitOptions {
    return { ...this.options };
  }

  /**
   * Обновляет опции
   */
  updateOptions(newOptions: Partial<EmojiPickerInitOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }
}

// Экспортируем singleton экземпляр
export const emojiPickerInitializer = EmojiPickerInitializer.getInstance();

// Функция для быстрой инициализации
export async function initializeEmojiPicker(options?: EmojiPickerInitOptions): Promise<void> {
  const initializer = EmojiPickerInitializer.getInstance(options);
  await initializer.initialize();
}

// Автоматическая инициализация при импорте (опционально)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Инициализируем после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeEmojiPicker().catch(console.error);
    });
  } else {
    // DOM уже загружен
    initializeEmojiPicker().catch(console.error);
  }
}

