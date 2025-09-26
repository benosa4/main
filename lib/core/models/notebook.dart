import 'package:equatable/equatable.dart';

import 'ids.dart';

class Notebook extends Equatable {
  const Notebook({
    required this.id,
    required this.title,
    this.coverUrl,
    this.tags = const [],
    required this.updatedAt,
    this.chapters = 0,
    this.words = 0,
    this.audioMinutes = 0,
  });

  final ID id;
  final String title;
  final String? coverUrl;
  final List<String> tags;
  final DateTime updatedAt;
  final int chapters;
  final int words;
  final double audioMinutes;

  Notebook copyWith({
    String? title,
    String? coverUrl,
    List<String>? tags,
    DateTime? updatedAt,
    int? chapters,
    int? words,
    double? audioMinutes,
  }) {
    return Notebook(
      id: id,
      title: title ?? this.title,
      coverUrl: coverUrl ?? this.coverUrl,
      tags: tags ?? this.tags,
      updatedAt: updatedAt ?? this.updatedAt,
      chapters: chapters ?? this.chapters,
      words: words ?? this.words,
      audioMinutes: audioMinutes ?? this.audioMinutes,
    );
  }

  @override
  List<Object?> get props => [
        id,
        title,
        coverUrl,
        tags,
        updatedAt,
        chapters,
        words,
        audioMinutes,
      ];
}
