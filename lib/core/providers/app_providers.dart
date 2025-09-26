import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../mock/mock_data.dart';
import '../models/models.dart';

enum AppPermission { microphone, notifications, files }

class PermissionState {
  const PermissionState({
    this.microphone = false,
    this.notifications = false,
    this.files = false,
  });

  final bool microphone;
  final bool notifications;
  final bool files;

  bool get allGranted => microphone && notifications && files;

  PermissionState copyWith({
    bool? microphone,
    bool? notifications,
    bool? files,
  }) {
    return PermissionState(
      microphone: microphone ?? this.microphone,
      notifications: notifications ?? this.notifications,
      files: files ?? this.files,
    );
  }
}

class PermissionController extends StateNotifier<PermissionState> {
  PermissionController() : super(const PermissionState());

  void toggle(AppPermission permission) {
    switch (permission) {
      case AppPermission.microphone:
        state = state.copyWith(microphone: !state.microphone);
        break;
      case AppPermission.notifications:
        state = state.copyWith(notifications: !state.notifications);
        break;
      case AppPermission.files:
        state = state.copyWith(files: !state.files);
        break;
    }
  }

  void grantAll() {
    state = state.copyWith(microphone: true, notifications: true, files: true);
  }
}

final permissionsProvider =
    StateNotifierProvider<PermissionController, PermissionState>((ref) => PermissionController());

class LibraryController extends StateNotifier<List<Notebook>> {
  LibraryController() : super(List.unmodifiable(mockNotebooks));
}

final notebooksProvider =
    StateNotifierProvider<LibraryController, List<Notebook>>((ref) => LibraryController());

Notebook? _findNotebook(List<Notebook> notebooks, String bookId) {
  for (final notebook in notebooks) {
    if (notebook.id == bookId) {
      return notebook;
    }
  }
  return null;
}

Chapter? _findChapter(List<Chapter> chapters, String chapterId) {
  for (final chapter in chapters) {
    if (chapter.id == chapterId) {
      return chapter;
    }
  }
  return null;
}

final bookProvider = Provider.family<Notebook?, String>((ref, bookId) {
  final notebooks = ref.watch(notebooksProvider);
  return _findNotebook(notebooks, bookId);
});

final bookExistsProvider = Provider.family<bool, String>((ref, bookId) {
  return ref.watch(bookProvider(bookId)) != null;
});

final bookChaptersProvider = Provider.family<List<Chapter>, String>((ref, bookId) {
  return List.unmodifiable(mockChapterMap[bookId] ?? const []);
});

final chapterSummariesProvider = Provider.family<List<ChapterSummary>, String>((ref, bookId) {
  final chapters = ref.watch(bookChaptersProvider(bookId));
  return [
    for (var i = 0; i < chapters.length; i++)
      ChapterSummary(
        id: chapters[i].id,
        title: chapters[i].title,
        order: i,
        wordCount: int.tryParse(chapters[i].meta['wordCount'] ?? '') ?? 0,
      ),
  ];
});

final currentChapterIdProvider = StateProvider.family<String, String>((ref, bookId) {
  final chapters = ref.watch(bookChaptersProvider(bookId));
  return chapters.isNotEmpty ? chapters.first.id : '';
});

final currentChapterProvider = Provider.family<Chapter?, String>((ref, bookId) {
  final chapters = ref.watch(bookChaptersProvider(bookId));
  if (chapters.isEmpty) {
    return null;
  }
  final currentId = ref.watch(currentChapterIdProvider(bookId));
  final chapter = currentId.isEmpty ? null : _findChapter(chapters, currentId);
  return chapter ?? chapters.first;
});

final chapterProvider = Provider.family<Chapter?, ({String bookId, String chapterId})>((ref, args) {
  final chapters = ref.watch(bookChaptersProvider(args.bookId));
  return _findChapter(chapters, args.chapterId);
});

final chapterStructureProvider =
    Provider.family<List<SceneNode>, ({String bookId, String chapterId})>((ref, args) {
  final chapter = ref.watch(chapterProvider(args));
  return chapter?.structure ?? const [];
});

final voiceProfileProvider = StateProvider<VoiceProfile>((ref) => mockVoiceProfile);
