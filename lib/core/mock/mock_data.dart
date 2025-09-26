import '../models/models.dart';

final mockNotebooks = <Notebook>[
  Notebook(
    id: 'book-city-mist',
    title: 'Город из тумана',
    tags: const ['Фантастика', 'Draft'],
    updatedAt: DateTime(2024, 7, 12, 16, 30),
    chapters: 12,
    words: 45213,
    audioMinutes: 95,
  ),
  Notebook(
    id: 'book-speech-guide',
    title: 'Практическое руководство по речи',
    tags: const ['Non-fiction'],
    updatedAt: DateTime(2024, 7, 11, 9, 10),
    chapters: 8,
    words: 28340,
    audioMinutes: 61,
  ),
  Notebook(
    id: 'book-travel-notes',
    title: 'Записки путешественника',
    tags: const ['Эссе', 'Audio-ready'],
    updatedAt: DateTime(2024, 7, 9, 20, 5),
    chapters: 15,
    words: 67201,
    audioMinutes: 120,
  ),
];

final mockChapterMap = <String, List<Chapter>>{
  'book-city-mist': [
    Chapter(
      id: 'ch-prologue',
      bookId: 'book-city-mist',
      title: 'Пролог: Ночная станция',
      subtitle: 'Как всё началось',
      status: ChapterStatus.edit,
      meta: {
        'genre': 'Sci-fi',
        'audience': '16+',
        'wordCount': '3720',
      },
      structure: const [
        SceneNode(
          id: 'scene-1',
          title: 'Сигнальная башня',
          children: [
            SceneNode(id: 'scene-1-1', title: 'Диспетчерская'),
            SceneNode(id: 'scene-1-2', title: 'Первый сигнал'),
          ],
        ),
        SceneNode(
          id: 'scene-2',
          title: 'Прибытие Ины',
          children: [
            SceneNode(id: 'scene-2-1', title: 'Журнал приёмов'),
            SceneNode(id: 'scene-2-2', title: 'Тайный пассажир'),
          ],
        ),
      ],
      body:
          'Станция дышала приглушённым гулом серверов, когда Ина сделала первую запись. Она стояла у микрофона и вслушивалась в туман, пытаясь понять, чей голос спрятан в шорохах эфира.',
    ),
    Chapter(
      id: 'ch-1',
      bookId: 'book-city-mist',
      title: 'Глава 1. Сигналы в тумане',
      subtitle: 'Первые записи',
      status: ChapterStatus.draft,
      meta: {
        'genre': 'Sci-fi',
        'audience': '16+',
        'wordCount': '2980',
      },
      structure: const [
        SceneNode(
          id: 'scene-3',
          title: 'Затишье перед сменой',
          children: [
            SceneNode(id: 'scene-3-1', title: 'Записанные шёпоты'),
          ],
        ),
        SceneNode(
          id: 'scene-4',
          title: 'Разговор у микрофонов',
          children: [
            SceneNode(id: 'scene-4-1', title: 'Спор Ины и Алекса'),
            SceneNode(id: 'scene-4-2', title: 'План экспедиции'),
          ],
        ),
      ],
      body:
          'Туман повис над станцией так плотно, будто сам эфир решил стать стеной. Алекс проверял уровни сигнала, а Ина вслушивалась в шёпоты, которые записались ночью. В них слышалась просьба о помощи.',
    ),
    Chapter(
      id: 'ch-2',
      bookId: 'book-city-mist',
      title: 'Глава 2. Архив воспоминаний',
      subtitle: 'Шёпоты железа',
      status: ChapterStatus.draft,
      meta: {
        'genre': 'Sci-fi',
        'audience': '16+',
        'wordCount': '4120',
      },
      structure: const [
        SceneNode(
          id: 'scene-5',
          title: 'Погружение в архив',
          children: [
            SceneNode(id: 'scene-5-1', title: 'Катакомбы памяти'),
            SceneNode(id: 'scene-5-2', title: 'Аварийный сигнал'),
          ],
        ),
      ],
      body:
          'В архиве запахло озоном и пылью. Стеллажи с плёнками уходили в темноту, а на мониторе оживали забытые голоса. Ина нашла старую кассету и включила её — из динамиков раздался голос, который она слышала в тумане.',
    ),
  ],
  'book-speech-guide': [
    Chapter(
      id: 'guide-ch-1',
      bookId: 'book-speech-guide',
      title: 'Глава 1. Разминка диктора',
      subtitle: 'Как настроить голос',
      status: ChapterStatus.final_,
      meta: {
        'genre': 'Non-fiction',
        'audience': 'Широкая',
        'wordCount': '2150',
      },
      structure: const [
        SceneNode(id: 'guide-scene-1', title: 'Дыхательная гимнастика'),
        SceneNode(id: 'guide-scene-2', title: 'Артикуляционная зарядка'),
      ],
      body:
          'Перед записью прогрейте голос: сделайте три глубоких вдоха, растягивайте губы и язык. Представьте, что каждое слово — это луч света, который вы направляете в микрофон.',
    ),
    Chapter(
      id: 'guide-ch-2',
      bookId: 'book-speech-guide',
      title: 'Глава 2. Работа с паузами',
      subtitle: 'Темп и логика',
      status: ChapterStatus.edit,
      meta: {
        'genre': 'Non-fiction',
        'audience': 'Широкая',
        'wordCount': '1860',
      },
      structure: const [
        SceneNode(id: 'guide-scene-3', title: 'Где делать паузы'),
        SceneNode(id: 'guide-scene-4', title: 'Упражнение «Метроном»'),
      ],
      body:
          'Паузы — главный инструмент темпа. Представьте метроном и говорите под его такт. Делайте короткие остановки перед важными словами, чтобы слушатель успел представить картину.',
    ),
  ],
  'book-travel-notes': [
    Chapter(
      id: 'travel-ch-1',
      bookId: 'book-travel-notes',
      title: 'Глава 1. На границе песков',
      subtitle: 'Запах шафрана',
      status: ChapterStatus.edit,
      meta: {
        'genre': 'Эссе',
        'audience': '16+',
        'wordCount': '3340',
      },
      structure: const [
        SceneNode(id: 'travel-scene-1', title: 'Раннее утро'),
        SceneNode(id: 'travel-scene-2', title: 'Базар и специи'),
      ],
      body:
          'Утро в оазисе начиналось с запаха шафрана. Торговцы раскладывали ткани, а я записывал истории путников. Их голоса становились заметками, которые позже сложились в эту главу.',
    ),
  ],
};

final mockVoiceProfile = VoiceProfile(
  id: 'voice-night-station',
  name: 'Night Station',
  kind: 'personal-neural',
  locale: 'ru-RU',
  status: VoiceProfileStatus.training,
  isConsentGiven: true,
);

final mockAppSettings = AppSettings(
  autoPunctuation: true,
  defaultLanguage: 'ru-RU',
  fallbackPolicy: 'WS → HTTP → Offline буфер',
  aiProvider: 'Voicebook AI',
  dailyTokenLimit: 12000,
  defaultAiPreset: 'Научно-популярный',
  usePersonalVoice: false,
  defaultVoice: 'Night Station v2',
  syncStrategy: 'cloud',
  voiceCommandsEnabled: true,
  voiceCommands: const ['"Новая глава"', '"Начать запись"', '"Перефразируй абзац"'],
);
