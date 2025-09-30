import 'dart:math';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';

import 'spine_constants.dart';

class RuledViewport extends StatelessWidget {
  const RuledViewport({
    super.key,
    required this.controller,
    required this.child,
    required this.accentColor,
    required this.textBands,
    this.lineHeight = kLineHeight,
    this.spineWidth = kSpineWidth,
    this.rightMarginOffset = kRightMarginOffset,
  });

  final ScrollController controller;
  final double lineHeight;
  final double spineWidth;
  final double rightMarginOffset;
  final Widget child;
  final Color accentColor;
  final List<Rect> textBands;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: _RuledBackground(
            controller: controller,
            lineHeight: lineHeight,
            spineWidth: spineWidth,
            rightMarginOffset: rightMarginOffset,
            accentColor: accentColor,
            textBands: textBands,
          ),
        ),
        child,
      ],
    );
  }
}

class _RuledBackground extends StatefulWidget {
  const _RuledBackground({
    required this.controller,
    required this.lineHeight,
    required this.spineWidth,
    required this.rightMarginOffset,
    required this.accentColor,
    required this.textBands,
  });

  final ScrollController controller;
  final double lineHeight;
  final double spineWidth;
  final double rightMarginOffset;
  final Color accentColor;
  final List<Rect> textBands;

  @override
  State<_RuledBackground> createState() => _RuledBackgroundState();
}

class _RuledBackgroundState extends State<_RuledBackground> {
  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_redraw);
  }

  @override
  void didUpdateWidget(covariant _RuledBackground oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controller != widget.controller) {
      oldWidget.controller.removeListener(_redraw);
      widget.controller.addListener(_redraw);
    }
  }

  void _redraw() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    widget.controller.removeListener(_redraw);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final offset = widget.controller.hasClients ? widget.controller.offset : 0.0;
    return CustomPaint(
      painter: _RuledPainter(
        offset: offset,
        lineHeight: widget.lineHeight,
        spineWidth: widget.spineWidth,
        rightMarginOffset: widget.rightMarginOffset,
        accentColor: widget.accentColor,
        textBands: widget.textBands,
      ),
    );
  }
}

class _RuledPainter extends CustomPainter {
  const _RuledPainter({
    required this.offset,
    required this.lineHeight,
    required this.spineWidth,
    required this.rightMarginOffset,
    required this.accentColor,
    required this.textBands,
  });

  final double offset;
  final double lineHeight;
  final double spineWidth;
  final double rightMarginOffset;
  final Color accentColor;
  final List<Rect> textBands;

  @override
  void paint(Canvas canvas, Size size) {
    final baseY = -(offset % lineHeight);
    final linePaint = Paint()
      ..color = const Color(0xFFCBD5E1).withOpacity(0.28)
      ..strokeWidth = 1;
    final double lineStart = spineWidth;
    final double lineEnd = size.width;
    for (double y = baseY; y < size.height; y += lineHeight) {
      canvas.drawLine(Offset(lineStart, y), Offset(lineEnd, y), linePaint);
    }

    final marginPaint = Paint()
      ..color = const Color(0xFFEF4444).withOpacity(0.40)
      ..strokeWidth = 2;
    final double marginX = size.width - rightMarginOffset;
    canvas.drawLine(Offset(marginX, 0), Offset(marginX, size.height), marginPaint);

    final accentPaint = Paint()
      ..color = accentColor.withOpacity(0.35);
    final Rect accentRect = Rect.fromLTWH(spineWidth + 4, 0, 6, size.height);
    canvas.drawRect(accentRect, accentPaint);

    if (textBands.isNotEmpty) {
      final Paint maskPaint = Paint()
        ..color = Colors.white
        ..style = PaintingStyle.fill;
      for (final Rect band in textBands) {
        final Rect shifted = band.shift(Offset(0, -offset));
        if (shifted.bottom < 0 || shifted.top > size.height) {
          continue;
        }
        final Rect clipped = Rect.fromLTRB(
          shifted.left,
          shifted.top.clamp(-lineHeight, size.height + lineHeight),
          shifted.right,
          shifted.bottom.clamp(-lineHeight, size.height + lineHeight),
        );
        canvas.drawRect(clipped, maskPaint);
      }
    }

    final noisePaint = Paint()
      ..color = const Color(0xFF1E293B).withOpacity(0.06)
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 1;
    final random = Random(137);
    for (double y = 0; y < size.height; y += 6) {
      for (double x = spineWidth; x < size.width; x += 6) {
        if (random.nextDouble() > 0.55) {
          final dx = random.nextDouble() * 2;
          final dy = random.nextDouble() * 2;
          canvas.drawPoints(
            ui.PointMode.points,
            [Offset(x + dx, y + dy)],
            noisePaint,
          );
        }
      }
    }
  }

  @override
  bool shouldRepaint(covariant _RuledPainter oldDelegate) {
    return oldDelegate.offset != offset ||
        oldDelegate.lineHeight != lineHeight ||
        oldDelegate.spineWidth != spineWidth ||
        oldDelegate.rightMarginOffset != rightMarginOffset ||
        oldDelegate.accentColor != accentColor ||
        !_listEquals(oldDelegate.textBands, textBands);
  }

  bool _listEquals(List<Rect> a, List<Rect> b) {
    if (identical(a, b)) {
      return true;
    }
    if (a.length != b.length) {
      return false;
    }
    for (var i = 0; i < a.length; i += 1) {
      if (a[i] != b[i]) {
        return false;
      }
    }
    return true;
  }
}
