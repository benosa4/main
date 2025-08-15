# 🧪 Тестирование EmojiPicker с Lottie анимациями

## Что должно работать

### ✅ Успешная инициализация
В консоли браузера должны появиться сообщения:
```
[EmojiPicker] INFO: Начинаем инициализацию EmojiPicker...
[EmojiPicker] INFO: Поддержка браузера: {...}
[EmojiPicker] INFO: Загружаем нативные декодеры...
[EmojiPicker] INFO: Декодеры загружены
[EmojiPicker] INFO: EmojiPicker успешно инициализирован
```

### ✅ Загрузка декодеров
```
rlottie успешно загружен
skottie успешно загружен
```

### ✅ Работа анимаций
При открытии EmojiPicker:
- Все эмодзи должны анимироваться (Lottie анимации)
- Анимации не должны исчезать при наведении
- В консоли должны быть сообщения о инициализации плееров

## Как тестировать

### 1. Откройте DevTools (F12)
- Перейдите на вкладку Console
- Очистите консоль (Clear console)

### 2. Откройте EmojiPicker
- Нажмите на кнопку эмодзи в чате
- Должен открыться пикер с анимированными эмодзи

### 3. Проверьте консоль
Должны появиться сообщения:
```
rlottie инициализирован
skottie инициализирован
Fallback Lottie инициализирован
```

### 4. Проверьте анимации
- Эмодзи должны анимироваться постоянно
- При прокрутке анимации могут приостанавливаться
- При наведении анимации должны продолжать работать

## Возможные проблемы и решения

### ❌ "rlottie не найден в глобальной области"
**Решение**: Проверьте, что файл `/libs/rlottie/rlottie.min.js` загружен корректно

### ❌ "WebAssembly.instantiate(): expected magic word 00 61 73 6d"
**Решение**: Файл WASM поврежден, переустановите декодеры:
```bash
./scripts/install-decoders.sh
```

### ❌ "HTMLCanvasElement object could not be cloned"
**Решение**: Проблема с передачей canvas в worker. Проверьте поддержку OffscreenCanvas

### ❌ Анимации исчезают при наведении
**Решение**: Проверьте логику `shouldAnimate` в `EmojiPicker.tsx`

## Проверка поддержки браузера

В консоли должно быть что-то вроде:
```javascript
{
  rlottie: true,
  skottie: true,
  wasm: true,
  offscreenCanvas: true,
  webWorkers: true,
  sharedArrayBuffer: false,
  transferableObjects: true
}
```

## Fallback система

Если нативные декодеры не работают, EmojiPicker должен автоматически использовать:
1. **lottie-web** (JavaScript)
2. **Canvas fallback**
3. **Sprite анимации**

## Отладка

### Включить подробное логирование
В `main.tsx` измените:
```typescript
logLevel: 'debug'
```

### Проверить сетевые запросы
В DevTools -> Network проверьте загрузку:
- `/libs/rlottie/rlottie.min.js`
- `/libs/rlottie/rlottie.wasm`
- `/libs/skottie/skottie.min.js`

### Проверить Web Workers
В DevTools -> Sources -> Workers должны быть активные workers для Lottie
