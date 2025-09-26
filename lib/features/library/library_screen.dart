import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/models/models.dart';
import '../../core/providers/app_providers.dart';
import '../../shared/tokens/design_tokens.dart';
import '../../shared/ui/glass_card.dart';
import '../../shared/ui/glass_search_field.dart';
import 'widgets/notebook_card.dart';

class LibraryScreen extends ConsumerWidget {
  const LibraryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notebooks = ref.watch(notebooksProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Библиотека'),
        actions: [
          IconButton(
            tooltip: 'Настройки',
            onPressed: () => context.pushNamed('settings'),
            icon: const Icon(Icons.settings_outlined),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.outer),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Expanded(
                  child: GlassSearchField(
                    hintText: 'Поиск по библиотеке',
                    onChanged: (_) {},
                  ),
                ),
                const SizedBox(width: 16),
                FilledButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Фильтры доступны в демо режиме.')),
                    );
                  },
                  icon: const Icon(Icons.tune),
                  label: const Text('Фильтры'),
                ),
              ],
            ),
            const SizedBox(height: 24),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: const [
                  _TagChip(label: 'Все проекты', selected: true),
                  SizedBox(width: 12),
                  _TagChip(label: 'Черновики'),
                  SizedBox(width: 12),
                  _TagChip(label: 'Готово к озвучке'),
                  SizedBox(width: 12),
                  _TagChip(label: 'Избранное'),
                ],
              ),
            ),
            const SizedBox(height: 32),
            Expanded(
              child: notebooks.isEmpty
                  ? Center(
                      child: GlassCard(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text('Создайте свою первую книгу',
                                style: Theme.of(context).textTheme.headlineMedium),
                            const SizedBox(height: 16),
                            FilledButton.icon(
                              onPressed: () => _showDemoDialog(context),
                              icon: const Icon(Icons.add),
                              label: const Text('Новая книга'),
                            ),
                          ],
                        ),
                      ),
                    )
                  : LayoutBuilder(
                      builder: (context, constraints) {
                        final crossAxisCount = constraints.maxWidth ~/ 260;
                        return GridView.builder(
                          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: crossAxisCount.clamp(1, 5),
                            crossAxisSpacing: AppSpacing.gutter,
                            mainAxisSpacing: AppSpacing.gutter,
                            childAspectRatio: 0.72,
                          ),
                          itemCount: notebooks.length,
                          itemBuilder: (context, index) {
                            final notebook = notebooks[index];
                            return NotebookCard(
                              notebook: notebook,
                              onTap: () => _openNotebook(context, notebook),
                              onExport: () => context.pushNamed('export', queryParameters: {'bookId': notebook.id}),
                            );
                          },
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showDemoDialog(context),
        icon: const Icon(Icons.add),
        label: const Text('Новая книга'),
      ),
    );
  }

  void _openNotebook(BuildContext context, Notebook notebook) {
    context.pushNamed('book', pathParameters: {'bookId': notebook.id});
  }

  void _showDemoDialog(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Демо режим'),
        content: const Text('Создание и импорт книг появится после подключения реального хранилища.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Понятно'),
          ),
        ],
      ),
    );
  }
}

class _TagChip extends StatelessWidget {
  const _TagChip({required this.label, this.selected = false});

  final String label;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return FilterChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) {},
      selectedColor: theme.colorScheme.primary.withOpacity(0.16),
      backgroundColor: theme.colorScheme.surface.withOpacity(0.08),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radiusLarge)),
      side: BorderSide(color: theme.colorScheme.primary.withOpacity(0.2)),
      labelStyle: theme.textTheme.bodyMedium,
    );
  }
}
