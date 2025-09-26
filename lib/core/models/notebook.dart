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

  factory Notebook.fromJson(Map<String, dynamic> json) {
    return Notebook(
      id: json['id'] as String,
      title: json['title'] as String? ?? '',
      coverUrl: json['coverUrl'] as String?,
      tags: [
        for (final tag in (json['tags'] as List<dynamic>? ?? const []))
          tag as String,
      ],
      updatedAt: DateTime.tryParse(json['updatedAt'] as String? ?? '') ?? DateTime.now(),
      chapters: json['chapters'] as int? ?? 0,
      words: json['words'] as int? ?? 0,
      audioMinutes: (json['audioMinutes'] as num?)?.toDouble() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'coverUrl': coverUrl,
      'tags': tags,
      'updatedAt': updatedAt.toIso8601String(),
      'chapters': chapters,
      'words': words,
      'audioMinutes': audioMinutes,
    };
  }

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
