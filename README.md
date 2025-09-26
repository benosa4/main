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

- Библиотека, главы и голосовой профиль загружаются через сервис `VoicebookApiService`, который в прототипе реализован классом `MockVoicebookApiService`.
- Мок-сервис возвращает те же данные, что раньше были доступны напрямую (`mockNotebooks`, `mockChapterMap`, `mockVoiceProfile`), но теперь с имитацией сетевой задержки.
- Профиль голоса `Night Station` по умолчанию в статусе `training`, поэтому при попытке TTS открывается экран тренировки.
- Mindmap и AI Composer получают данные напрямую из провайдеров, что упрощает замену моков на реальные репозитории.

## API мок-сервиса

Все экраны приложения обращаются к API через абстракцию `VoicebookApiService` (`lib/core/api/voicebook_api_service.dart`). Интерфейс повторяет основные REST-эндпоинты будущего бэкенда и возвращает данные в формате моделей из `lib/core/models`. Текущая реализация `MockVoicebookApiService` эмулирует сетевую задержку и отдаёт детерминированные мок-ответы.

| Метод | Эндпоинт | Описание | Ответ |
| --- | --- | --- | --- |
| `GET` | `/notebooks` | Список всех книг пользователя. | `List<Notebook>` |
| `GET` | `/notebooks/{bookId}` | Метаданные конкретной книги. | `Notebook?` (null, если книга не найдена) |
| `GET` | `/notebooks/{bookId}/chapters` | Все главы книги вместе со структурой сцен. | `List<Chapter>` |
| `GET` | `/notebooks/{bookId}/chapters/{chapterId}` | Отдельная глава. | `Chapter?` |
| `GET` | `/voice-profile` | Активный голосовой профиль для предпрослушки TTS. | `VoiceProfile` |

Сервис используется `VoicebookStore`, который кеширует ответы и обеспечивает синхронный доступ к данным UI-провайдеров. Для перехода на настоящий сервер достаточно предоставить новую реализацию `VoicebookApiService`.

## Как ориентироваться в коде UI

- Все провайдеры приложения и моковые данные собраны в `lib/core/providers/app_providers.dart`.
- Основные экраны лежат в `lib/features`, вспомогательные виджеты — в подпапках (`book_workspace/widgets`, `library/widgets`).
- Навигация и анимации переходов описаны в `lib/app/router.dart` и соответствуют диаграммам маршрутов из постановки.

