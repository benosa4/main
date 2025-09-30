import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../core/models/chapter.dart';

class ChapterReaderView extends StatelessWidget {
  const ChapterReaderView({
    super.key,
    required this.chapter,
    required this.onEdit,
    this.accentColor,
  });

  final Chapter chapter;
  final VoidCallback onEdit;
  final Color? accentColor;

  static const double _maxTextWidth = 720;
  static const double _minTextWidth = 560;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveAccent = accentColor ?? const Color(0xFF6366F1);
    final titleStyle = theme.textTheme.headlineSmall?.copyWith(
      fontWeight: FontWeight.w700,
      color: const Color(0xFF0F172A),
    );
    final bodyStyle = theme.textTheme.bodyLarge?.copyWith(
      height: 1.7,
      fontSize: 18,
      color: const Color(0xFF0F172A),
    );
    final bodyText = chapter.body.isNotEmpty
        ? chapter.body
        : chapter.blocks.map((block) => block.text).join('\n\n');
    final paragraphs = bodyText.isEmpty
        ? const <String>[]
        : bodyText.split(RegExp(r'\n{2,}')).where((value) => value.trim().isNotEmpty).toList();

    return LayoutBuilder(
      builder: (context, constraints) {
        final available = constraints.maxWidth.isFinite
            ? math.max(0.0, constraints.maxWidth - 64)
            : _maxTextWidth;
        final maxWidth = math.min(_maxTextWidth, available);
        final targetWidth = maxWidth.clamp(_minTextWidth, _maxTextWidth) as double;
        return Align(
          alignment: Alignment.topCenter,
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(vertical: 32),
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: targetWidth),
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x140F172A),
                      blurRadius: 24,
                      offset: Offset(0, 12),
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 36),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(chapter.title, style: titleStyle),
                      if (chapter.subtitle != null && chapter.subtitle!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          chapter.subtitle!,
                          style: theme.textTheme.titleMedium?.copyWith(
                            color: effectiveAccent,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                      const SizedBox(height: 24),
                      for (final paragraph in paragraphs) ...[
                        Text(paragraph.trim(), style: bodyStyle),
                        const SizedBox(height: 18),
                      ],
                      Align(
                        alignment: Alignment.centerRight,
                        child: FilledButton.icon(
                          onPressed: onEdit,
                          icon: const Icon(Icons.edit_outlined),
                          label: const Text('Редактировать'),
                          style: FilledButton.styleFrom(
                            backgroundColor: effectiveAccent,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
