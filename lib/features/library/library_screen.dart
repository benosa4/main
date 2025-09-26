import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:voicebook/core/models/models.dart';
import 'package:voicebook/core/providers/app_providers.dart';
import 'package:voicebook/shared/tokens/design_tokens.dart';
import 'package:voicebook/shared/ui/glass_card.dart';
import 'package:voicebook/shared/ui/glass_search_field.dart';
import 'widgets/notebook_card.dart';

class LibraryScreen extends ConsumerWidget {
  const LibraryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final storeState = ref.watch(voicebookStoreProvider);
    final notebooks = ref.watch(notebooksProvider);

    if (storeState.isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Библиотека')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (storeState.hasError) {
      return Scaffold(
        appBar: AppBar(title: const Text('Библиотека')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.outer),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline, size: 48),
                const SizedBox(height: 16),
                Text(
                  'Не удалось загрузить библиотеку. Попробуйте перезапустить приложение.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
          ),
        ),
      );
    }

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
                  onPressed: () => _createNotebook(context, ref),
                  icon: const Icon(Icons.tune),
                  label: const Text('Новая книга'),
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
                              onPressed: () => _createNotebook(context, ref),
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
        onPressed: () => _createNotebook(context, ref),
        icon: const Icon(Icons.add),
        label: const Text('Новая книга'),
      ),
    );
  }

  void _openNotebook(BuildContext context, Notebook notebook) {
    context.pushNamed('book', pathParameters: {'bookId': notebook.id});
  }

  Future<void> _createNotebook(BuildContext context, WidgetRef ref) async {
    final notebook = await _showCreateDialog(context, ref);
    if (notebook != null && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Проект «${notebook.title}» создан и сохранён локально.')),
      );
      _openNotebook(context, notebook);
    }
  }

  Future<Notebook?> _showCreateDialog(BuildContext context, WidgetRef ref) {
    final controller = TextEditingController(text: 'Новый проект');
    return showDialog<Notebook>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Новая книга'),
          content: TextField(
            controller: controller,
            autofocus: true,
            decoration: const InputDecoration(labelText: 'Название проекта'),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('Отмена'),
            ),
            FilledButton(
              onPressed: () async {
                final navigator = Navigator.of(dialogContext);
                final title = controller.text.trim();
                final notebook = await ref
                    .read(voicebookStoreProvider.notifier)
                    .createNotebook(title);
                if (dialogContext.mounted) {
                  navigator.pop(notebook);
                }
              },
              child: const Text('Создать'),
            ),
          ],
        );
      },
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
