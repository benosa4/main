import 'dart:math';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';

class RuledViewport extends StatelessWidget {
  const RuledViewport({
    super.key,
    required this.controller,
    this.lineHeight = 28,
    this.spineWidth = 104,
    required this.child,
  });

  final ScrollController controller;
  final double lineHeight;
  final double spineWidth;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: _RuledBackground(
            controller: controller,
            lineHeight: lineHeight,
            spineWidth: spineWidth,
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
  });

  final ScrollController controller;
  final double lineHeight;
  final double spineWidth;

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
      ),
    );
  }
}

class _RuledPainter extends CustomPainter {
  const _RuledPainter({
    required this.offset,
    required this.lineHeight,
    required this.spineWidth,
  });

  final double offset;
  final double lineHeight;
  final double spineWidth;

  @override
  void paint(Canvas canvas, Size size) {
    final baseY = -(offset % lineHeight);
    final linePaint = Paint()
      ..color = const Color(0xFFCBD5E1).withOpacity(0.28)
      ..strokeWidth = 1;
    for (double y = baseY; y < size.height; y += lineHeight) {
      canvas.drawLine(Offset(spineWidth, y), Offset(size.width, y), linePaint);
    }

    final marginPaint = Paint()
      ..color = const Color(0xFFEF4444).withOpacity(0.40)
      ..strokeWidth = 2;
    canvas.drawLine(
      Offset(spineWidth + 24, 0),
      Offset(spineWidth + 24, size.height),
      marginPaint,
    );

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
        oldDelegate.spineWidth != spineWidth;
  }
}
