import 'package:equatable/equatable.dart';

import 'ids.dart';

class ChapterSummary extends Equatable {
  const ChapterSummary({
    required this.id,
    required this.title,
    required this.order,
    required this.wordCount,
  });

  final ID id;
  final String title;
  final int order;
  final int wordCount;

  ChapterSummary copyWith({
    String? title,
    int? order,
    int? wordCount,
  }) {
    return ChapterSummary(
      id: id,
      title: title ?? this.title,
      order: order ?? this.order,
      wordCount: wordCount ?? this.wordCount,
    );
  }

  @override
  List<Object?> get props => [id, title, order, wordCount];
}
