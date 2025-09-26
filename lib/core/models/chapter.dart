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
    this.meta = const {},
    this.structure = const [],
    this.blocks = const [],
  });

  final ID id;
  final ID bookId;
  final String title;
  final String? subtitle;
  final ChapterStatus status;
  final Map<String, String?> meta;
  final List<SceneNode> structure;
  final List<RichBlock> blocks;

  Chapter copyWith({
    String? title,
    String? subtitle,
    ChapterStatus? status,
    Map<String, String?>? meta,
    List<SceneNode>? structure,
    List<RichBlock>? blocks,
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
      ];
}
