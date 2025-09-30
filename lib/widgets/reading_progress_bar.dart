import 'package:flutter/material.dart';

import '../models/reading_prefs.dart';
// design_tokens не нужен здесь

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
          _PaintedProgress(value: progress.clamp(0, 1), prefs: prefs),
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

/// Надёжная отрисовка прогресса через CustomPainter:
/// - трек с мягким контрастом;
/// - заливка контрастным градиентом;
/// - минимальная видимая ширина, чтобы полоса не исчезала при малых значениях.
class _PaintedProgress extends StatelessWidget {
  final double value;
  final ReadingPrefs prefs;

  const _PaintedProgress({required this.value, required this.prefs});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 8,
      child: CustomPaint(
        painter: _ProgressPainter(value: value.isNaN ? 0 : value, prefs: prefs),
      ),
    );
  }
}

class _ProgressPainter extends CustomPainter {
  final double value;
  final ReadingPrefs prefs;

  _ProgressPainter({required this.value, required this.prefs});

  @override
  void paint(Canvas canvas, Size size) {
    final r = Radius.circular(size.height / 2);
    // Трек: мягкий и контрастный к фону текста
    final trackPaint = Paint()
      ..color = prefs.isDark
          ? Colors.white.withOpacity(.18)
          : Colors.black.withOpacity(.10);
    final trackRRect = RRect.fromRectAndCorners(
      Offset.zero & size,
      topLeft: r,
      topRight: r,
      bottomLeft: r,
      bottomRight: r,
    );
    canvas.drawRRect(trackRRect, trackPaint);

    if (value <= 0) return;

    // Минимальная видимая ширина, чтобы полоса не исчезала на малых значениях
    final w = (size.width * value).clamp(2.0, size.width);
    final fillRect = Rect.fromLTWH(0, 0, w, size.height);
    final fillPaint = Paint()
      ..shader = _valueGradient(prefs).createShader(fillRect);
    final fillRRect = RRect.fromRectAndCorners(
      fillRect,
      topLeft: r,
      bottomLeft: r,
      topRight: r,
      bottomRight: r,
    );
    canvas.drawRRect(fillRRect, fillPaint);
  }

  @override
  bool shouldRepaint(covariant _ProgressPainter oldDelegate) {
    return oldDelegate.value != value || oldDelegate.prefs.theme != prefs.theme;
  }
}

// Контрастный градиент заливки под тему
LinearGradient _valueGradient(ReadingPrefs p) {
  switch (p.theme) {
    case ReadingTheme.light:
      return const LinearGradient(
        begin: Alignment.centerLeft,
        end: Alignment.centerRight,
        colors: [Color(0xFF7C3AED), Color(0xFF06B6D4)],
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
