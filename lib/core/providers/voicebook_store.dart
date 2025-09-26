import 'dart:math';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/voicebook_api_service.dart';
import '../models/models.dart';
import '../storage/storage_service.dart';

class VoicebookStoreState {
  const VoicebookStoreState({
    this.isLoading = false,
    this.isSyncing = false,
    this.notebooks = const <Notebook>[],
    this.chaptersByBook = const <String, List<Chapter>>{},
    this.voiceProfile,
    this.settings,
    this.userId,
    this.error,
    this.stackTrace,
  });

  final bool isLoading;
  final bool isSyncing;
  final List<Notebook> notebooks;
  final Map<String, List<Chapter>> chaptersByBook;
  final VoiceProfile? voiceProfile;
  final AppSettings? settings;
  final String? userId;
  final Object? error;
  final StackTrace? stackTrace;

  bool get hasError => error != null;

  VoicebookStoreState copyWith({
    bool? isLoading,
    bool? isSyncing,
    List<Notebook>? notebooks,
    Map<String, List<Chapter>>? chaptersByBook,
    VoiceProfile? voiceProfile,
    AppSettings? settings,
    String? userId,
    Object? error = const _NoUpdate(),
    Object? stackTrace = const _NoUpdate(),
  }) {
    return VoicebookStoreState(
      isLoading: isLoading ?? this.isLoading,
      isSyncing: isSyncing ?? this.isSyncing,
      notebooks: notebooks ?? this.notebooks,
      chaptersByBook: chaptersByBook ?? this.chaptersByBook,
      voiceProfile: voiceProfile ?? this.voiceProfile,
      settings: settings ?? this.settings,
      userId: userId ?? this.userId,
      error: error is _NoUpdate ? this.error : error,
      stackTrace: stackTrace is _NoUpdate ? this.stackTrace : stackTrace as StackTrace?,
    );
  }
}

class VoicebookStore extends StateNotifier<VoicebookStoreState> {
  VoicebookStore(this._api, this._storage)
      : _random = Random.secure(),
        super(const VoicebookStoreState(isLoading: true)) {
    _bootstrap();
  }

  final VoicebookApiService _api;
  final StorageService _storage;
  final Random _random;

  Future<void> _bootstrap() async {
    try {
      final userId = await _storage.ensureUserId();
      final localNotebooks = await _storage.loadNotebooks();
      final localChapterMap = await _storage.loadChapterMap();
      final localVoiceProfile = await _storage.loadVoiceProfile();
      final localSettings = await _storage.loadSettings(userId);
      final hasLocalData =
          localNotebooks.isNotEmpty || localChapterMap.isNotEmpty || localVoiceProfile != null || localSettings != null;

      if (hasLocalData) {
        state = state.copyWith(
          isLoading: false,
          userId: userId,
          notebooks: List.unmodifiable(localNotebooks),
          chaptersByBook: Map.unmodifiable({
            for (final entry in localChapterMap.entries)
              entry.key: List<Chapter>.unmodifiable(entry.value),
          }),
          voiceProfile: localVoiceProfile ?? state.voiceProfile,
          settings: localSettings ?? state.settings,
          error: null,
          stackTrace: null,
        );
      }

      await _refreshFromRemote(userId: userId, hasLocalData: hasLocalData);
    } catch (error, stackTrace) {
      state = state.copyWith(
        isLoading: false,
        isSyncing: false,
        error: error,
        stackTrace: stackTrace,
      );
    }
  }

  Future<void> _refreshFromRemote({required String userId, required bool hasLocalData}) async {
    try {
      state = state.copyWith(isSyncing: true, userId: userId);
      final notebooks = await _api.getNotebooks();
      final chaptersByBook = <String, List<Chapter>>{};
      for (final notebook in notebooks) {
        final chapters = await _api.getChapters(notebook.id);
        chaptersByBook[notebook.id] = List<Chapter>.from(chapters);
      }
      final voiceProfile = await _api.getVoiceProfile();
      final settings = await _api.getSettings(userId);

      await _storage.saveNotebooks(notebooks);
      for (final entry in chaptersByBook.entries) {
        await _storage.saveChapters(entry.key, entry.value);
      }
      await _storage.saveVoiceProfile(voiceProfile);
      await _storage.saveSettings(userId, settings);

      state = state.copyWith(
        isLoading: false,
        isSyncing: false,
        userId: userId,
        notebooks: List.unmodifiable(notebooks),
        chaptersByBook: Map.unmodifiable({
          for (final entry in chaptersByBook.entries)
            entry.key: List<Chapter>.unmodifiable(entry.value),
        }),
        voiceProfile: voiceProfile,
        settings: settings,
        error: null,
        stackTrace: null,
      );
    } catch (error, stackTrace) {
      state = state.copyWith(
        isLoading: false,
        isSyncing: false,
        userId: userId,
        error: error,
        stackTrace: stackTrace,
      );
      if (!hasLocalData) {
        rethrow;
      }
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

  Future<Notebook> createNotebook(String title) async {
    final now = DateTime.now();
    final notebook = Notebook(
      id: _generateId('book'),
      title: title.isEmpty ? 'Новый проект' : title,
      updatedAt: now,
      coverUrl: null,
      tags: const [],
      chapters: 0,
      words: 0,
      audioMinutes: 0,
    );

    final notebooks = [...state.notebooks, notebook];
    state = state.copyWith(
      notebooks: List.unmodifiable(notebooks),
      error: null,
      stackTrace: null,
    );

    final initialChapter = Chapter(
      id: _generateId('chapter'),
      bookId: notebook.id,
      title: 'Новая глава',
      subtitle: 'Черновик',
      status: ChapterStatus.draft,
      meta: const {'genre': 'Не указан', 'wordCount': '0'},
      structure: const [],
      body: 'Начните диктовку или нажмите «Сформировать текст», чтобы получить подсказку.',
    );

    try {
      await _replaceChapters(notebook.id, [initialChapter]);
      return notebook;
    } catch (error, stackTrace) {
      state = state.copyWith(error: error, stackTrace: stackTrace);
      rethrow;
    }
  }

  Future<void> updateChapterDraft({
    required String bookId,
    required String chapterId,
    required String title,
    required String subtitle,
    required String body,
  }) async {
    final chapters = List<Chapter>.from(getChapters(bookId));
    final index = chapters.indexWhere((chapter) => chapter.id == chapterId);
    if (index == -1) {
      return;
    }

    final updatedMeta = Map<String, String?>.from(chapters[index].meta);
    updatedMeta['wordCount'] = _countWords(body).toString();

    chapters[index] = chapters[index].copyWith(
      title: title,
      subtitle: subtitle.isEmpty ? null : subtitle,
      body: body,
      meta: updatedMeta,
    );

    try {
      await _replaceChapters(bookId, chapters);
    } catch (error, stackTrace) {
      state = state.copyWith(error: error, stackTrace: stackTrace);
    }
  }

  Future<void> appendDictationResult({
    required String bookId,
    required String chapterId,
    required String text,
  }) async {
    final chapters = List<Chapter>.from(getChapters(bookId));
    final index = chapters.indexWhere((chapter) => chapter.id == chapterId);
    if (index == -1) {
      return;
    }

    final current = chapters[index];
    final trimmed = current.body.trimRight();
    final separator = trimmed.isEmpty ? '' : '\n\n';
    final newBody = '$trimmed$separator$text';
    final updatedMeta = Map<String, String?>.from(current.meta);
    updatedMeta['wordCount'] = _countWords(newBody).toString();

    chapters[index] = current.copyWith(body: newBody, meta: updatedMeta);

    try {
      await _replaceChapters(bookId, chapters);
    } catch (error, stackTrace) {
      state = state.copyWith(error: error, stackTrace: stackTrace);
    }
  }

  Future<void> updateSettings(AppSettings settings) async {
    final userId = state.userId;
    if (userId == null) {
      return;
    }
    state = state.copyWith(settings: settings, error: null, stackTrace: null);
    try {
      await _storage.saveSettings(userId, settings);
      await _api.syncSettings(userId, settings);
    } catch (error, stackTrace) {
      state = state.copyWith(error: error, stackTrace: stackTrace);
    }
  }

  Future<void> _replaceChapters(String bookId, List<Chapter> chapters) async {
    final normalized = List<Chapter>.from(chapters);
    final chapterMap = Map<String, List<Chapter>>.from(state.chaptersByBook);
    chapterMap[bookId] = List<Chapter>.unmodifiable(normalized);

    final words = normalized.fold<int>(0, (value, chapter) => value + _countWords(chapter.body));
    final notebooks = [
      for (final notebook in state.notebooks)
        if (notebook.id == bookId)
          notebook.copyWith(
            updatedAt: DateTime.now(),
            chapters: normalized.length,
            words: words,
          )
        else
          notebook,
    ];

    final updatedNotebook = notebooks.firstWhere((notebook) => notebook.id == bookId);

    state = state.copyWith(
      notebooks: List.unmodifiable(notebooks),
      chaptersByBook: Map.unmodifiable(chapterMap),
      error: null,
      stackTrace: null,
    );

    await _storage.saveChapters(bookId, normalized);
    await _storage.saveNotebook(updatedNotebook);
    await _api.syncChapters(bookId, normalized);
    await _api.syncNotebook(updatedNotebook);
  }

  String _generateId(String prefix) {
    final millis = DateTime.now().millisecondsSinceEpoch;
    final randomPart = _random.nextInt(0xFFFFFF).toRadixString(16).padLeft(6, '0');
    return '$prefix-$millis-$randomPart';
  }

  int _countWords(String text) {
    final matches = RegExp(r'[^\s]+').allMatches(text.trim());
    return matches.length;
  }
}

class _NoUpdate {
  const _NoUpdate();
}
