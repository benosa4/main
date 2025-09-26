import 'package:flutter/material.dart';

import 'package:voicebook/core/models/notebook.dart';
import 'package:voicebook/shared/tokens/design_tokens.dart';

class NotebookCard extends StatelessWidget {
  const NotebookCard({super.key, required this.notebook, this.onTap, this.onExport});

  final Notebook notebook;
  final VoidCallback? onTap;
  final VoidCallback? onExport;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final gradient = LinearGradient(
      colors: [
        AppColors.primary.withOpacity(0.9),
        AppColors.secondary.withOpacity(0.9),
      ],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );
    return InkWell(
      borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
      onTap: onTap,
      child: Ink(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
          gradient: gradient,
          boxShadow: [
            BoxShadow(
              color: AppColors.secondary.withOpacity(0.2),
              blurRadius: 18,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Stack(
          children: [
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
                  border: Border.all(color: Colors.white.withOpacity(0.12)),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.auto_stories_rounded, color: Colors.white70),
                      const Spacer(),
                      _NotebookMenu(
                        onSelected: (value) {
                          switch (value) {
                            case 'export':
                              onExport?.call();
                              break;
                            default:
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Действие "$value" недоступно в демо.')),
                              );
                          }
                        },
                      ),
                    ],
                  ),
                  const Spacer(),
                  Text(
                    notebook.title,
                    style: theme.textTheme.titleLarge!.copyWith(color: Colors.white),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _TagChip('${notebook.chapters} глав'),
                      _TagChip('${notebook.words ~/ 1000} тыс. слов'),
                      if (notebook.audioMinutes > 0)
                        _TagChip('${notebook.audioMinutes.round()} мин аудио'),
                      ...notebook.tags.map(_TagChip.new),
                    ],
                  ),
                  const SizedBox(height: 16),
                  LinearProgressIndicator(
                    value: (notebook.chapters.clamp(0, 20)) / 20,
                    backgroundColor: Colors.white24,
                    color: Colors.white,
                    minHeight: 4,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Обновлено ${_formatDate(notebook.updatedAt)}',
                    style: theme.textTheme.bodySmall?.copyWith(color: Colors.white70),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NotebookMenu extends StatelessWidget {
  const _NotebookMenu({required this.onSelected});

  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      iconColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radiusSmall)),
      onSelected: onSelected,
      itemBuilder: (context) => const [
        PopupMenuItem(value: 'rename', child: Text('Переименовать')), 
        PopupMenuItem(value: 'duplicate', child: Text('Дублировать')), 
        PopupMenuItem(value: 'export', child: Text('Экспортировать')), 
        PopupMenuItem(value: 'archive', child: Text('Архивировать')), 
      ],
    );
  }
}

class _TagChip extends StatelessWidget {
  const _TagChip(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.18),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(color: Colors.white),
      ),
    );
  }
}

String _formatDate(DateTime date) {
  final now = DateTime.now();
  final difference = now.difference(date);
  if (difference.inDays >= 1) {
    return '${difference.inDays} дн. назад';
  }
  if (difference.inHours >= 1) {
    return '${difference.inHours} ч. назад';
  }
  return 'только что';
}
