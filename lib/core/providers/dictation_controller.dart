import 'dart:async';
import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:voicebook/core/providers/voicebook_store.dart';
import 'package:voicebook/core/services/dictation_service.dart';

class DictationState {
  const DictationState({
    this.isConnecting = false,
    this.isListening = false,
    this.activeBookId,
    this.activeChapterId,
    this.phrases = const <DictationPhrase>[],
    this.lastCommittedId,
    this.lastCommittedText,
    this.error,
  });

  final bool isConnecting;
  final bool isListening;
  final String? activeBookId;
  final String? activeChapterId;
  final List<DictationPhrase> phrases;
  final String? lastCommittedId;
  final String? lastCommittedText;
  final Object? error;

  DictationState copyWith({
    bool? isConnecting,
    bool? isListening,
    String? activeBookId,
    String? activeChapterId,
    List<DictationPhrase>? phrases,
    Object? lastCommittedId = _noUpdate,
    Object? lastCommittedText = _noUpdate,
    Object? error = _noUpdate,
  }) {
    return DictationState(
      isConnecting: isConnecting ?? this.isConnecting,
      isListening: isListening ?? this.isListening,
      activeBookId: activeBookId ?? this.activeBookId,
      activeChapterId: activeChapterId ?? this.activeChapterId,
      phrases: phrases ?? this.phrases,
      lastCommittedId: identical(lastCommittedId, _noUpdate)
          ? this.lastCommittedId
          : lastCommittedId as String?,
      lastCommittedText: identical(lastCommittedText, _noUpdate)
          ? this.lastCommittedText
          : lastCommittedText as String?,
      error: identical(error, _noUpdate) ? this.error : error,
    );
  }

  static const Object _noUpdate = Object();
}

class DictationPhrase {
  const DictationPhrase({
    required this.id,
    required this.text,
    required this.status,
  });

  final String id;
  final String text;
  final DictationPhraseStatus status;
}

enum DictationPhraseStatus { streaming, committing, committed }

class DictationController extends StateNotifier<DictationState> {
  DictationController(this._gateway, this._store) : super(const DictationState());

  final DictationGateway _gateway;
  final VoicebookStore _store;

  DictationSession? _session;
  StreamSubscription? _subscription;

  Future<void> toggle({required String bookId, required String chapterId}) async {
    if (state.isListening || state.isConnecting) {
      await stop();
      return;
    }
    await start(bookId: bookId, chapterId: chapterId);
  }

  Future<void> start({required String bookId, required String chapterId}) async {
    await stop();
    state = state.copyWith(
      isConnecting: true,
      isListening: false,
      activeBookId: bookId,
      activeChapterId: chapterId,
      phrases: const [],
      lastCommittedId: null,
      lastCommittedText: null,
      error: null,
    );

    try {
      _session = await _gateway.openSession();
      _subscription = _session!.channel.stream.listen(
        _handleMessage,
        onError: (error, stackTrace) {
          state = state.copyWith(
            error: error,
            isConnecting: false,
            isListening: false,
          );
        },
        onDone: () {
          state = state.copyWith(isListening: false, isConnecting: false);
        },
      );

      _session!.channel.sink.add(jsonEncode({'type': 'start'}));
    } catch (error, stackTrace) {
      state = state.copyWith(
        error: error,
        isConnecting: false,
        isListening: false,
      );
      _subscription?.cancel();
      _subscription = null;
      await _session?.dispose();
      _session = null;
    }
  }

  Future<void> stop() async {
    if (_session == null) {
      state = state.copyWith(isListening: false, isConnecting: false);
      return;
    }
    try {
      _session!.channel.sink.add(jsonEncode({'type': 'stop'}));
    } catch (_) {}
    await _subscription?.cancel();
    _subscription = null;
    await _session?.dispose();
    _session = null;
    state = state.copyWith(
      isListening: false,
      isConnecting: false,
      phrases: const [],
      activeBookId: null,
      activeChapterId: null,
      lastCommittedId: null,
      lastCommittedText: null,
    );
  }

  void acknowledgeCommit() {
    state = state.copyWith(lastCommittedId: null, lastCommittedText: null);
  }

  void _handleMessage(dynamic message) {
    if (message is! String) {
      return;
    }
    final dynamic data = jsonDecode(message);
    if (data is! Map<String, dynamic>) {
      return;
    }
    switch (data['type']) {
      case 'state':
        _handleStateMessage(data['state'] as String?);
        break;
      case 'frame':
        _handleFrameMessage(data);
        break;
      case 'commit':
        final phraseId = data['id'] as String?;
        if (phraseId != null) {
          _markCommitted(phraseId);
        }
        break;
    }
  }

  void _handleStateMessage(String? value) {
    switch (value) {
      case 'connecting':
        state = state.copyWith(isConnecting: true, isListening: false);
        break;
      case 'listening':
        state = state.copyWith(isConnecting: false, isListening: true);
        _session?.channel.sink.add(jsonEncode({
          'type': 'audio',
          'chunk': DateTime.now().millisecondsSinceEpoch,
        }));
        break;
      case 'completed':
      case 'stopped':
        state = state.copyWith(isListening: false, isConnecting: false);
        break;
    }
  }

  void _handleFrameMessage(Map<String, dynamic> data) {
    final id = data['id'] as String?;
    final text = data['text'] as String? ?? '';
    final statusValue = data['status'] as String? ?? 'stream';
    if (id == null) {
      return;
    }
    final status = switch (statusValue) {
      'finalised' => DictationPhraseStatus.committing,
      'commit' => DictationPhraseStatus.committing,
      _ => DictationPhraseStatus.streaming,
    };

    final phrases = [...state.phrases];
    final index = phrases.indexWhere((phrase) => phrase.id == id);
    final updated = DictationPhrase(id: id, text: text, status: status);
    if (index == -1) {
      phrases.add(updated);
    } else {
      phrases[index] = updated;
    }
    state = state.copyWith(phrases: List.unmodifiable(phrases));
  }

  void _markCommitted(String phraseId) {
    final phrases = [...state.phrases];
    final index = phrases.indexWhere((phrase) => phrase.id == phraseId);
    if (index == -1) {
      return;
    }
    final phrase = phrases[index];
    final committed = DictationPhrase(
      id: phrase.id,
      text: phrase.text,
      status: DictationPhraseStatus.committed,
    );
    phrases[index] = committed;
    state = state.copyWith(
      phrases: List.unmodifiable(phrases),
      lastCommittedId: phraseId,
      lastCommittedText: committed.text,
    );

    final bookId = state.activeBookId;
    final chapterId = state.activeChapterId;
    if (bookId != null && chapterId != null && committed.text.trim().isNotEmpty) {
      unawaited(
        _store.appendDictationResult(bookId: bookId, chapterId: chapterId, text: committed.text),
      );
    }
  }
}
