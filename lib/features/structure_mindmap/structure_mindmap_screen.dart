import 'package:flutter/material.dart';
import '../../core/models/models.dart';
import '../../shared/ui/glass_card.dart';

class StructureMindmapScreen extends StatelessWidget {
  const StructureMindmapScreen({super.key, required this.nodes});

  final List<SceneNode> nodes;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: const EdgeInsets.all(32),
      child: GlassCard(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Структура главы', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 16),
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children:
                    nodes.map((node) => _StructureNode(node: node)).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StructureNode extends StatelessWidget {
  const _StructureNode({required this.node, this.depth = 0});

  final SceneNode node;
  final int depth;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final children = <Widget>[
      Padding(
        padding: EdgeInsets.only(left: depth * 16.0, top: 4, bottom: 4),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.circle, size: 8, color: theme.colorScheme.primary),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                node.title,
                style: theme.textTheme.bodyLarge,
              ),
            ),
          ],
        ),
      ),
    ];

    if (node.children.isNotEmpty) {
      children.addAll(
        node.children
            .map(
              (child) => _StructureNode(
                node: child,
                depth: depth + 1,
              ),
            )
            .toList(),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: children,
    );
  }
}
