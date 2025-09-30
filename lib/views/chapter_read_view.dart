import 'package:flutter/material.dart';

import '../models/chapter.dart';
import '../models/reading_prefs.dart';
import '../shared/tokens/design_tokens.dart';
import '../widgets/billing_bar.dart';
import '../widgets/compact_text_settings_bar.dart';
import '../widgets/measure_size.dart';
import '../widgets/reading_progress_bar.dart';

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
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          tooltip: 'Назад',
          onPressed: () {
            Navigator.of(context).maybePop();
          },
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.auto_stories, size: 22),
            SizedBox(width: 8),
            Text('VoxBook Studio'),
          ],
        ),
        actions: [
          IconButton(onPressed: () {}, tooltip: 'Поиск', icon: const Icon(Icons.search)),
          IconButton(onPressed: () {}, tooltip: 'Уведомления', icon: const Icon(Icons.notifications_none)),
          IconButton(onPressed: () {}, tooltip: 'Настройки', icon: const Icon(Icons.settings_outlined)),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              const BillingBar(credits: 2450, micTime: Duration(minutes: 45), requests: 120),
              _ChapterHeader(title: widget.chapter.title, words: widget.chapter.words),
              ReadingProgressBar(progress: progress, words: widget.chapter.words),
              Expanded(
                child: Container(
                  color: prefs.bgColor,
                  child: Scrollbar(
                    controller: scrollController,
                    child: SingleChildScrollView(
                      controller: scrollController,
                      padding: EdgeInsets.fromLTRB(16, 4, 16, contentBottomPadding),
                      child: _ReadingBody(text: widget.body, prefs: prefs),
                    ),
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
                      CompactTextSettingsBar(prefs: prefs),
                      Material(
                        color: Theme.of(context).cardColor,
                        elevation: 2,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                          decoration: BoxDecoration(
                            border: Border(top: BorderSide(color: Theme.of(context).dividerColor.withOpacity(.4))),
                          ),
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

class _ChapterHeader extends StatelessWidget {
  final String title;
  final int words;

  const _ChapterHeader({required this.title, required this.words});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final captionColor = theme.colorScheme.onSurface.withOpacity(.55);
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 8, 6),
      child: Row(
        children: [
          Expanded(
            child: Column(
              children: [
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text('${_fmt(words)} слов', style: theme.textTheme.bodySmall?.copyWith(color: captionColor)),
              ],
            ),
          ),
          PopupMenuButton<String>(
            tooltip: 'Ещё',
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'bookmark', child: Text('Добавить закладку')),
              PopupMenuItem(value: 'share', child: Text('Поделиться')),
              PopupMenuItem(value: 'export', child: Text('Экспорт')),
            ],
          ),
        ],
      ),
    );
  }

  static String _fmt(int n) {
    final s = n.toString();
    final buf = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      final p = s.length - i;
      buf.write(s[i]);
      if (p > 1 && p % 3 == 1) buf.write(' ');
    }
    return buf.toString();
  }
}

class _ReadingBody extends StatelessWidget {
  final String text;
  final ReadingPrefs prefs;

  const _ReadingBody({required this.text, required this.prefs});

  @override
  Widget build(BuildContext context) {
    final style = TextStyle(
      fontSize: prefs.fontSize,
      height: 1.6,
      color: prefs.textColor,
      fontFamily: prefs.fontFamily,
      fontFamilyFallback: prefs.fontFallback,
    );
    return Text(text.trim(), style: style);
  }
}
