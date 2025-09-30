import 'package:flutter/material.dart';

import '../models/reading_prefs.dart';
import '../shared/tokens/design_tokens.dart';

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
          _GradientProgress(value: progress.clamp(0, 1).toDouble(), prefs: prefs),
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

class _GradientProgress extends StatelessWidget {
  final double value;
  final ReadingPrefs prefs;

  const _GradientProgress({required this.value, required this.prefs});

  @override
  Widget build(BuildContext context) {
    // Трек: чуть контрастнее фона текста
    final track = prefs.isDark
        ? Colors.white.withOpacity(.18)
        : Colors.black.withOpacity(.10);

    return ClipRRect(
      borderRadius: BorderRadius.circular(999),
      child: SizedBox(
        height: 8,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Container(color: track),
            Align(
              alignment: Alignment.centerLeft,
              child: FractionallySizedBox(
                widthFactor: value.isNaN ? 0 : value,
                child: DecoratedBox(
                  decoration: BoxDecoration(gradient: _valueGradient(prefs)),
                ),
              ),
            ),
            // лёгкий глянец сверху, чтобы полоса читалась на тёмном
            IgnorePointer(
              ignoring: true,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.white.withOpacity(prefs.isDark ? .10 : .06),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Насыщенный градиент заливки для каждой темы, чтобы не «пропадал» цвет
  static LinearGradient _valueGradient(ReadingPrefs p) {
    switch (p.theme) {
      case ReadingTheme.light:
        return const LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [AppColors.primary, AppColors.accent],
        );
      case ReadingTheme.sepia:
        return const LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [Color(0xFF8B5CF6), Color(0xFF22D3EE)],
        );
      case ReadingTheme.dark:
        return const LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [Color(0xFF9F7AEA), Color(0xFF67E8F9)],
        );
    }
  }
}
