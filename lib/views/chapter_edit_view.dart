import 'package:flutter/material.dart';

import '../models/chapter.dart';
import '../models/reading_prefs.dart';
import '../shared/tokens/design_tokens.dart';
import '../widgets/billing_bar.dart';
import '../widgets/compact_text_settings_bar.dart';

class ChapterEditView extends StatefulWidget {
  final String workId;
  final Chapter chapter;
  final String initialText;
  final VoidCallback? onVoice;
  final VoidCallback? onEditMode;

  const ChapterEditView({
    super.key,
    required this.workId,
    required this.chapter,
    required this.initialText,
    this.onVoice,
    this.onEditMode,
  });

  factory ChapterEditView.demo() {
    const chapter = Chapter(
      id: 'c1',
      title: 'Пролог: Ночная станция',
      words: 131,
      status: ChapterStatus.inProgress,
      excerpt: '',
    );
    const body =
        'Также отмечаем эмоции собеседников и их реакцию на туман станции. '
        'Вчера вечером мы собрали черновики сессии и нашли сильные цитаты из интервью...';
    return const ChapterEditView(
      workId: 'w1',
      chapter: chapter,
      initialText: body,
    );
  }

  @override
  State<ChapterEditView> createState() => _ChapterEditViewState();
}

class _ChapterEditViewState extends State<ChapterEditView> {
  late final ReadingPrefs prefs;
  late final TextEditingController editorController;

  @override
  void initState() {
    super.initState();
    prefs = ReadingPrefs();
    prefs.addListener(_onPrefsChanged);
    editorController = TextEditingController(text: widget.initialText);
  }

  @override
  void dispose() {
    prefs.removeListener(_onPrefsChanged);
    prefs.dispose();
    editorController.dispose();
    super.dispose();
  }

  void _onPrefsChanged() => setState(() {});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final editorStyle = TextStyle(
      fontSize: prefs.fontSize,
      height: 1.6,
      color: prefs.textColor,
      fontFamily: prefs.fontFamily,
      fontFamilyFallback: prefs.fontFallback,
    );

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          tooltip: 'Назад',
          onPressed: () => Navigator.of(context).maybePop(),
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
      bottomNavigationBar: DecoratedBox(
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          border: Border(top: BorderSide(color: theme.dividerColor.withOpacity(.25))),
        ),
        child: SafeArea(
          top: false,
          minimum: const EdgeInsets.only(bottom: 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CompactTextSettingsBar(prefs: prefs),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: widget.onEditMode ?? () {},
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
                        onPressed: widget.onVoice ?? () {},
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
            ],
          ),
        ),
      ),
      body: Column(
        children: [
          const BillingBar(credits: 2450, micTime: Duration(minutes: 45), requests: 120),
          _ChapterHeader(title: widget.chapter.title, words: widget.chapter.words),
          Expanded(
            child: Container(
              color: prefs.bgColor,
              child: Scrollbar(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 160),
                  child: TextField(
                    controller: editorController,
                    maxLines: null,
                    minLines: 12,
                    keyboardType: TextInputType.multiline,
                    scrollPadding: const EdgeInsets.only(bottom: 200),
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      isCollapsed: true,
                    ),
                    style: editorStyle,
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
                Text(
                  '${_fmt(words)} слов',
                  style: theme.textTheme.bodySmall?.copyWith(color: captionColor),
                ),
              ],
            ),
          ),
          PopupMenuButton<String>(
            tooltip: 'Ещё',
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'ai', child: Text('Сформировать текст')),
              PopupMenuItem(value: 'dictate', child: Text('Диктовать')),
              PopupMenuItem(value: 'export', child: Text('Экспорт')),
            ],
          ),
        ],
      ),
    );
  }

  static String _fmt(int value) {
    final raw = value.toString();
    final buffer = StringBuffer();
    for (var i = 0; i < raw.length; i++) {
      final remaining = raw.length - i;
      buffer.write(raw[i]);
      if (remaining > 1 && remaining % 3 == 1) {
        buffer.write(' ');
      }
    }
    return buffer.toString();
  }
}
