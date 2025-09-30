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
    final track = prefs.isDark
        ? Colors.white.withOpacity(.16)
        : Colors.black.withOpacity(.08);

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
                  decoration: BoxDecoration(gradient: prefs.chromeGradient),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
