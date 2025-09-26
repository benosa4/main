import 'package:equatable/equatable.dart';

import 'ids.dart';

class SceneNode extends Equatable {
  const SceneNode({
    required this.id,
    required this.title,
    this.children = const [],
  });

  final ID id;
  final String title;
  final List<SceneNode> children;

  factory SceneNode.fromJson(Map<String, dynamic> json) {
    return SceneNode(
      id: json['id'] as String,
      title: json['title'] as String? ?? '',
      children: [
        for (final child in (json['children'] as List<dynamic>? ?? const []))
          SceneNode.fromJson(Map<String, dynamic>.from(child as Map)),
      ],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'children': [for (final child in children) child.toJson()],
    };
  }

  SceneNode copyWith({
    String? title,
    List<SceneNode>? children,
  }) {
    return SceneNode(
      id: id,
      title: title ?? this.title,
      children: children ?? this.children,
    );
  }

  @override
  List<Object?> get props => [id, title, children];
}
