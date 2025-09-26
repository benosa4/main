# UI Компоненты и сценарии навигации

Документ описывает полный набор экранов, ключевых компонентов и общие принципы визуального языка «Calm Neon» для Flutter-приложения Voicebook. Материал синхронизирован с текущей структурой проекта (`lib/features/...`) и отражает дизайн-замысел, чтобы команда разработки, дизайна и тестирования видела единую картину.

## Визуальный язык: «Calm Neon»

- **Цвета**: Primary `#6366F1`, Secondary `#8B5CF6`, Accent `#06B6D4`, Error `#DF3F40`, Border `#E3E6EA`.
- **Градиенты**: 225° от Primary → Secondary, 225° от Secondary → Accent.
- **Стекло**: `BackdropFilter(blur: 12–16)` + прозрачность 8–12%, светлый бордер 1 px с `#E3E6EA` (12% opacity).
- **Типографика**: Inter/System Sans. Заголовки — weight 500, текст — 400. Размеры: Display 32, H1 28, H2 24, Body 16, Caption 13.
- **Радиусы и отступы**: базовый радиус 16 dp (24 dp для FAB), `AppSpacing.outer = 20`, `AppSpacing.gutter = 16`.
- **Анимации**: hover/tap 90–120 мс ease-out, FAB/панели 220–260 мс cubic `(0.2, 0.8, 0.2, 1)`, перетаскивание — мягкая spring.
- **Особенности**: мягкое «дыхание» фоновых градиентов (8–12 с цикл), аккуратные фокус-ринги 2 px primary, скелетоны с shimmer.

## Карта навигации (go_router)

| Экран | Путь | Вложенные маршруты / параметры | Переходы |
|-------|------|--------------------------------|----------|
| Онбординг | `/onboarding` | – | После подтверждения разрешений → `/library` |
| Библиотека | `/library` | – | Tap по книге → `/book/:bookId` |
| Рабочее пространство | `/book/:bookId` | `structure` (modal), `ai/composer` (drawer), `export?bookId`, `voice/training`, `settings` | Из FAB-панели и шапки |
| Mindmap | `/book/:bookId/structure?chapterId=` | `state.extra` — `List<SceneNode>` | Открывается из кнопки «Структура» |
| AI-Composer | `/ai/composer` | Drawer-панель | Жест/кнопка «Сформировать текст» |
| Тренировка голоса | `/voice/training` | – | FAB → «Озвучить» без профиля |
| Экспорт | `/export?bookId=` | – | Меню книги или FAB → «Экспорт» |
| Настройки | `/settings` | – | Меню профиля/бургер |

## Компоненты по экранам

### 0. Онбординг & разрешения (`features/onboarding`)

**Основные блоки**
- `HeroCarousel` — 3–4 слайда с иллюстрациями, перелистывание `PageView`, индикаторы-чипы с glow на hover.
- `BenefitCard` — иконка + текст, стеклянная карточка.
- `PermissionCard` — карточки для микрофона, уведомлений, файлов; состояния: idle, requesting, granted, denied.
- `LanguagePicker` — чипы RU/EN/… (флаги, подписи, selected-обводка).
- `PrimaryCTA` — большая кнопка «Начать диктовку»; подсветка успеха.

**Микровзаимодействия**
- Фоновая анимация градиента.
- Хаптик и подсказка при отказе в разрешении.

### 1. Библиотека (`features/library`)

**Компоненты**
- `GlassAppBar` + встроенный `GlassSearchField` (дебаунс 300 мс).
- `FilterChips` для тегов/статусов.
- `NotebookGrid` → `NotebookCard`: обложка-градиент, прогресс, дата, меню действий (Rename/Duplicate/Export/Archive).
- `FabCreate` (`FloatingActionButton.extended`) с быстрым меню: «Новая книга», «Импорт».
- `EmptyStateCard` — стеклянная карточка с call-to-action.

**Состояния**
- Loading — shimmer-карточки.
- Offline — баннер поверх списка.

### 2. Рабочее пространство книги (`features/book_workspace`)

Макет: адаптивные колонки с `ChapterRuler`, `ChapterEditor`, `FabActionCluster`.

**A. ChapterRuler**
- `ChapterTickRail` — фон с делениями, масштабируется (compact/normal) жестами.
- `ChapterPill` — пилюля с номером и заголовком, active glow.
- `ChapterReorderHandle` — видим на web при hover.
- `AddChapterButton` — стеклянная кнопка снизу.
- Состояния: idle, active, dragging, compact.

**B. ChapterEditor**
- `ChapterHeaderBar`: `TitleField`, `SubtitleField`, `MetaChips`, `StructureButton`, `SaveIndicator`.
- `RichTextEditor` на `flutter_quill` + `InlineToolbar`.
- `AIPromptHintsPopover` — плавающие AI-подсказки.
- `WordCountChip` — слова/символы.
- Состояния: autosave pending/done, selection active, ASR insert (highlight wave).

**C. FabActionCluster**
- `MicButton` — центральная красная кнопка, уровни сигнала, состояния `idle → connecting → recording → finalizing → error`.
- `ComposeButton` — вызывает AI-Composer.
- `TTSButton` — предпрослушка.
- `LevelMeter` — горизонтальный спектр.

### 3. Структура главы — Mindmap (`features/structure_mindmap`)

- `GlassModalScaffold` — полупрозрачное модальное окно.
- `TreeView` (`flutter_treeview`) с `NodeCard` (тип сцены, иконка).
- `NodeToolbar` — добавить/переименовать/удалить, drag handles.
- `SearchInMap` — строка поиска.
- `ApplyToEditorButton` — вставка якорей.
- Undo/Redo для операций с деревом.

### 4. AI-Composer (`features/ai_composer`)

- `PresetChips` — Художественный / Науч-поп / Эссе / Диалог.
- `TemperatureSlider`, `EditStrengthSlider`, `TargetLengthStepper`.
- `ActionButtons`: Синопсис, План+сцены, Мостик, Перефразировать, Расширить, Упростить.
- `DiffViewer` — режимы Side-by-side / Inline, деликатные цвета diff.
- `ApplyBar` — «Принять всё», «Принять выделенное», отмена.
- `TokenUsageMeter` — расход AI-токенов.

### 5. Тренировка голоса (`features/voice_training`)

- `VoiceProfileCard` — имя, статус (training/ready/failed), язык.
- `ConsentCheckbox` — без галочки TTS запрещён.
- `ScriptList` — список фраз, индикатор прочитанных.
- `SampleRecorder` — запись с уровнем, кнопки start/stop.
- `QualityMeter` — цветная шкала качества (SNR).
- `TrainButton` + `StatusBadge`.

### 6. Экспорт (`features/export`)

- `FormatSelector` — текстовые (MD/DOCX/PDF/EPUB) и аудио (MP3/M4B) переключатели.
- `MetadataForm` — название, аннотация, жанры, ключевые слова.
- `CoverUploader` — превью обложки.
- `TOCList` — чекбоксы глав.
- `AudioOptions` — скорость, тон, отметка «Синтетическая озвучка».
- `ExportButton` + `ProgressModal` (progress bar, лог).
- `SuccessState` — анимация галочки, кнопки «Открыть», «Поделиться».

### 7. Настройки (`features/settings`)

- `SectionHeader` — ASR, AI, TTS, Синхронизация, Голосовые команды.
- `SwitchTile` — автопунктуация, голосовые команды.
- `DropdownTile` — язык ASR, AI-провайдер, лимиты.
- `VoiceDefaultPicker` — голос по умолчанию.
- `SyncModeSelector` — локально/облако.
- `HotwordsList` — редактирование ключевых команд.
- `AboutCard` — версия, политика.

## Общие состояния и микроанимации

- **ASR**: индикаторы ошибок (`network_error`, `perm_denied`, `low_signal`) — верхние баннеры, авто-повтор пакетов.
- **AI**: `rate_limited`, `provider_down` — дизейбл кнопок, tooltip «попробуйте позже».
- **TTS**: `voice_not_ready` → CTA в тренинг голоса.
- **Сохранение**: optimistic UI + «Сохранено»/«Сохранение…».
- **PWA**: офлайн-баннер, индикатор синхронизации Hive.

## UX-нюансы по платформам

- **Breakpoints**: ≤600 px — мобильный, 600–1024 px — tablet, ≥1024 px — desktop/web.
- **Клавиатурные шорткаты**: Cmd/Ctrl+B/I, Cmd/Ctrl+1/2, Cmd/Ctrl+Shift+M (AI), Cmd/Ctrl+R (ASR).
- **Haptics**: reorder глав, старт/стоп записи.
- **Доступность**: фокус-ринги, контраст ≥ 4.5:1, альтернативы жестам (кнопки +/- для масштаба линейки).

## Что проверять при приёмке

1. Линейка глав всегда видима и синхронизируется с редактором; drag-and-drop не теряет порядок.
2. Диктовка вставляет текст по курсору без разрушения форматирования.
3. AI-Composer показывает diff без мерцаний, применяет частично.
4. TTS недоступен без согласия, предпрослушка воспроизводит выделенный фрагмент.
5. Экспорт EPUB строит оглавление по главам, M4B — по трекам.
6. PWA устанавливается, офлайн открывает библиотеку и последние главы.

Документ может пополняться уточнениями по состояниям и системным требованиям (ASR, AI, TTS, экспорт) по мере реализации.
