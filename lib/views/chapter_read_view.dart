import 'package:flutter/material.dart';
import '../models/chapter.dart';
import '../models/reading_prefs.dart';
import '../shared/tokens/design_tokens.dart';
import '../widgets/billing_bar.dart';
import '../widgets/compact_text_settings_bar.dart';
import '../widgets/measure_size.dart';
import '../widgets/reading_chrome_app_bar.dart';
import '../widgets/reading_progress_bar.dart';
import '../widgets/chapter_meta_bar.dart';

class ChapterReadView extends StatefulWidget {
  final String workId;
  final Chapter chapter;
  final String body;
  final VoidCallback? onEdit;
  final VoidCallback? onVoice;

  const ChapterReadView({
    super.key,
    required this.workId,
    required this.chapter,
    required this.body,
    this.onEdit,
    this.onVoice,
  });

  factory ChapterReadView.demo() {
    const body = '''
Джон проснулся, как всегда, в шесть утра. Солнечные лучи пробивались сквозь тонкие занавески его маленькой квартиры на окраине города. Он потянулся, зевнул и неохотно поднялся с кровати.

Каждое утро было одинаковым: душ, завтрак из овсянки и кофе, поездка на работу в переполненном автобусе. Джон работал бухгалтером в небольшой фирме уже пять лет, и каждый день казался копией предыдущего.

Но сегодня что-то было не так. Когда он открыл почтовый ящик, там лежало письмо без обратного адреса. Конверт был сделан из плотной бумаги кремового цвета, а его имя было написано элегантным почерком.

"Дорогой Джон", — начиналось письмо, — "Ваша жизнь вот-вот изменится навсегда..."
''';
    const ch = Chapter(
      id: 'c1',
      title: 'Глава 1: Обычный мир',
      words: 3245,
      status: ChapterStatus.inProgress,
      excerpt: '',
    );
    return const ChapterReadView(workId: 'w1', chapter: ch, body: body);
  }

  @override
  State<ChapterReadView> createState() => _ChapterReadViewState();
}

class _ChapterReadViewState extends State<ChapterReadView> {
  late final ReadingPrefs prefs;
  final ScrollController scrollController = ScrollController();
  double progress = 0;
  double bottomChromeHeight = 0;

  @override
  void initState() {
    super.initState();
    prefs = ReadingPrefs();
    scrollController.addListener(_onScroll);
    prefs.addListener(_onPrefsChanged);
  }

  @override
  void dispose() {
    scrollController.removeListener(_onScroll);
    scrollController.dispose();
    prefs.removeListener(_onPrefsChanged);
    prefs.dispose();
    super.dispose();
  }

  void _onPrefsChanged() => setState(() {});

  void _onScroll() {
    if (!scrollController.hasClients) return;
    final position = scrollController.position;
    final max = position.maxScrollExtent;
    final offset = position.pixels;
    final ratio = max <= 0 ? 0.0 : (offset / max).clamp(0.0, 1.0);
    if (ratio != progress) {
      setState(() => progress = ratio);
    }
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final viewInsets = mediaQuery.viewInsets.bottom;
    final viewPadding = mediaQuery.padding.bottom;
    final contentBottomPadding = bottomChromeHeight + viewPadding + 12;

    return Scaffold(
      resizeToAvoidBottomInset: false, // нижние панели поднимаем сами
      appBar: ReadingChromeAppBar(
        prefs: prefs,
        onBack: () => Navigator.pop(context),
        title: const Text('VoxBook Studio'),
        actions: const [
          IconButton(onPressed: null, icon: Icon(Icons.search), tooltip: 'Поиск'),
          IconButton(onPressed: null, icon: Icon(Icons.notifications_none), tooltip: 'Уведомления'),
          IconButton(onPressed: null, icon: Icon(Icons.settings_outlined), tooltip: 'Настройки'),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              const BillingBar(
                credits: 2450,
                micTime: Duration(minutes: 45),
                requests: 120,
              ),
              ChapterMetaBar(
                prefs: prefs,
                title: widget.chapter.title,
                words: widget.chapter.words,
                status: widget.chapter.status,
                subtitle: 'Как всё началось',
                genres: const ['Sci-fi'],
                audience: '16+',
                tags: const ['станция', 'интервью'],
                menuBuilder: (context) => const [
                  PopupMenuItem(value: 'bookmark', child: Text('Добавить закладку')),
                  PopupMenuItem(value: 'share', child: Text('Поделиться')),
                  PopupMenuItem(value: 'export', child: Text('Экспорт')),
                ],
                onMenuSelected: (value) {
                  // TODO: handle menu actions
                },
                onSave: (res) async {
                  // TODO: сохранить мету в модель/бэкенд
                },
              ),
              // ВЕСЬ блок чтения (прогресс + текст) на едином фоне prefs.bgColor
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: prefs.bgColor,
                    border: Border(
                      top: BorderSide(color: prefs.chromeBorder),
                    ),
                  ),
                  child: Column(
                    children: [
                      // Прогресс — часть «читательской» области
                      ReadingProgressBar(
                        progress: progress,
                        words: widget.chapter.words,
                        prefs: prefs,
                      ),
                      // Текст
                      Expanded(
                        child: Scrollbar(
                          controller: scrollController,
                          child: SingleChildScrollView(
                            controller: scrollController,
                            padding: EdgeInsets.fromLTRB(16, 4, 16, contentBottomPadding),
                            child: _ReadingBody(text: widget.body, prefs: prefs),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: AnimatedPadding(
              duration: const Duration(milliseconds: 160),
              curve: Curves.easeOut,
              padding: EdgeInsets.only(bottom: viewInsets),
              child: SafeArea(
                top: false,
                child: MeasureSize(
                  onChange: (size) => setState(() => bottomChromeHeight = size.height),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Компактная панель настроек чтения уже содержит градиент и обводку
                      CompactTextSettingsBar(prefs: prefs),
                      // Кнопки действий — под ту же тему
                      Material(
                        color: Colors.transparent,
                        elevation: 2,
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: prefs.chromeGradient,
                            border: Border(top: BorderSide(color: prefs.chromeBorder)),
                          ),
                          child: Container(
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                            child: Row(
                              children: [
                                Expanded(
                                  child: OutlinedButton.icon(
                                    onPressed: widget.onEdit,
                                    icon: const Icon(Icons.edit_outlined),
                                    label: const Text('Редактировать'),
                                    style: OutlinedButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: ElevatedButton.icon(
                                    onPressed: widget.onVoice,
                                    icon: const Icon(Icons.graphic_eq_rounded),
                                    label: const Text('Озвучить'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.primary,
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReadingBody extends StatelessWidget {
  final String text;
  final ReadingPrefs prefs;

  const _ReadingBody({required this.text, required this.prefs});

  @override
  Widget build(BuildContext context) {
    final style = prefs.bodyTextStyle(
      fontSize: prefs.fontSize,
      color: prefs.textColor,
    );
    return Text(text.trim(), style: style);
  }
}
