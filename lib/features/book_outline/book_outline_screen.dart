import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:voicebook/core/models/chapter.dart' as domain;
import 'package:voicebook/core/models/notebook.dart';
import 'package:voicebook/core/providers/app_providers.dart';
import 'package:voicebook/core/storage/ui_state_storage.dart';
import 'package:voicebook/models/chapter.dart' as outline;
import 'package:voicebook/models/work.dart';
import 'package:voicebook/views/notebook_outline_view.dart';

class BookOutlineScreen extends ConsumerWidget {
  const BookOutlineScreen({super.key, required this.bookId});

  final String bookId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notebook = ref.watch(bookProvider(bookId));
    final chapters = ref.watch(bookChaptersProvider(bookId));

    if (notebook == null) {
      return const Scaffold(
        appBar: AppBar(),
        body: Center(child: Text('Коллекция не найдена.')),
      );
    }

    final work = _mapNotebookToWork(notebook);
    final outlineChapters = chapters.map(_mapChapter).toList();
    final firstChapterId = outlineChapters.isNotEmpty ? outlineChapters.first.id : null;

    void openWorkspace({String? chapterId, _OutlineWorkspaceIntent intent = _OutlineWorkspaceIntent.list}) {
      _prepareWorkspace(ref, bookId: bookId, chapterId: chapterId, intent: intent);
      context.pushNamed('bookEditor', pathParameters: {'bookId': bookId});
    }

    void openMindmap({String? chapterId}) {
      _prepareWorkspace(ref, bookId: bookId, chapterId: chapterId, intent: _OutlineWorkspaceIntent.list);
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
      onDictate: () => openWorkspace(chapterId: firstChapterId, intent: _OutlineWorkspaceIntent.edit),
      onEdit: () => openWorkspace(chapterId: firstChapterId, intent: _OutlineWorkspaceIntent.edit),
      onOpenMap: work.isMindmap ? () => openMindmap(chapterId: firstChapterId) : null,
      onAddNode: work.isMindmap ? () => openMindmap(chapterId: firstChapterId) : null,
      onMore: () {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Скоро добавим дополнительные действия.')),
        );
      },
      onReadChapter: (chapter) => openWorkspace(chapterId: chapter.id, intent: _OutlineWorkspaceIntent.reading),
      onEditChapter: (chapter) => openWorkspace(chapterId: chapter.id, intent: _OutlineWorkspaceIntent.edit),
      onVoiceChapter: (chapter) => openWorkspace(chapterId: chapter.id, intent: _OutlineWorkspaceIntent.edit),
      onOpenChapter: (chapter) => openWorkspace(chapterId: chapter.id, intent: _OutlineWorkspaceIntent.reading),
    );
  }
}

enum _OutlineWorkspaceIntent { list, reading, edit }

void _prepareWorkspace(
  WidgetRef ref, {
  required String bookId,
  String? chapterId,
  _OutlineWorkspaceIntent intent = _OutlineWorkspaceIntent.list,
}) {
  if (chapterId != null) {
    ref.read(currentChapterIdProvider(bookId).notifier).state = chapterId;
  }

  unawaited(_persistWorkspaceIntent(bookId: bookId, chapterId: chapterId, intent: intent));
}

Future<void> _persistWorkspaceIntent({
  required String bookId,
  String? chapterId,
  _OutlineWorkspaceIntent intent = _OutlineWorkspaceIntent.list,
}) async {
  final storage = await UiStateStorage.open();
  final raw = _encodeIntent(intent, chapterId: chapterId);
  await storage.writeWorkspaceMode(bookId, raw);
}

String _encodeIntent(_OutlineWorkspaceIntent intent, {String? chapterId}) {
  switch (intent) {
    case _OutlineWorkspaceIntent.list:
      return 'list';
    case _OutlineWorkspaceIntent.reading:
      return chapterId != null ? 'reading::$chapterId' : 'list';
    case _OutlineWorkspaceIntent.edit:
      return chapterId != null ? 'edit::$chapterId' : 'list';
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

outline.Chapter _mapChapter(domain.Chapter chapter) {
  return outline.Chapter(
    id: chapter.id,
    title: chapter.title,
    words: _resolveWordCount(chapter),
    status: _mapChapterStatus(chapter.status),
    excerpt: _buildExcerpt(chapter),
  );
}

int _resolveWordCount(domain.Chapter chapter) {
  final metaValue = chapter.meta['wordCount'];
  if (metaValue != null) {
    final digitsOnly = RegExp(r'\d+');
    final match = digitsOnly.firstMatch(metaValue);
    if (match != null) {
      return int.tryParse(match.group(0)!) ?? 0;
    }
  }
  if (chapter.body.isNotEmpty) {
    return RegExp(r"[\p{L}\p{N}_\-']+", unicode: true).allMatches(chapter.body).length;
  }
  return 0;
}

outline.ChapterStatus _mapChapterStatus(domain.ChapterStatus status) {
  switch (status) {
    case domain.ChapterStatus.final_:
      return outline.ChapterStatus.done;
    case domain.ChapterStatus.edit:
      return outline.ChapterStatus.inProgress;
    case domain.ChapterStatus.draft:
      return outline.ChapterStatus.todo;
  }
}

String _buildExcerpt(domain.Chapter chapter) {
  final subtitle = chapter.subtitle?.trim();
  if (subtitle != null && subtitle.isNotEmpty) {
    return subtitle;
  }
  final body = chapter.body.trim();
  if (body.isEmpty) {
    return 'Описание появится позже.';
  }
  final normalized = body.replaceAll(RegExp(r'\s+'), ' ').trim();
  if (normalized.length <= 160) {
    return normalized;
  }
  return '${normalized.substring(0, 157).trim()}…';
}
