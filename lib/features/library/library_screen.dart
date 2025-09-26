import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/models.dart';
import '../../shared/tokens/design_tokens.dart';
import '../../shared/ui/glass_card.dart';
import '../../shared/ui/glass_search_field.dart';
import 'widgets/notebook_card.dart';

final notebooksProvider = StateProvider<List<Notebook>>((ref) {
  return [
    Notebook(
      id: '1',
      title: 'Город из тумана',
      tags: const ['Фантастика', 'Draft'],
      updatedAt: DateTime.now(),
      chapters: 12,
      words: 45213,
      audioMinutes: 95,
    ),
    Notebook(
      id: '2',
      title: 'Практическое руководство по речи',
      tags: const ['Non-fiction'],
      updatedAt: DateTime.now().subtract(const Duration(days: 1)),
      chapters: 8,
      words: 28340,
      audioMinutes: 61,
    ),
    Notebook(
      id: '3',
      title: 'Записки путешественника',
      tags: const ['Эссе', 'Audio-ready'],
      updatedAt: DateTime.now().subtract(const Duration(days: 3)),
      chapters: 15,
      words: 67201,
      audioMinutes: 120,
    ),
  ];
});

class LibraryScreen extends ConsumerWidget {
  const LibraryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notebooks = ref.watch(notebooksProvider);

    return Scaffold(
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
                  onPressed: () {},
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
                              onPressed: () {},
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
                            return NotebookCard(notebook: notebook);
                          },
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        icon: const Icon(Icons.add),
        label: const Text('Новая книга'),
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
