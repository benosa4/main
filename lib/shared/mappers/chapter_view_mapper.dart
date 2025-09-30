import 'package:voicebook/core/models/chapter.dart' as domain;
import 'package:voicebook/models/chapter.dart' as view;

view.Chapter mapDomainChapterToView(domain.Chapter chapter) {
  return view.Chapter(
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

view.ChapterStatus _mapChapterStatus(domain.ChapterStatus status) {
  switch (status) {
    case domain.ChapterStatus.final_:
      return view.ChapterStatus.done;
    case domain.ChapterStatus.edit:
      return view.ChapterStatus.inProgress;
    case domain.ChapterStatus.draft:
      return view.ChapterStatus.todo;
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
