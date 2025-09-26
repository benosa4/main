import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/models/models.dart';
import '../../core/providers/app_providers.dart';
import '../../shared/tokens/design_tokens.dart';
import 'widgets/chapter_ruler/chapter_ruler.dart';
import 'widgets/editor/chapter_editor.dart';
import 'widgets/fab_panel/fab_action_cluster.dart';

class BookWorkspaceScreen extends ConsumerWidget {
  const BookWorkspaceScreen({super.key, required this.bookId});

  final String bookId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final storeState = ref.watch(voicebookStoreProvider);
    final book = ref.watch(bookProvider(bookId));
    final summaries = ref.watch(chapterSummariesProvider(bookId));
    final chapters = ref.watch(bookChaptersProvider(bookId));
    final currentChapter = ref.watch(currentChapterProvider(bookId));
    final voiceProfile = ref.watch(voiceProfileProvider);

    if (storeState.isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Рабочее пространство')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (storeState.hasError) {
      return Scaffold(
        appBar: AppBar(title: const Text('Рабочее пространство')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.outer),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline, size: 48),
                const SizedBox(height: 16),
                Text(
                  'Не удалось загрузить книгу. Вернитесь в библиотеку и попробуйте снова.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (chapters.isNotEmpty && (currentChapter == null ||
        !chapters.any((chapter) => chapter.id == currentChapter.id))) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(currentChapterIdProvider(bookId).notifier).state = chapters.first.id;
      });
    }

    if (book == null || currentChapter == null || voiceProfile == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Рабочее пространство')),
        body: const Center(
          child: Text('Книга недоступна в демо данных. Вернитесь в библиотеку.'),
        ),
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final isDesktop = constraints.maxWidth >= 1024;
        final isTablet = constraints.maxWidth >= 600 && constraints.maxWidth < 1024;

        final ruler = SizedBox(
          width: isDesktop ? 104 : 84,
          child: ChapterRuler(
            chapters: summaries,
            activeChapterId: currentChapter.id,
            onSelect: (chapterId) {
              ref.read(currentChapterIdProvider(bookId).notifier).state = chapterId;
            },
            onAdd: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Добавление новых глав включится в полной версии.')),
              );
            },
            onReorder: (oldIndex, newIndex) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Перестановка глав сохранится при подключении хранилища.')),
              );
            },
          ),
        );

        final editor = Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.gutter),
          child: ChapterEditor(chapter: currentChapter),
        );

        final fabPanel = Align(
          alignment: Alignment.bottomRight,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.outer),
            child: FabActionCluster(
              onStartStop: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Режим записи микрофона недоступен в демо.')),
                );
              },
              onOpenComposer: () => context.pushNamed('aiComposer'),
              onPreviewTts: () {
                if (voiceProfile.status == VoiceProfileStatus.ready) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Готовим предпрослушку голосом ${voiceProfile.name}...')),
                  );
                } else {
                  context.pushNamed('voiceTraining');
                }
              },
            ),
          ),
        );

        final appBar = AppBar(
          titleSpacing: 16,
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(book.title),
              if (chapters.isNotEmpty)
                Text(
                  currentChapter.title,
                  style: Theme.of(context).textTheme.bodyMedium,
                  overflow: TextOverflow.ellipsis,
                ),
            ],
          ),
          actions: [
            IconButton(
              tooltip: 'Экспорт',
              onPressed: () => context.pushNamed('export', queryParameters: {'bookId': bookId}),
              icon: const Icon(Icons.ios_share_outlined),
            ),
            IconButton(
              tooltip: 'Настройки',
              onPressed: () => context.pushNamed('settings'),
              icon: const Icon(Icons.settings_outlined),
            ),
          ],
        );

        if (isDesktop) {
          return Scaffold(
            appBar: appBar,
            body: SafeArea(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  ruler,
                  Expanded(child: editor),
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
          appBar: appBar,
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
            onStartStop: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Режим записи микрофона недоступен в демо.')),
              );
            },
            onOpenComposer: () => context.pushNamed('aiComposer'),
            onPreviewTts: () {
              if (voiceProfile.status == VoiceProfileStatus.ready) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Готовим предпрослушку голосом ${voiceProfile.name}...')),
                );
              } else {
                context.pushNamed('voiceTraining');
              }
            },
          ),
        );
      },
    );
  }
}
