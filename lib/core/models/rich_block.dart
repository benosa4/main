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

  factory RichBlock.fromJson(Map<String, dynamic> json) {
    return RichBlock(
      id: json['id'] as String,
      type: RichBlockType.values.firstWhere(
        (value) => value.name == json['type'],
        orElse: () => RichBlockType.paragraph,
      ),
      text: json['text'] as String? ?? '',
      marks: [
        for (final mark in (json['marks'] as List<dynamic>? ?? const []))
          mark as String,
      ],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.name,
      'text': text,
      'marks': marks,
    };
  }

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
