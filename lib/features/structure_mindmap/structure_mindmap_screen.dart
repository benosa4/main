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
        padding: const EdgeInsets.all(32),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 860, maxHeight: 640),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Text('Структура главы', style: Theme.of(context).textTheme.headlineMedium),
                  const Spacer(),
                  IconButton(onPressed: () {}, icon: const Icon(Icons.help_outline)),
                ],
              ),
              const SizedBox(height: 16),
              TextField(
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.search),
                  hintText: 'Поиск по сценам',
                  filled: true,
                  fillColor: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.6),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  FilledButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.add),
                    label: const Text('Добавить сцену'),
                  ),
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.account_tree_outlined),
                    label: const Text('Развернуть все'),
                  ),
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.undo),
                    label: const Text('Отменить'),
                  ),
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.redo),
                    label: const Text('Повторить'),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: ListView(
                    children: nodes
                        .map(
                          (node) => _MindmapNode(
                            node: node,
                            depth: 0,
                          ),
                        )
                        .toList(),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  FilledButton.icon(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.check),
                    label: const Text('Вставить якоря'),
                  ),
                  const SizedBox(width: 12),
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Закрыть'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MindmapNode extends StatelessWidget {
  const _MindmapNode({required this.node, required this.depth});

  final SceneNode node;
  final int depth;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLeaf = node.children.isEmpty;
    return Card(
      margin: EdgeInsets.only(left: depth * 24.0, right: 16, bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(isLeaf ? Icons.note_outlined : Icons.fork_right, color: theme.colorScheme.primary),
                const SizedBox(width: 12),
                Expanded(child: Text(node.title, style: theme.textTheme.titleMedium)),
                PopupMenuButton<String>(
                  itemBuilder: (context) => const [
                    PopupMenuItem(value: 'add', child: Text('Добавить дочернюю сцену')),
                    PopupMenuItem(value: 'rename', child: Text('Переименовать')),
                    PopupMenuItem(value: 'delete', child: Text('Удалить')),
                  ],
                ),
              ],
            ),
            if (node.children.isNotEmpty) ...[
              const SizedBox(height: 12),
              Column(
                children: node.children
                    .map(
                      (child) => _MindmapNode(
                        node: child,
                        depth: depth + 1,
                      ),
                    )
                    .toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
