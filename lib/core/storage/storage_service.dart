import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'package:voicebook/core/models/models.dart';

final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});

class StorageService {
  StorageService();

  static const _notebooksBoxKey = 'voicebook.notebooks';
  static const _chaptersBoxKey = 'voicebook.chapters';
  static const _settingsBoxKey = 'voicebook.settings';
  static const _voiceProfileBoxKey = 'voicebook.voiceProfile';
  static const _appBoxKey = 'voicebook.app';
  static const _userIdKey = 'userId';

  bool _initialized = false;
  late Box<Map> _notebooksBox;
  late Box<List> _chaptersBox;
  late Box<Map> _settingsBox;
  late Box<Map> _voiceProfileBox;
  late Box _appBox;

  Future<void> init() async {
    if (_initialized) {
      return;
    }

    if (!kIsWeb && Hive.isBoxOpen(_notebooksBoxKey)) {
      _notebooksBox = Hive.box<Map>(_notebooksBoxKey);
      _chaptersBox = Hive.box<List>(_chaptersBoxKey);
      _settingsBox = Hive.box<Map>(_settingsBoxKey);
      _voiceProfileBox = Hive.box<Map>(_voiceProfileBoxKey);
      _appBox = Hive.box(_appBoxKey);
      _initialized = true;
      return;
    }

    await Hive.initFlutter();
    _notebooksBox = await Hive.openBox<Map>(_notebooksBoxKey);
    _chaptersBox = await Hive.openBox<List>(_chaptersBoxKey);
    _settingsBox = await Hive.openBox<Map>(_settingsBoxKey);
    _voiceProfileBox = await Hive.openBox<Map>(_voiceProfileBoxKey);
    _appBox = await Hive.openBox<dynamic>(_appBoxKey);
    _initialized = true;
  }

  Future<String> ensureUserId() async {
    await init();
    final existing = _appBox.get(_userIdKey) as String?;
    if (existing != null && existing.isNotEmpty) {
      return existing;
    }
    final random = Random();
    final buffer = StringBuffer('user-');
    for (var i = 0; i < 32; i++) {
      buffer.write(random.nextInt(16).toRadixString(16));
    }
    final userId = buffer.toString();
    await _appBox.put(_userIdKey, userId);
    return userId;
  }

  Future<List<Notebook>> loadNotebooks() async {
    await init();
    return [
      for (final value in _notebooksBox.values)
        Notebook.fromJson(Map<String, dynamic>.from(value))
    ];
  }

  Future<Map<String, List<Chapter>>> loadChapterMap() async {
    await init();
    final map = <String, List<Chapter>>{};
    for (final key in _chaptersBox.keys) {
      final raw = _chaptersBox.get(key);
      if (raw is List) {
        map[key as String] = [
          for (final entry in raw)
            Chapter.fromJson(Map<String, dynamic>.from(entry as Map)),
        ];
      }
    }
    return map;
  }

  Future<VoiceProfile?> loadVoiceProfile() async {
    await init();
    final raw = _voiceProfileBox.get(_voiceProfileBoxKey);
    if (raw is Map) {
      return VoiceProfile.fromJson(Map<String, dynamic>.from(raw));
    }
    return null;
  }

  Future<AppSettings?> loadSettings(String userId) async {
    await init();
    final raw = _settingsBox.get(userId);
    if (raw is Map) {
      return AppSettings.fromJson(Map<String, dynamic>.from(raw));
    }
    return null;
  }

  Future<void> saveNotebook(Notebook notebook) async {
    await init();
    await _notebooksBox.put(notebook.id, notebook.toJson());
  }

  Future<void> saveNotebooks(Iterable<Notebook> notebooks) async {
    await init();
    await _notebooksBox.putAll({for (final notebook in notebooks) notebook.id: notebook.toJson()});
  }

  Future<void> removeNotebook(String notebookId) async {
    await init();
    await _notebooksBox.delete(notebookId);
    await _chaptersBox.delete(notebookId);
  }

  Future<void> saveChapters(String bookId, List<Chapter> chapters) async {
    await init();
    await _chaptersBox.put(
      bookId,
      [for (final chapter in chapters) chapter.toJson()],
    );
  }

  Future<void> saveVoiceProfile(VoiceProfile profile) async {
    await init();
    await _voiceProfileBox.put(_voiceProfileBoxKey, profile.toJson());
  }

  Future<void> saveSettings(String userId, AppSettings settings) async {
    await init();
    await _settingsBox.put(userId, settings.toJson());
  }
}
