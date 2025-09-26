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

## Экранная карта и навигация

| Route | Экран | Переход | Примечание |
| --- | --- | --- | --- |
| `/onboarding` | Onboarding / Permissions | Fade → Library | Гард перенаправит обратно, если не выданы все разрешения. |
| `/library` | Library | Default | Карточки книг открывают рабочее пространство, меню ведёт в экспорт. |
| `/book/:bookId` | Book Workspace | Slide from right | Содержит линейку глав, редактор и панель действий. |
| `/book/:bookId/structure` | Mindmap Modal | Fade + Scale | Модальное дерево сцен поверх workspace. |
| `/ai/composer` | AI Composer Drawer | Slide from right | Открывается как выезжающий сайдбар. |
| `/voice/training` | Voice Training | Slide | Используется, если профиль голоса не готов. |
| `/export` | Export | Slide up | Требует `bookId`, иначе редиректит в библиотеку. |
| `/settings` | Settings | Slide | Доступна из библиотеки и workspace. |

## Мок-данные

- Библиотека заполняется тремя книгами (`mockNotebooks`) с метаданными, прогрессом и тегами.
- Для книги `Город из тумана` и других заданы главы со структурой сцен (`mockChapterMap`).
- Профиль голоса `Night Station` по умолчанию в статусе `training`, поэтому при попытке TTS открывается экран тренировки.
- Mindmap и AI Composer получают данные напрямую из провайдеров, что упрощает замену моков на реальные репозитории.

## Как ориентироваться в коде UI

- Все провайдеры приложения и моковые данные собраны в `lib/core/providers/app_providers.dart`.
- Основные экраны лежат в `lib/features`, вспомогательные виджеты — в подпапках (`book_workspace/widgets`, `library/widgets`).
- Навигация и анимации переходов описаны в `lib/app/router.dart` и соответствуют диаграммам маршрутов из постановки.

