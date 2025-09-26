import 'package:equatable/equatable.dart';

import 'chapter.dart';
import 'ids.dart';

class RichBlock extends Equatable {
  const RichBlock({
    required this.id,
    required this.type,
    required this.text,
    this.marks = const [],
  });

  final ID id;
  final RichBlockType type;
  final String text;
  final List<String> marks;

  RichBlock copyWith({
    RichBlockType? type,
    String? text,
    List<String>? marks,
  }) {
    return RichBlock(
      id: id,
      type: type ?? this.type,
      text: text ?? this.text,
      marks: marks ?? this.marks,
    );
  }

  @override
  List<Object?> get props => [id, type, text, marks];
}
