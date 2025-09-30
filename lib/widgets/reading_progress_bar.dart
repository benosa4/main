import 'package:flutter/material.dart';

import '../shared/tokens/design_tokens.dart';

class ReadingProgressBar extends StatelessWidget {
  final double progress;
  final int words;

  const ReadingProgressBar({
    super.key,
    required this.progress,
    required this.words,
  });

  @override
  Widget build(BuildContext context) {
    final pct = (progress * 100).clamp(0, 100).round();
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final onSurface = theme.colorScheme.onSurface.withOpacity(.55);
    final trackColor = theme.colorScheme.onSurface.withOpacity(.08);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Прогресс чтения',
                style: textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700) ??
                    const TextStyle(fontWeight: FontWeight.w700),
              ),
              const Spacer(),
              Text('$pct%'),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: progress.clamp(0, 1).toDouble(),
              minHeight: 8,
              backgroundColor: trackColor,
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '${_fmt(words)} слов',
            style: textTheme.bodySmall?.copyWith(color: onSurface) ?? TextStyle(color: onSurface),
          ),
        ],
      ),
    );
  }

  static String _fmt(int n) {
    final s = n.toString();
    final buf = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      final p = s.length - i;
      buf.write(s[i]);
      if (p > 1 && p % 3 == 1) buf.write(' ');
    }
    return buf.toString();
  }
}
