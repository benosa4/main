import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:voicebook/core/providers/app_providers.dart';
import 'package:voicebook/core/storage/ui_state_storage.dart';

enum WorkspaceIntent { list, reading, edit }

void prepareWorkspace(
  WidgetRef ref, {
  required String bookId,
  String? chapterId,
  WorkspaceIntent intent = WorkspaceIntent.list,
}) {
  if (chapterId != null) {
    ref.read(currentChapterIdProvider(bookId).notifier).state = chapterId;
  }

  unawaited(
    persistWorkspaceIntent(bookId: bookId, chapterId: chapterId, intent: intent),
  );
}

Future<void> persistWorkspaceIntent({
  required String bookId,
  String? chapterId,
  WorkspaceIntent intent = WorkspaceIntent.list,
}) async {
  final storage = await UiStateStorage.open();
  final raw = encodeWorkspaceIntent(intent, chapterId: chapterId);
  await storage.writeWorkspaceMode(bookId, raw);
}

String encodeWorkspaceIntent(WorkspaceIntent intent, {String? chapterId}) {
  switch (intent) {
    case WorkspaceIntent.list:
      return 'list';
    case WorkspaceIntent.reading:
      return chapterId != null ? 'reading::$chapterId' : 'list';
    case WorkspaceIntent.edit:
      return chapterId != null ? 'edit::$chapterId' : 'list';
  }
}
