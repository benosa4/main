import 'dart:async';

import '../mock/mock_data.dart';
import '../models/models.dart';

/// Defines the contract for interacting with the Voicebook backend API.
///
/// The app uses this service exclusively to obtain data about notebooks,
/// chapters and the active voice profile. In the production build the
/// implementation would proxy HTTP requests to the real backend. For the
/// prototype we ship a [MockVoicebookApiService] that mirrors the expected
/// network behaviour and returns deterministic mock data.
abstract class VoicebookApiService {
  /// Returns the list of notebooks available to the current user.
  Future<List<Notebook>> getNotebooks();

  /// Returns metadata for a single notebook or `null` if it does not exist.
  Future<Notebook?> getNotebook(String notebookId);

  /// Loads all chapters for the provided [notebookId].
  Future<List<Chapter>> getChapters(String notebookId);

  /// Returns a single chapter by its identifier.
  Future<Chapter?> getChapter(String notebookId, String chapterId);

  /// Returns the current voice profile that will be used for TTS preview.
  Future<VoiceProfile> getVoiceProfile();

  /// Returns application settings for the provided user.
  Future<AppSettings> getSettings(String userId);

  /// Persists the provided notebook snapshot.
  Future<void> syncNotebook(Notebook notebook);

  /// Persists the provided chapters snapshot for the notebook.
  Future<void> syncChapters(String notebookId, List<Chapter> chapters);

  /// Updates the settings for the given user identifier.
  Future<void> syncSettings(String userId, AppSettings settings);

  /// Updates the voice profile metadata.
  Future<void> syncVoiceProfile(VoiceProfile profile);
}

/// In-memory mock that emulates the behaviour of the real API.
///
/// It is intentionally asynchronous to match the production surface area: each
/// call returns a [Future] and mimics a small network delay. This allows the UI
/// to exercise loading states and makes switching to the real backend trivial.
class MockVoicebookApiService implements VoicebookApiService {
  MockVoicebookApiService({this.latency = const Duration(milliseconds: 120)})
      : _notebooks = List<Notebook>.from(mockNotebooks),
        _chapterMap = {
          for (final entry in mockChapterMap.entries)
            entry.key: List<Chapter>.from(entry.value),
        },
        _voiceProfile = mockVoiceProfile,
        _settingsByUser = {};

  /// Artificial latency that imitates a roundtrip to the backend.
  final Duration latency;
  final List<Notebook> _notebooks;
  final Map<String, List<Chapter>> _chapterMap;
  VoiceProfile _voiceProfile;
  final Map<String, AppSettings> _settingsByUser;

  Future<T> _withLatency<T>(T Function() builder) {
    return Future<T>.delayed(latency, builder);
  }

  @override
  Future<List<Notebook>> getNotebooks() {
    return _withLatency(() => List.unmodifiable(_notebooks));
  }

  @override
  Future<Notebook?> getNotebook(String notebookId) {
    return _withLatency(() {
      for (final notebook in _notebooks) {
        if (notebook.id == notebookId) {
          return notebook;
        }
      }
      return null;
    });
  }

  @override
  Future<List<Chapter>> getChapters(String notebookId) {
    return _withLatency(
      () => List.unmodifiable(_chapterMap[notebookId] ?? const <Chapter>[]),
    );
  }

  @override
  Future<Chapter?> getChapter(String notebookId, String chapterId) {
    return _withLatency(() {
      final chapters = _chapterMap[notebookId];
      if (chapters == null) {
        return null;
      }
      for (final chapter in chapters) {
        if (chapter.id == chapterId) {
          return chapter;
        }
      }
      return null;
    });
  }

  @override
  Future<VoiceProfile> getVoiceProfile() {
    return _withLatency(() => _voiceProfile);
  }

  @override
  Future<AppSettings> getSettings(String userId) {
    return _withLatency(() => _settingsByUser[userId] ?? mockAppSettings);
  }

  @override
  Future<void> syncNotebook(Notebook notebook) {
    return _withLatency(() {
      final index = _notebooks.indexWhere((item) => item.id == notebook.id);
      if (index >= 0) {
        _notebooks[index] = notebook;
      } else {
        _notebooks.add(notebook);
      }
    });
  }

  @override
  Future<void> syncChapters(String notebookId, List<Chapter> chapters) {
    return _withLatency(() {
      _chapterMap[notebookId] = List<Chapter>.from(chapters);
    });
  }

  @override
  Future<void> syncSettings(String userId, AppSettings settings) {
    return _withLatency(() {
      _settingsByUser[userId] = settings;
    });
  }

  @override
  Future<void> syncVoiceProfile(VoiceProfile profile) {
    return _withLatency(() {
      _voiceProfile = profile;
    });
  }
}
