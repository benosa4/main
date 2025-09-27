import 'dart:ui';

import 'package:flutter/material.dart';

import 'package:voicebook/shared/tokens/design_tokens.dart';

class ChapterHeaderCard extends StatelessWidget {
  const ChapterHeaderCard({
    super.key,
    required this.titleController,
    required this.subtitleController,
    required this.metaChips,
    required this.onOpenStructure,
    required this.saved,
    this.wordCount,
    this.titleFocusNode,
    this.subtitleFocusNode,
    this.onTitleChanged,
    this.onSubtitleChanged,
  });

  final TextEditingController titleController;
  final TextEditingController subtitleController;
  final List<Widget> metaChips;
  final VoidCallback onOpenStructure;
  final bool saved;
  final int? wordCount;
  final FocusNode? titleFocusNode;
  final FocusNode? subtitleFocusNode;
  final ValueChanged<String>? onTitleChanged;
  final ValueChanged<String>? onSubtitleChanged;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final surfaceColor = Colors.white.withOpacity(0.65);
    final borderColor = AppColors.border.withOpacity(0.18);

    return ClipRRect(
      borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
            color: surfaceColor,
            border: Border.all(color: borderColor),
            boxShadow: const [
              BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4)),
            ],
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                controller: titleController,
                focusNode: titleFocusNode,
                style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w600, height: 1.2),
                decoration: const InputDecoration(
                  border: InputBorder.none,
                  isDense: true,
                  hintText: 'Глава без названия',
                ),
                onChanged: onTitleChanged,
              ),
              const SizedBox(height: 6),
              TextField(
                controller: subtitleController,
                focusNode: subtitleFocusNode,
                style: const TextStyle(color: Color(0xFF64748B), fontSize: 16),
                decoration: const InputDecoration(
                  border: InputBorder.none,
                  isDense: true,
                  hintText: 'Подзаголовок',
                ),
                onChanged: onSubtitleChanged,
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  ...metaChips,
                  OutlinedButton.icon(
                    onPressed: onOpenStructure,
                    icon: const Icon(Icons.hub),
                    label: const Text('Структура'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      backgroundColor: Colors.white.withOpacity(0.5),
                      side: BorderSide(color: borderColor),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(saved ? Icons.check_circle : Icons.sync, size: 18, color: saved ? AppColors.accent : AppColors.secondary),
                  const SizedBox(width: 8),
                  Text(saved ? 'Сохранено' : 'Сохраняем...', style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                  const Spacer(),
                  if (wordCount != null)
                    Row(
                      children: [
                        const Icon(Icons.speed, size: 16, color: Color(0xFF64748B)),
                        const SizedBox(width: 6),
                        Text('$wordCount слов', style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                      ],
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
