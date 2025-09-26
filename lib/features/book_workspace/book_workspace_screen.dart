import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/models.dart';
import '../../shared/tokens/design_tokens.dart';
import 'widgets/chapter_ruler/chapter_ruler.dart';
import 'widgets/editor/chapter_editor.dart';
import 'widgets/fab_panel/fab_action_cluster.dart';

final currentChapterProvider = StateProvider<Chapter?>((ref) => null);

class BookWorkspaceScreen extends ConsumerWidget {
  const BookWorkspaceScreen({super.key, required this.bookId});

  final String bookId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chapter = ref.watch(currentChapterProvider);

    return LayoutBuilder(
      builder: (context, constraints) {
        final isDesktop = constraints.maxWidth >= 1024;
        final isTablet = constraints.maxWidth >= 600 && constraints.maxWidth < 1024;

        final ruler = SizedBox(
          width: isDesktop ? 88 : 64,
          child: ChapterRuler(
            chapters: const [],
            onSelect: (_) {},
            onAdd: () {},
            onReorder: (oldIndex, newIndex) {},
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
                        Container(),
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
                SizedBox(height: isTablet ? 88 : 72, child: ruler),
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
