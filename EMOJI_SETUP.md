# 🎨 Настройка EmojiPicker с Lottie анимациями

## Быстрая установка

### 1. Автоматическая установка декодеров
```bash
# Запустите скрипт установки
./scripts/install-decoders.sh
```

### 2. Проверка установки
```bash
# Убедитесь, что файлы загружены
ls -la public/libs/rlottie/
ls -la public/libs/skottie/
```

### 3. Запуск приложения
```bash
npm run dev
```

## Что происходит автоматически

✅ **EmojiPicker инициализируется** при запуске приложения  
✅ **Нативные декодеры загружаются** (rlottie, skottie)  
✅ **Lottie анимации включаются** во всех эмодзи  
✅ **OffscreenCanvas и Web Workers** активируются для производительности  
✅ **Fallback на JavaScript** если нативные декодеры недоступны  

## Проверка работы

1. Откройте DevTools (F12)
2. Откройте EmojiPicker
3. В консоли должны появиться сообщения:
   ```
   [EmojiPicker] INFO: Начинаем инициализацию EmojiPicker...
   [EmojiPicker] INFO: Декодеры загружены
   [EmojiPicker] INFO: EmojiPicker успешно инициализирован
   ```

## Ручная установка (если автоматическая не сработала)

### rlottie
```bash
mkdir -p public/libs/rlottie
wget https://raw.githubusercontent.com/morethanwords/rlottie-web/master/rlottie-wasm.js -O public/libs/rlottie/rlottie.min.js
wget https://raw.githubusercontent.com/morethanwords/rlottie-web/master/rlottie-wasm.wasm -O public/libs/rlottie/rlottie.wasm
```

### skottie
```bash
mkdir -p public/libs/skottie
wget https://raw.githubusercontent.com/airbnb/lottie-web/master/build/player/lottie_canvas.min.js -O public/libs/skottie/skottie.min.js
```

## Устранение проблем

### Анимации не работают
- Проверьте консоль на ошибки
- Убедитесь, что файлы декодеров загружены
- Проверьте поддержку Web Workers в браузере

### Декодеры не загружаются
- Проверьте сетевые запросы в DevTools
- Убедитесь, что GitHub доступен
- Попробуйте ручную установку

### Производительность низкая
- Убедитесь, что OffscreenCanvas поддерживается
- Проверьте, что Web Workers активны
- Рассмотрите использование CDN вместо локальных файлов

## Альтернативы

Если нативные декодеры не работают, EmojiPicker автоматически использует:
- **lottie-web** (JavaScript)
- **Canvas fallback** для рендеринга
- **Sprite анимации** для совместимости

## Поддержка

- 📖 [Подробная документация](src/emoji/README.md)
- 🐛 [Отчеты об ошибках](https://github.com/your-repo/issues)
- 💬 [Обсуждения](https://github.com/your-repo/discussions)

