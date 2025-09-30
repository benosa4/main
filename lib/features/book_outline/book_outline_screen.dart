import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:voicebook/core/models/notebook.dart';
import 'package:voicebook/core/providers/app_providers.dart';
import 'package:voicebook/features/book_outline/workspace_navigation.dart';
import 'package:voicebook/models/work.dart';
import 'package:voicebook/shared/mappers/chapter_view_mapper.dart';
import 'package:voicebook/views/notebook_outline_view.dart';

class BookOutlineScreen extends ConsumerWidget {
  const BookOutlineScreen({super.key, required this.bookId});

  final String bookId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notebook = ref.watch(bookProvider(bookId));
    final chapters = ref.watch(bookChaptersProvider(bookId));

    if (notebook == null) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: Text('Коллекция не найдена.')),
      );
    }

    final work = _mapNotebookToWork(notebook);
    final outlineChapters = chapters.map(mapDomainChapterToView).toList();
    final firstChapterId = outlineChapters.isNotEmpty ? outlineChapters.first.id : null;

    void openWorkspace({String? chapterId, WorkspaceIntent intent = WorkspaceIntent.list}) {
      prepareWorkspace(ref, bookId: bookId, chapterId: chapterId, intent: intent);
      context.pushNamed('bookEditor', pathParameters: {'bookId': bookId});
    }

    void openReader(String chapterId) {
      prepareWorkspace(ref, bookId: bookId, chapterId: chapterId, intent: WorkspaceIntent.reading);
      context.pushNamed(
        'chapterRead',
        pathParameters: {'bookId': bookId, 'chapterId': chapterId},
      );
    }

    void openMindmap({String? chapterId}) {
      prepareWorkspace(ref, bookId: bookId, chapterId: chapterId, intent: WorkspaceIntent.list);
      context.pushNamed(
        'mindmap',
        pathParameters: {'bookId': bookId},
        queryParameters: {
          if (chapterId != null) 'chapterId': chapterId,
        },
      );
    }

    return NotebookOutlineView(
      work: work,
      chapters: outlineChapters,
      onDictate: () => openWorkspace(chapterId: firstChapterId, intent: WorkspaceIntent.edit),
      onEdit: () => openWorkspace(chapterId: firstChapterId, intent: WorkspaceIntent.edit),
      onOpenMap: work.isMindmap ? () => openMindmap(chapterId: firstChapterId) : null,
      onAddNode: work.isMindmap ? () => openMindmap(chapterId: firstChapterId) : null,
      onMore: () {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Скоро добавим дополнительные действия.')),
        );
      },
      onReadChapter: (chapter) => openReader(chapter.id),
      onEditChapter: (chapter) => openWorkspace(chapterId: chapter.id, intent: WorkspaceIntent.edit),
      onVoiceChapter: (chapter) => openWorkspace(chapterId: chapter.id, intent: WorkspaceIntent.edit),
      onOpenChapter: (chapter) => openReader(chapter.id),
    );
  }
}

Work _mapNotebookToWork(Notebook notebook) {
  final type = _resolveWorkType(notebook);
  return Work(
    id: notebook.id,
    title: notebook.title,
    type: type,
    tags: notebook.tags,
    words: notebook.words,
    sections: notebook.chapters,
    updatedAt: notebook.updatedAt,
    icon: type == WorkType.mindmap ? Icons.account_tree_outlined : Icons.menu_book_outlined,
  );
}

WorkType _resolveWorkType(Notebook notebook) {
  final normalized = notebook.tags.map((tag) => tag.toLowerCase()).toList();
  if (normalized.any((tag) => tag.contains('mindmap') || tag.contains('майнд') || tag.contains('карта'))) {
    return WorkType.mindmap;
  }
  return WorkType.book;
}
