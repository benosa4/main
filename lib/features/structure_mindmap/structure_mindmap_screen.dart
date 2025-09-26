import 'package:flutter/material.dart';
import 'package:flutter_treeview/flutter_treeview.dart';

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
              child: TreeView(
                shrinkWrap: true,
                controller: TreeViewController(
                  children: nodes
                      .map(
                        (node) => Node(
                          label: node.title,
                          key: node.id,
                          children: node.children
                              .map((child) => Node(label: child.title, key: child.id))
                              .toList(),
                        ),
                      )
                      .toList(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
