import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/models.dart';
import '../../shared/tokens/design_tokens.dart';
import 'widgets/chapter_ruler/chapter_ruler.dart';
import 'widgets/editor/chapter_editor.dart';
import 'widgets/fab_panel/fab_action_cluster.dart';

final _demoChapters = [
  Chapter(
    id: 'ch1',
    bookId: 'book1',
    title: 'Пролог: Ночная станция',
    subtitle: 'Как всё началось',
    status: ChapterStatus.edit,
    meta: {'genre': 'Sci-fi', 'audience': '16+', 'wordCount': '3720'},
  ),
  Chapter(
    id: 'ch2',
    bookId: 'book1',
    title: 'Глава 1. Сигналы в тумане',
    subtitle: 'Первые записи',
    status: ChapterStatus.draft,
    meta: {'genre': 'Sci-fi', 'audience': '16+', 'wordCount': '2980'},
  ),
  Chapter(
    id: 'ch3',
    bookId: 'book1',
    title: 'Глава 2. Архив воспоминаний',
    subtitle: 'Шёпоты железа',
    status: ChapterStatus.draft,
    meta: {'genre': 'Sci-fi', 'audience': '16+', 'wordCount': '4120'},
  ),
];

final chapterSummariesProvider = StateProvider<List<ChapterSummary>>((ref) {
  return List.generate(_demoChapters.length, (index) {
    final chapter = _demoChapters[index];
    return ChapterSummary(
      id: chapter.id,
      title: chapter.title,
      order: index,
      wordCount: 3500 + index * 620,
    );
  });
});

final currentChapterProvider = StateProvider<Chapter>((ref) => _demoChapters.first);

class BookWorkspaceScreen extends ConsumerWidget {
  const BookWorkspaceScreen({super.key, required this.bookId});

  final String bookId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summaries = ref.watch(chapterSummariesProvider);
    final chapter = ref.watch(currentChapterProvider);

    return LayoutBuilder(
      builder: (context, constraints) {
        final isDesktop = constraints.maxWidth >= 1024;
        final isTablet = constraints.maxWidth >= 600 && constraints.maxWidth < 1024;

        final ruler = SizedBox(
          width: isDesktop ? 104 : 84,
          child: ChapterRuler(
            chapters: summaries,
            activeChapterId: chapter.id,
            onSelect: (chapterId) {
              final next = _demoChapters.firstWhere((element) => element.id == chapterId);
              ref.read(currentChapterProvider.notifier).state = next;
            },
            onAdd: () {},
            onReorder: (oldIndex, newIndex) {
              final notifier = ref.read(chapterSummariesProvider.notifier);
              final list = [...notifier.state];
              if (newIndex > oldIndex) newIndex -= 1;
              final item = list.removeAt(oldIndex);
              list.insert(newIndex, item.copyWith(order: newIndex));
              notifier.state = [
                for (var i = 0; i < list.length; i++)
                  list[i].copyWith(order: i),
              ];
            },
          ),
        );

        final editor = Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.gutter),
            child: ChapterEditor(chapter: chapter),
          ),
        );

        final fabPanel = Align(
          alignment: Alignment.bottomRight,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.outer),
            child: FabActionCluster(
              onStartStop: () {},
              onOpenComposer: () {},
              onPreviewTts: () {},
            ),
          ),
        );

        if (isDesktop) {
          return Scaffold(
            body: SafeArea(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  ruler,
                  editor,
                  Expanded(
                    child: Stack(
                      children: [
                        const SizedBox.expand(),
                        fabPanel,
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        return Scaffold(
          body: SafeArea(
            child: Column(
              children: [
                SizedBox(height: isTablet ? 96 : 82, child: ruler),
                Expanded(child: editor),
              ],
            ),
          ),
          floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
          floatingActionButton: FabActionCluster(
            onStartStop: () {},
            onOpenComposer: () {},
            onPreviewTts: () {},
          ),
        );
      },
    );
  }
}
