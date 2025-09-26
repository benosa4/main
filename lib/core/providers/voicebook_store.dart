import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/voicebook_api_service.dart';
import '../models/models.dart';

class VoicebookStoreState {
  const VoicebookStoreState({
    this.isLoading = false,
    this.notebooks = const <Notebook>[],
    this.chaptersByBook = const <String, List<Chapter>>{},
    this.voiceProfile,
    this.error,
    this.stackTrace,
  });

  final bool isLoading;
  final List<Notebook> notebooks;
  final Map<String, List<Chapter>> chaptersByBook;
  final VoiceProfile? voiceProfile;
  final Object? error;
  final StackTrace? stackTrace;

  bool get hasError => error != null;

  VoicebookStoreState copyWith({
    bool? isLoading,
    List<Notebook>? notebooks,
    Map<String, List<Chapter>>? chaptersByBook,
    VoiceProfile? voiceProfile,
    Object? error = const _NoUpdate(),
    StackTrace? stackTrace = const _NoUpdate(),
  }) {
    return VoicebookStoreState(
      isLoading: isLoading ?? this.isLoading,
      notebooks: notebooks ?? this.notebooks,
      chaptersByBook: chaptersByBook ?? this.chaptersByBook,
      voiceProfile: voiceProfile ?? this.voiceProfile,
      error: error is _NoUpdate ? this.error : error,
      stackTrace: stackTrace is _NoUpdate ? this.stackTrace : stackTrace,
    );
  }
}

class VoicebookStore extends StateNotifier<VoicebookStoreState> {
  VoicebookStore(this._api)
      : super(const VoicebookStoreState(isLoading: true)) {
    _bootstrap();
  }

  final VoicebookApiService _api;

  Future<void> _bootstrap() async {
    try {
      final notebooks = await _api.getNotebooks();
      final chaptersByBook = <String, List<Chapter>>{};
      for (final notebook in notebooks) {
        final chapters = await _api.getChapters(notebook.id);
        chaptersByBook[notebook.id] = List.unmodifiable(chapters);
      }
      final voiceProfile = await _api.getVoiceProfile();

      state = state.copyWith(
        isLoading: false,
        notebooks: List.unmodifiable(notebooks),
        chaptersByBook: Map.unmodifiable(chaptersByBook),
        voiceProfile: voiceProfile,
        error: null,
        stackTrace: null,
      );
    } catch (error, stackTrace) {
      state = state.copyWith(
        isLoading: false,
        error: error,
        stackTrace: stackTrace,
      );
    }
  }

  Notebook? findNotebook(String bookId) {
    for (final notebook in state.notebooks) {
      if (notebook.id == bookId) {
        return notebook;
      }
    }
    return null;
  }

  List<Chapter> getChapters(String bookId) {
    return state.chaptersByBook[bookId] ?? const <Chapter>[];
  }

  Chapter? findChapter(String bookId, String chapterId) {
    final chapters = state.chaptersByBook[bookId];
    if (chapters == null) {
      return null;
    }
    for (final chapter in chapters) {
      if (chapter.id == chapterId) {
        return chapter;
      }
    }
    return null;
  }
}

class _NoUpdate {
  const _NoUpdate();
}
