import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:voicebook/core/providers/app_providers.dart';
import 'package:voicebook/features/book_outline/workspace_navigation.dart';
import 'package:voicebook/shared/mappers/chapter_view_mapper.dart';
import 'package:voicebook/views/chapter_read_view.dart';

class ChapterReadScreen extends ConsumerStatefulWidget {
  const ChapterReadScreen({super.key, required this.bookId, required this.chapterId});

  final String bookId;
  final String chapterId;

  @override
  ConsumerState<ChapterReadScreen> createState() => _ChapterReadScreenState();
}

class _ChapterReadScreenState extends ConsumerState<ChapterReadScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) {
        return;
      }
      prepareWorkspace(
        ref,
        bookId: widget.bookId,
        chapterId: widget.chapterId,
        intent: WorkspaceIntent.reading,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final chapter = ref.watch(chapterProvider((bookId: widget.bookId, chapterId: widget.chapterId)));

    if (chapter == null) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: Text('Глава не найдена. Вернитесь к оглавлению.')),
      );
    }

    final viewChapter = mapDomainChapterToView(chapter);
    final bodyText = chapter.body.trim().isEmpty
        ? 'Эта глава пока пустая. Перейдите в редактор, чтобы добавить текст.'
        : chapter.body;

    void openEditor({WorkspaceIntent intent = WorkspaceIntent.edit}) {
      prepareWorkspace(
        ref,
        bookId: widget.bookId,
        chapterId: widget.chapterId,
        intent: intent,
      );
      context.pushNamed('bookEditor', pathParameters: {'bookId': widget.bookId});
    }

    return ChapterReadView(
      workId: widget.bookId,
      chapter: viewChapter,
      body: bodyText,
      onEdit: () => openEditor(intent: WorkspaceIntent.edit),
      onVoice: () => openEditor(intent: WorkspaceIntent.edit),
    );
  }
}
