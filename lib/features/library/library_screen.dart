import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/models.dart';
import '../../shared/tokens/design_tokens.dart';
import '../../shared/ui/glass_app_bar.dart';
import '../../shared/ui/glass_card.dart';
import '../../shared/ui/primary_button.dart';
import 'widgets/notebook_card.dart';

final notebooksProvider = StateProvider<List<Notebook>>((ref) => const []);

class LibraryScreen extends ConsumerWidget {
  const LibraryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notebooks = ref.watch(notebooksProvider);

    return Scaffold(
      appBar: GlassAppBar(
        title: 'Библиотека',
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.outer),
        child: notebooks.isEmpty
            ? Center(
                child: GlassCard(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Создайте свою первую книгу',
                          style: Theme.of(context).textTheme.headlineMedium),
                      const SizedBox(height: 16),
                      const PrimaryButton(label: 'Новая книга', onPressed: null, icon: Icons.add),
                    ],
                  ),
                ),
              )
            : GridView.builder(
                itemCount: notebooks.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: AppSpacing.gutter,
                  mainAxisSpacing: AppSpacing.gutter,
                  childAspectRatio: 0.72,
                ),
                itemBuilder: (context, index) {
                  final notebook = notebooks[index];
                  return NotebookCard(notebook: notebook);
                },
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
