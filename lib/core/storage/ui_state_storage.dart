import 'package:hive_flutter/hive_flutter.dart';

class UiStateStorage {
  UiStateStorage._(this._box);

  static const _boxName = 'ui_state';
  static const _rulerPrefix = 'chapterRulerScrollOffset::';
  static const _activeChapterPrefix = 'activeChapter::';

  final Box<dynamic> _box;

  static Future<UiStateStorage> open() async {
    final box = await Hive.openBox<dynamic>(_boxName);
    return UiStateStorage._(box);
  }

  double? readChapterRulerOffset(String bookId) {
    final value = _box.get('$_rulerPrefix$bookId');
    if (value is num) {
      return value.toDouble();
    }
    return null;
  }

  Future<void> writeChapterRulerOffset(String bookId, double offset) {
    return _box.put('$_rulerPrefix$bookId', offset);
  }

  String? readActiveChapterId(String bookId) {
    final value = _box.get('$_activeChapterPrefix$bookId');
    if (value is String) {
      return value;
    }
    return null;
  }

  Future<void> writeActiveChapterId(String bookId, String chapterId) {
    return _box.put('$_activeChapterPrefix$bookId', chapterId);
  }
}
