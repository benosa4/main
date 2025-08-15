# Emoji Picker Animations

## Обзор

EmojiPicker теперь поддерживает полноценные Lottie анимации с нативными/WASM-декодерами (rlottie/skottie), OffscreenCanvas и Web Workers для максимальной производительности без блокировки основного потока.

## Возможности

### Lottie Анимации
- Автоматическое воспроизведение Lottie файлов в формате JSON
- **Нативные декодеры**: rlottie и skottie для максимальной производительности
- **WASM поддержка**: WebAssembly декодеры для быстрого парсинга
- **OffscreenCanvas**: Рендеринг в отдельном потоке без блокировки UI
- **Web Workers**: Парсинг и обработка в фоновом режиме
- Fallback на статичные изображения при ошибках или отключенных анимациях
- Поддержка всех тонов кожи (skin tones)

### Оптимизация Производительности
- Анимации автоматически приостанавливаются при прокрутке
- Анимации активируются только при взаимодействии пользователя (наведение/фокус)
- Виртуализация для больших списков эмодзи

### Доступность
- Автоматическое определение `prefers-reduced-motion`
- Возможность отключения анимаций для пользователей с ограниченными возможностями
- Поддержка клавиатурной навигации

## Использование

### Базовое использование
```tsx
<EmojiPicker
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onPick={handleEmojiPick}
  animateInsidePicker={true} // включить анимации
/>
```

### Расширенные настройки
```tsx
<EmojiPicker
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onPick={handleEmojiPick}
  animateInsidePicker={true}
  pauseAnimationsOnBlur={true} // приостанавливать анимации при потере фокуса
  gridCellSize={40} // размер ячейки эмодзи
/>
```

### AnimatedEmoji компонент
```tsx
<AnimatedEmoji
  name=":smile:"
  size={28}
  animate={true}
  respectReducedMotion={true} // автоматически определять prefers-reduced-motion
/>
```

## Конфигурация

### emojiConfig
```typescript
export const emojiConfig = {
  animateSingleEmoji: true,      // анимации для одиночных эмодзи
  pickerAnimations: true,        // анимации в пикере
  defaultPickerAnimations: true, // анимации по умолчанию
  offscreenCanvas: false,        // будет установлено автоматически
  wasmDecoder: false,            // будет установлено автоматически
  useAdvancedPlayer: true,       // использовать расширенный плеер
  autoLoadDecoders: true,        // автоматически загружать декодеры
  preloadLottieFiles: false,     // предзагружать популярные Lottie файлы
  logLevel: 'info',              // уровень логирования
};
```

### Инициализация
```typescript
import { initializeEmojiPicker } from './emoji';

// Автоматическая инициализация с настройками по умолчанию
await initializeEmojiPicker();

// Или с кастомными настройками
await initializeEmojiPicker({
  autoLoadDecoders: true,
  preloadLottieFiles: true,
  enableOffscreenCanvas: true,
  enableWasmDecoder: true,
  logLevel: 'debug'
});
```

## Производительность

### Оптимизации
- **OffscreenCanvas**: Рендеринг в отдельном потоке без блокировки UI
- **Web Workers**: Парсинг и обработка Lottie в фоновом режиме
- **Нативные декодеры**: rlottie/skottie для максимальной скорости
- **WASM**: WebAssembly для быстрого парсинга JSON
- Анимации приостанавливаются при прокрутке (150ms задержка)
- Lottie плеер автоматически очищается при размонтировании
- Виртуализация списков для больших коллекций
- Автоматическая предзагрузка популярных эмодзи

### Мониторинг
- Автоматическое определение поддержки Lottie
- Fallback на статичные изображения при ошибках
- Логирование ошибок анимаций

## Поддерживаемые форматы

1. **Lottie** (`.json`) - приоритетный формат с анимациями
   - **rlottie**: Нативный C++ декодер (максимальная производительность)
   - **skottie**: Skia-основанный декодер (хорошая производительность)
   - **JavaScript**: Fallback декодер (универсальная поддержка)
2. **Sprite** (`.webp`) - анимированные спрайты
3. **SVG/WebP** - статичные изображения как fallback

### Декодеры (в порядке приоритета)
1. **rlottie** - нативный C++ декодер с WASM
2. **skottie** - Skia-основанный декодер
3. **JavaScript** - стандартный Lottie декодер

## Примеры

### Простой пикер
```tsx
<EmojiPicker
  open={showPicker}
  onClose={() => setShowPicker(false)}
  onPick={({ name, tone }) => console.log(name, tone)}
/>
```

### Пикер с кастомными настройками
```tsx
<EmojiPicker
  open={showPicker}
  onClose={() => setShowPicker(false)}
  onPick={handleEmojiPick}
  animateInsidePicker={true}
  pauseAnimationsOnBlur={false}
  gridCellSize={48}
  maxRecents={50}
  categoryOrder={['recent', 'smileys_and_emotions', 'people']}
/>
```

## Примечания

- Lottie файлы должны быть доступны по пути `/emoji/lottie/`
- Fallback изображения должны быть доступны по пути `/emoji/svg/`
- Анимации автоматически адаптируются к размеру контейнера
- Поддерживается темная и светлая темы

## Настройка нативных декодеров

### Установка rlottie
```bash
# Создайте директорию для библиотек
mkdir -p public/libs/rlottie/

# Скачайте rlottie с репозитория morethanwords/rlottie-web
wget https://raw.githubusercontent.com/morethanwords/rlottie-web/master/rlottie-wasm.js -O public/libs/rlottie/rlottie.min.js
wget https://raw.githubusercontent.com/morethanwords/rlottie-web/master/rlottie-wasm.wasm -O public/libs/rlottie/rlottie.wasm
wget https://raw.githubusercontent.com/morethanwords/rlottie-web/master/rlottie-worker.js -O public/libs/rlottie/rlottie.worker.js

# Или используйте альтернативный источник evgeny-nadymov/rlottie-wasm
# wget https://raw.githubusercontent.com/evgeny-nadymov/rlottie-wasm/master/dist/rlottie.min.js -O public/libs/rlottie/rlottie.min.js
# wget https://raw.githubusercontent.com/evgeny-nadymov/rlottie-wasm/master/dist/rlottie.wasm -O public/libs/rlottie/rlottie.wasm
```

### Установка skottie
```bash
# Создайте директорию для skottie
mkdir -p public/libs/skottie/

# Skottie доступен как часть lottie-web
# Скачайте с официального репозитория airbnb/lottie-web
wget https://raw.githubusercontent.com/airbnb/lottie-web/master/build/player/lottie_canvas.min.js -O public/libs/skottie/skottie.min.js
wget https://raw.githubusercontent.com/airbnb/lottie-web/master/build/player/lottie_canvas_worker.min.js -O public/libs/skottie/skottie.worker.js

# Или используйте npm/yarn для установки
# npm install lottie-web
# cp node_modules/lottie-web/build/player/lottie_canvas.min.js public/libs/skottie/skottie.min.js
```

### Альтернативная установка через npm
```bash
# Установите lottie-web
npm install lottie-web

# Скопируйте нужные файлы
mkdir -p public/libs/
cp -r node_modules/lottie-web/build/player/* public/libs/

# Или используйте CDN
# <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
```

### Автоматическая загрузка
Декодеры автоматически загружаются при инициализации EmojiPicker. Если они недоступны, используется JavaScript fallback.

**Примечание**: rlottie и skottie - это экспериментальные проекты. Для продакшена рекомендуется использовать официальный lottie-web с Web Workers для лучшей производительности.
