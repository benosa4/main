import 'package:flutter/material.dart';

import 'package:voicebook/core/models/models.dart';
import 'package:voicebook/shared/tokens/design_tokens.dart';

class ChapterRuler extends StatelessWidget {
  const ChapterRuler({
    super.key,
    required this.chapters,
    required this.onSelect,
    required this.onAdd,
    required this.onReorder,
    this.activeChapterId,
  });

  final List<ChapterSummary> chapters;
  final ValueChanged<String> onSelect;
  final VoidCallback onAdd;
  final void Function(int from, int to) onReorder;
  final String? activeChapterId;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final useVertical = !constraints.hasBoundedHeight || constraints.maxHeight > constraints.maxWidth;
        final decoration = BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppColors.primary, AppColors.secondary],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.secondary.withOpacity(0.2),
              blurRadius: 20,
              offset: const Offset(0, 12),
            ),
          ],
        );

        if (useVertical) {
          return ClipRRect(
            borderRadius: BorderRadius.circular(AppSpacing.radiusLarge),
            child: Container(
              decoration: decoration,
              child: Column(
                children: [
                  Expanded(
                    child: ReorderableListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      itemCount: chapters.length,
                      buildDefaultDragHandles: false,
                      onReorder: onReorder,
                      itemBuilder: (context, index) {
                        final chapter = chapters[index];
                        final isActive = chapter.id == activeChapterId;
                        return Padding(
                          key: ValueKey(chapter.id),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          child: _ChapterPill(
                            chapter: chapter,
                            index: index,
                            isActive: isActive,
                            onTap: () => onSelect(chapter.id),
                          ),
                        );
                      },
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: _AddChapterButton(onPressed: onAdd, compact: false),
                  ),
                ],
              ),
            ),
          );
        }

        return ClipRRect(
          borderRadius: BorderRadius.circular(AppSpacing.radiusLarge),
          child: Container(
            decoration: decoration,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            child: Row(
              children: [
                Expanded(
                  child: ReorderableListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    buildDefaultDragHandles: false,
                    itemCount: chapters.length,
                    onReorder: onReorder,
                    itemBuilder: (context, index) {
                      final chapter = chapters[index];
                      final isActive = chapter.id == activeChapterId;
                      return Padding(
                        key: ValueKey(chapter.id),
                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                        child: _CompactChapterPill(
                          chapter: chapter,
                          index: index,
                          isActive: isActive,
                          onTap: () => onSelect(chapter.id),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 8),
                _AddChapterButton(onPressed: onAdd, compact: true),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _ChapterPill extends StatelessWidget {
  const _ChapterPill({
    required this.chapter,
    required this.index,
    required this.isActive,
    required this.onTap,
  });

  final ChapterSummary chapter;
  final int index;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLarge),
        onTap: onTap,
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusLarge),
            color: isActive ? Colors.white.withOpacity(0.24) : Colors.white.withOpacity(0.12),
            border: Border.all(
              color: isActive ? Colors.white : Colors.white24,
              width: isActive ? 1.6 : 1,
            ),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(
            children: [
              ReorderableDelayedDragStartListener(
                index: index,
                child: _DragHandle(isActive: isActive),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Глава ${index + 1}',
                      style: theme.textTheme.labelMedium?.copyWith(color: Colors.white70),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      chapter.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.titleSmall?.copyWith(color: Colors.white),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${chapter.wordCount} слов',
                      style: theme.textTheme.bodySmall?.copyWith(color: Colors.white60),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Icon(Icons.bookmark_add_outlined, color: Colors.white70, size: 18),
            ],
          ),
        ),
      ),
    );
  }
}

class _CompactChapterPill extends StatelessWidget {
  const _CompactChapterPill({
    required this.chapter,
    required this.index,
    required this.isActive,
    required this.onTap,
  });

  final ChapterSummary chapter;
  final int index;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        child: Ink(
          width: 160,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
            color: isActive ? Colors.white.withOpacity(0.26) : Colors.white.withOpacity(0.14),
            border: Border.all(color: isActive ? Colors.white : Colors.white24, width: 1),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Глава ${index + 1}',
                      style: theme.textTheme.labelSmall?.copyWith(color: Colors.white70),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  ReorderableDelayedDragStartListener(
                    index: index,
                    child: const Icon(Icons.drag_handle, size: 16, color: Colors.white54),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                chapter.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.titleSmall?.copyWith(color: Colors.white),
              ),
              const SizedBox(height: 4),
              Text(
                '${chapter.wordCount} слов',
                style: theme.textTheme.bodySmall?.copyWith(color: Colors.white60),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AddChapterButton extends StatelessWidget {
  const _AddChapterButton({required this.onPressed, required this.compact});

  final VoidCallback onPressed;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final foreground = Colors.white;
    final background = Colors.white.withOpacity(0.16);

    if (compact) {
      return Tooltip(
        message: 'Новая глава',
        child: Container(
          decoration: BoxDecoration(
            color: background,
            borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
            border: Border.all(color: Colors.white24),
          ),
          child: IconButton(
            onPressed: onPressed,
            color: foreground,
            icon: const Icon(Icons.add),
          ),
        ),
      );
    }

    return SizedBox(
      width: double.infinity,
      child: FilledButton(
        style: FilledButton.styleFrom(
          backgroundColor: background,
          foregroundColor: foreground,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radiusMedium)),
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        ),
        onPressed: onPressed,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.add),
            SizedBox(height: 6),
            Text(
              'Новая глава',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _DragHandle extends StatelessWidget {
  const _DragHandle({required this.isActive});

  final bool isActive;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 38,
      width: 6,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        gradient: LinearGradient(
          colors: [
            Colors.white.withOpacity(0.9),
            Colors.white.withOpacity(isActive ? 0.3 : 0.15),
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
    );
  }
}
