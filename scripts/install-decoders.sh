#!/bin/bash

# Скрипт для установки нативных декодеров rlottie и skottie
# Использование: ./scripts/install-decoders.sh

set -e

echo "🚀 Установка нативных декодеров для EmojiPicker..."

# Создаем директории
mkdir -p public/libs/rlottie
mkdir -p public/libs/skottie

echo "📁 Созданы директории для библиотек"

# Устанавливаем rlottie
echo "📥 Устанавливаем rlottie..."

# Пытаемся скачать с первого источника
if curl -f -s "https://raw.githubusercontent.com/morethanwords/rlottie-web/master/rlottie-wasm.js" > public/libs/rlottie/rlottie.min.js; then
    echo "✅ rlottie.min.js загружен с morethanwords/rlottie-web"
else
    echo "❌ Не удалось загрузить с первого источника"
fi

if curl -f -s "https://raw.githubusercontent.com/morethanwords/rlottie-web/master/rlottie-wasm.wasm" > public/libs/rlottie/rlottie.wasm; then
    echo "✅ rlottie.wasm загружен с morethanwords/rlottie-web"
else
    echo "❌ Не удалось загрузить WASM файл"
fi

if curl -f -s "https://raw.githubusercontent.com/morethanwords/rlottie-web/master/rlottie-worker.js" > public/libs/rlottie/rlottie.worker.js; then
    echo "✅ rlottie.worker.js загружен с morethanwords/rlottie-web"
else
    echo "❌ Не удалось загрузить worker файл"
fi

# Устанавливаем skottie (используем lottie-web)
echo "📥 Устанавливаем skottie..."

if curl -f -s "https://raw.githubusercontent.com/airbnb/lottie-web/master/build/player/lottie_canvas.min.js" > public/libs/skottie/skottie.min.js; then
    echo "✅ skottie.min.js загружен с airbnb/lottie-web"
else
    echo "❌ Не удалось загрузить skottie.min.js"
fi

if curl -f -s "https://raw.githubusercontent.com/airbnb/lottie-web/master/build/player/lottie_canvas_worker.min.js" > public/libs/skottie/skottie.worker.js; then
    echo "✅ skottie.worker.js загружен с airbnb/lottie-web"
else
    echo "❌ Не удалось загрузить skottie.worker.js"
fi

# Проверяем, что файлы загружены
echo "🔍 Проверяем загруженные файлы..."

if [ -f "public/libs/rlottie/rlottie.min.js" ]; then
    echo "✅ rlottie.min.js: $(wc -c < public/libs/rlottie/rlottie.min.js) байт"
else
    echo "❌ rlottie.min.js не найден"
fi

if [ -f "public/libs/rlottie/rlottie.wasm" ]; then
    echo "✅ rlottie.wasm: $(wc -c < public/libs/rlottie/rlottie.wasm) байт"
else
    echo "❌ rlottie.wasm не найден"
fi

if [ -f "public/libs/skottie/skottie.min.js" ]; then
    echo "✅ skottie.min.js: $(wc -c < public/libs/skottie/skottie.min.js) байт"
else
    echo "❌ skottie.min.js не найден"
fi

echo ""
echo "🎉 Установка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Убедитесь, что в main.tsx импортирован initializeEmojiPicker"
echo "2. Перезапустите приложение"
echo "3. Проверьте консоль браузера на наличие сообщений об инициализации"
echo ""
echo "🔧 Если что-то не работает, проверьте:"
echo "- Сетевые запросы в DevTools"
echo "- Консоль браузера на наличие ошибок"
echo "- Правильность путей к файлам"
