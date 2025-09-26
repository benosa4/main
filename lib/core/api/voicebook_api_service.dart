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
}

/// In-memory mock that emulates the behaviour of the real API.
///
/// It is intentionally asynchronous to match the production surface area: each
/// call returns a [Future] and mimics a small network delay. This allows the UI
/// to exercise loading states and makes switching to the real backend trivial.
class MockVoicebookApiService implements VoicebookApiService {
  const MockVoicebookApiService({this.latency = const Duration(milliseconds: 120)});

  /// Artificial latency that imitates a roundtrip to the backend.
  final Duration latency;

  Future<T> _withLatency<T>(T Function() builder) {
    return Future<T>.delayed(latency, builder);
  }

  @override
  Future<List<Notebook>> getNotebooks() {
    return _withLatency(() => List.unmodifiable(mockNotebooks));
  }

  @override
  Future<Notebook?> getNotebook(String notebookId) {
    return _withLatency(() {
      for (final notebook in mockNotebooks) {
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
      () => List.unmodifiable(mockChapterMap[notebookId] ?? const <Chapter>[]),
    );
  }

  @override
  Future<Chapter?> getChapter(String notebookId, String chapterId) {
    return _withLatency(() {
      final chapters = mockChapterMap[notebookId];
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
    return _withLatency(() => mockVoiceProfile);
  }
}
