enum ChapterStatus { done, inProgress, todo }

class Chapter {
  final String id;
  final String title; // «Глава 1: Обычный мир»
  final int words; // 3245
  final ChapterStatus status;
  final String excerpt; // аннотация/первые строки

  const Chapter({
    required this.id,
    required this.title,
    required this.words,
    required this.status,
    required this.excerpt,
  });
}
