# Voicebook

Voicebook — мультиплатформенный (Android + Web/PWA) голос‑первый редактор книг на Flutter 3.22+ и Dart 3. Проект включает модульную архитектуру, Riverpod для управления состоянием и go_router для навигации.

## Структура каталогов

```
lib/
  app/                 # точка входа, тема, маршрутизатор
  core/                # модели, API, хранилище, аналитика
  features/
    onboarding/
    library/
    book_workspace/
      widgets/chapter_ruler/
      widgets/editor/
      widgets/fab_panel/
    structure_mindmap/
    ai_composer/
    voice_training/
    export/
    settings/
  shared/              # дизайн-токены, общие UI-компоненты и утилиты
```

## Основные технологии

- **Состояние:** Riverpod (`flutter_riverpod`)
- **Маршрутизация:** `go_router` c поддержкой web `UrlPathStrategy.path`
- **Редактор:** `flutter_quill`
- **Аудио:** `record` для записи, `just_audio` для воспроизведения
- **Структура:** `flutter_treeview`, `drag_and_drop_lists`
- **Хранилище:** `hive`, `hive_flutter`, `hive_web`
- **Сеть:** `dio`, `web_socket_channel`
- **i18n:** `flutter_localizations`

## Запуск

1. Установите зависимости Flutter (3.22+) и запустите `flutter pub get`.
2. Для web включите `--web-renderer canvaskit` для лучшего отображения стеклянных панелей.
3. Стартуйте приложение:
   ```bash
   flutter run -d chrome
   ```
   либо
   ```bash
   flutter run -d android
   ```

## Дальнейшие шаги

- Реализовать загрузку/сохранение данных в Hive и синхронизацию с сервером.
- Подключить реальные сокеты ASR, API AI Composer и TTS.
- Заполнить UI состояниями, анимациями и интегрировать горячие клавиши и офлайн-режим PWA.
