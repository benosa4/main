import 'package:flutter/material.dart';
import '../models/work.dart';
import '../models/chapter.dart';
import '../widgets/billing_bar.dart';
import '../widgets/work_meta_header.dart';
import '../widgets/progress_block.dart';
import '../widgets/chapter_card.dart';

class NotebookOutlineView extends StatefulWidget {
  final Work work;
  final List<Chapter> chapters;
  final VoidCallback? onDictate;
  final VoidCallback? onEdit;
  final VoidCallback? onOpenMap;
  final VoidCallback? onAddNode;
  final VoidCallback? onMore;
  final void Function(Chapter chapter)? onReadChapter;
  final void Function(Chapter chapter)? onEditChapter;
  final void Function(Chapter chapter)? onVoiceChapter;
  final void Function(Chapter chapter)? onOpenChapter;

  const NotebookOutlineView({
    super.key,
    required this.work,
    required this.chapters,
    this.onDictate,
    this.onEdit,
    this.onOpenMap,
    this.onAddNode,
    this.onMore,
    this.onReadChapter,
    this.onEditChapter,
    this.onVoiceChapter,
    this.onOpenChapter,
  });

  /// Демонстрационный экран
  factory NotebookOutlineView.demo({WorkType type = WorkType.book}) {
    final work = Work(
      id: 'w1',
      title: type == WorkType.book ? 'Путешествие героя' : 'Карту мира',
      type: type,
      tags: type == WorkType.book ? const ['Фэнтези'] : const ['Мир', 'Связи'],
      words: 45230,
      sections: 12,
      updatedAt: DateTime.now().subtract(const Duration(hours: 2)),
    );
    final ch = <Chapter>[
      const Chapter(
        id: 'c1',
        title: 'Глава 1: Обычный мир',
        words: 3245,
        status: ChapterStatus.done,
        excerpt: 'Знакомство с главным героем…',
      ),
      const Chapter(
        id: 'c2',
        title: 'Глава 2: Зов приключений',
        words: 2890,
        status: ChapterStatus.done,
        excerpt: 'Появление проблемы или вызова…',
      ),
      const Chapter(
        id: 'c3',
        title: 'Глава 3: Отказ от зова',
        words: 1234,
        status: ChapterStatus.inProgress,
        excerpt: 'Герой сомневается и отказывается…',
      ),
    ];
    return NotebookOutlineView(work: work, chapters: ch);
  }

  @override
  State<NotebookOutlineView> createState() => _NotebookOutlineViewState();
}

class _NotebookOutlineViewState extends State<NotebookOutlineView> {
  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final completed = widget.chapters.where((c) => c.status == ChapterStatus.done).length;

    return Scaffold(
      appBar: AppBar(
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
      body: Column(
        children: [
          const BillingBar(credits: 2450, micTime: Duration(minutes: 45), requests: 120),
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                WorkMetaHeader(
                  work: widget.work,
                  // для book
                  onDictate: widget.onDictate ?? () {},
                  onEdit: widget.onEdit ?? () {},
                  // для mindmap
                  onOpenMap: widget.work.isMindmap ? widget.onOpenMap : null,
                  onAddNode: widget.work.isMindmap ? widget.onAddNode : null,
                  onMore: widget.onMore,
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                  child: Text(widget.work.contentTitle,
                      style: t.textTheme.titleMedium!.copyWith(fontWeight: FontWeight.w800)),
                ),
                ProgressBlock(completed: completed, total: widget.work.sections),
                const SizedBox(height: 4),
                ...widget.chapters.map((c) => ChapterCard(
                      ch: c,
                      onRead: () => widget.onReadChapter?.call(c),
                      onEditOrContinue: () => widget.onEditChapter?.call(c),
                      onVoice: () => widget.onVoiceChapter?.call(c),
                      onOpen: widget.onOpenChapter != null ? () => widget.onOpenChapter!(c) : null,
                    )),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
