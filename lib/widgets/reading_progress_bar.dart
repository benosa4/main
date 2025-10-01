import 'package:flutter/material.dart';

import '../models/reading_prefs.dart';

class ReadingProgressBar extends StatelessWidget {
  final double progress;
  final int words;
  final ReadingPrefs prefs;

  const ReadingProgressBar({
    super.key,
    required this.progress,
    required this.words,
    required this.prefs,
  });

  @override
  Widget build(BuildContext context) {
    final pct = (progress * 100).clamp(0, 100).round();
    final onColor = prefs.textColor;
    final subColor = onColor.withOpacity(.60);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Прогресс чтения',
                style: TextStyle(fontWeight: FontWeight.w700, color: onColor),
              ),
              const Spacer(),
              Text('$pct%', style: TextStyle(color: onColor)),
            ],
          ),
          const SizedBox(height: 8),
          _BarProgress(value: progress.clamp(0, 1), prefs: prefs),
          const SizedBox(height: 6),
          Text('${_fmt(words)} слов', style: TextStyle(color: subColor)),
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

/// Прогресс без CustomPainter: надёжная вёрстка через LayoutBuilder.
class _BarProgress extends StatelessWidget {
  final double value;
  final ReadingPrefs prefs;
  const _BarProgress({required this.value, required this.prefs});

  @override
  Widget build(BuildContext context) {
    final track =
        prefs.isDark ? Colors.white.withOpacity(.18) : Colors.black.withOpacity(.10);

    return ClipRRect(
      borderRadius: BorderRadius.circular(999),
      child: Container(
        height: 8,
        color: track,
        child: LayoutBuilder(
          builder: (ctx, c) {
            final v = value.isNaN ? 0.0 : value.clamp(0.0, 1.0);
            final targetW = c.maxWidth * v;
            final minW = v > 0 ? 2.0 : 0.0;
            return Align(
              alignment: Alignment.centerLeft,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                curve: Curves.easeOut,
                width: targetW < minW ? minW : targetW,
                height: 8,
                decoration: BoxDecoration(gradient: _valueGradient(prefs)),
              ),
            );
          },
        ),
      ),
    );
  }
}

// Контрастный градиент заливки под тему
LinearGradient _valueGradient(ReadingPrefs p) {
  switch (p.theme) {
    case ReadingTheme.light:
      return const LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [Color(0xFF7C3AED), Color(0xFF06B6D4)]);
    case ReadingTheme.sepia:
      return const LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [Color(0xFF8B5CF6), Color(0xFF22D3EE)]);
    case ReadingTheme.dark:
      return const LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [Color(0xFF9F7AEA), Color(0xFF67E8F9)]);
  }
}
