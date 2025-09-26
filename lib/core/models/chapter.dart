import 'package:equatable/equatable.dart';

import 'ids.dart';
import 'rich_block.dart';
import 'scene_node.dart';

enum ChapterStatus { draft, edit, final_ }

enum RichBlockType { paragraph, h1, h2, bullet, quote, code }

class Chapter extends Equatable {
  const Chapter({
    required this.id,
    required this.bookId,
    required this.title,
    this.subtitle,
    this.status = ChapterStatus.draft,
    this.meta = const <String, String?>{},
    this.structure = const [],
    this.blocks = const [],
    this.body = '',
  });

  final ID id;
  final ID bookId;
  final String title;
  final String? subtitle;
  final ChapterStatus status;
  final Map<String, String?> meta;
  final List<SceneNode> structure;
  final List<RichBlock> blocks;
  final String body;

  factory Chapter.fromJson(Map<String, dynamic> json) {
    final statusValue = json['status'] as String?;
    final blocks = (json['blocks'] as List<dynamic>? ?? const [])
        .map((value) => RichBlock.fromJson(Map<String, dynamic>.from(value as Map)))
        .toList();
    return Chapter(
      id: json['id'] as String,
      bookId: json['bookId'] as String,
      title: json['title'] as String? ?? '',
      subtitle: json['subtitle'] as String?,
      status: ChapterStatus.values.firstWhere(
        (status) => status.name == statusValue,
        orElse: () => ChapterStatus.draft,
      ),
      meta: {
        for (final entry in (json['meta'] as Map<String, dynamic>? ?? const <String, dynamic>{}).entries)
          entry.key: entry.value as String?,
      },
      structure: [
        for (final node in (json['structure'] as List<dynamic>? ?? const []))
          SceneNode.fromJson(Map<String, dynamic>.from(node as Map)),
      ],
      blocks: blocks,
      body: json['body'] as String? ?? blocks.map((block) => block.text).join('\n\n'),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bookId': bookId,
      'title': title,
      'subtitle': subtitle,
      'status': status.name,
      'meta': meta,
      'structure': [for (final node in structure) node.toJson()],
      'blocks': [for (final block in blocks) block.toJson()],
      'body': body,
    };
  }

  Chapter copyWith({
    String? title,
    String? subtitle,
    ChapterStatus? status,
    Map<String, String?>? meta,
    List<SceneNode>? structure,
    List<RichBlock>? blocks,
    String? body,
  }) {
    return Chapter(
      id: id,
      bookId: bookId,
      title: title ?? this.title,
      subtitle: subtitle ?? this.subtitle,
      status: status ?? this.status,
      meta: meta ?? this.meta,
      structure: structure ?? this.structure,
      blocks: blocks ?? this.blocks,
      body: body ?? this.body,
    );
  }

  @override
  List<Object?> get props => [
        id,
        bookId,
        title,
        subtitle,
        status,
        meta,
        structure,
        blocks,
        body,
      ];
}
