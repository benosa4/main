import 'package:flutter/material.dart';

import '../../../../core/models/models.dart';
import '../../../../shared/tokens/design_tokens.dart';

class ChapterRuler extends StatelessWidget {
  const ChapterRuler({
    super.key,
    required this.chapters,
    required this.onSelect,
    required this.onAdd,
    required this.onReorder,
  });

  final List<ChapterSummary> chapters;
  final ValueChanged<String> onSelect;
  final VoidCallback onAdd;
  final void Function(int from, int to) onReorder;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary, AppColors.secondary],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(AppSpacing.radiusLarge),
      ),
      child: Column(
        children: [
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(vertical: 24),
              itemCount: chapters.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final chapter = chapters[index];
                return _ChapterPill(
                  title: chapter.title,
                  index: index + 1,
                  onTap: () => onSelect(chapter.id),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white,
                side: const BorderSide(color: Colors.white70),
              ),
              onPressed: onAdd,
              icon: const Icon(Icons.add),
              label: const Text('Глава'),
            ),
          ),
        ],
      ),
    );
  }
}

class _ChapterPill extends StatelessWidget {
  const _ChapterPill({required this.title, required this.index, required this.onTap});

  final String title;
  final int index;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLarge),
        onTap: onTap,
        child: Ink(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusLarge),
            color: Colors.white.withOpacity(0.2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Глава $index', style: theme.textTheme.labelMedium?.copyWith(color: Colors.white70)),
              const SizedBox(height: 4),
              Text(title, style: theme.textTheme.titleMedium?.copyWith(color: Colors.white)),
            ],
          ),
        ),
      ),
    );
  }
}
