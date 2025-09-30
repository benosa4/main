import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'package:voicebook/features/library/models/collection.dart';
import 'package:voicebook/shared/tokens/design_tokens.dart';

class CollectionCard extends StatefulWidget {
  const CollectionCard({
    super.key,
    required this.collection,
    required this.onOpen,
    required this.onRename,
    required this.onDuplicate,
    required this.onExport,
    required this.onDelete,
  });

  final Collection collection;
  final VoidCallback onOpen;
  final VoidCallback onRename;
  final VoidCallback onDuplicate;
  final VoidCallback onExport;
  final VoidCallback onDelete;

  @override
  State<CollectionCard> createState() => _CollectionCardState();
}

class _CollectionCardState extends State<CollectionCard> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final collection = widget.collection;
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: GestureDetector(
        onTap: widget.onOpen,
        child: AnimatedScale(
          duration: const Duration(milliseconds: 160),
          scale: _hovered ? 1.02 : 1.0,
          child: Card(
            clipBehavior: Clip.antiAlias,
            elevation: _hovered ? 4 : 1,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _Cover(collection: collection),
                Padding(
                  padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: _TitleAndMeta(collection: collection)),
                      _MoreButton(
                        onRename: widget.onRename,
                        onDuplicate: widget.onDuplicate,
                        onExport: widget.onExport,
                        onDelete: widget.onDelete,
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(14, 0, 14, 16),
                  child: ProgressPill(progress: collection.progress),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class CollectionListTile extends StatelessWidget {
  const CollectionListTile({
    super.key,
    required this.collection,
    required this.onOpen,
    required this.onRename,
    required this.onDuplicate,
    required this.onExport,
    required this.onDelete,
  });

  final Collection collection;
  final VoidCallback onOpen;
  final VoidCallback onRename;
  final VoidCallback onDuplicate;
  final VoidCallback onExport;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1.5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onOpen,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              _MiniCover(collection: collection),
              const SizedBox(width: 16),
              Expanded(child: _TitleAndMeta(collection: collection)),
              Padding(
                padding: const EdgeInsets.only(right: 16),
                child: ProgressPill(progress: collection.progress),
              ),
              _MoreButton(
                onRename: onRename,
                onDuplicate: onDuplicate,
                onExport: onExport,
                onDelete: onDelete,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Cover extends StatelessWidget {
  const _Cover({required this.collection});

  final Collection collection;

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 3 / 2,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: buildPresetGradient(collection.cover),
        ),
        child: Align(
          alignment: Alignment.bottomLeft,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Icon(collection.icon, color: Colors.white, size: 42),
          ),
        ),
      ),
    );
  }
}

class _MiniCover extends StatelessWidget {
  const _MiniCover({required this.collection});

  final Collection collection;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 88,
      height: 72,
      decoration: BoxDecoration(
        gradient: buildPresetGradient(collection.cover),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(
        child: Icon(collection.icon, color: Colors.white, size: 32),
      ),
    );
  }
}

class _TitleAndMeta extends StatelessWidget {
  const _TitleAndMeta({required this.collection});

  final Collection collection;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final titleStyle = theme.textTheme.titleMedium?.copyWith(
      fontWeight: FontWeight.w700,
      color: AppColors.textPrimary,
    );
    final subtitleStyle = theme.textTheme.bodySmall?.copyWith(
      color: AppColors.textPrimary.withOpacity(0.6),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          collection.title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: titleStyle,
        ),
        const SizedBox(height: 6),
        Text(
          '${collection.category} • ${collection.sectionsCount} разделов',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: subtitleStyle,
        ),
      ],
    );
  }
}

class _MoreButton extends StatelessWidget {
  const _MoreButton({
    required this.onRename,
    required this.onDuplicate,
    required this.onExport,
    required this.onDelete,
  });

  final VoidCallback onRename;
  final VoidCallback onDuplicate;
  final VoidCallback onExport;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      tooltip: 'Дополнительные действия',
      onSelected: (value) {
        switch (value) {
          case 'rename':
            onRename();
            break;
          case 'duplicate':
            onDuplicate();
            break;
          case 'export':
            onExport();
            break;
          case 'delete':
            onDelete();
            break;
        }
      },
      itemBuilder: (context) => const [
        PopupMenuItem<String>(value: 'rename', child: Text('Переименовать')),
        PopupMenuItem<String>(value: 'duplicate', child: Text('Дублировать')),
        PopupMenuItem<String>(value: 'export', child: Text('Экспорт')),
        PopupMenuDivider(),
        PopupMenuItem<String>(
          value: 'delete',
          child: Text('Удалить'),
        ),
      ],
    );
  }
}

class ProgressPill extends StatelessWidget {
  const ProgressPill({super.key, required this.progress});

  final int progress;

  @visibleForTesting
  static ProgressPalette paletteFor(int value) {
    if (value >= 100) {
      return ProgressPalette(
        background: AppColors.success.withOpacity(0.16),
        foreground: AppColors.success,
      );
    }
    if (value >= 70) {
      return ProgressPalette(
        background: AppColors.primary.withOpacity(0.15),
        foreground: AppColors.primary,
      );
    }
    if (value >= 30) {
      return ProgressPalette(
        background: AppColors.accent.withOpacity(0.15),
        foreground: AppColors.accent,
      );
    }
    return ProgressPalette(
      background: AppColors.neutralGrey.withOpacity(0.14),
      foreground: AppColors.neutralGrey,
    );
  }

  @override
  Widget build(BuildContext context) {
    final palette = paletteFor(progress);
    return Tooltip(
      message:
          'Прогресс рассчитывается по заполненности разделов (ИИ и ручной ввод)',
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: palette.background,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: palette.foreground.withOpacity(0.3)),
        ),
        child: Text(
          '$progress% готово',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            color: palette.foreground,
          ),
        ),
      ),
    );
  }
}

class ProgressPalette {
  const ProgressPalette({
    required this.background,
    required this.foreground,
  });

  final Color background;
  final Color foreground;
}
