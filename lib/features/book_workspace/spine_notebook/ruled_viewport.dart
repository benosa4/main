import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class RuledViewport extends StatelessWidget {
  const RuledViewport({
    super.key,
    required this.controller,
    required this.lineHeight,
    required this.spineWidth,
    required this.child,
    this.actionZoneWidth = 40,
    this.accentColor,
    this.textBands = const <Rect>[],
  });

  final ScrollController controller;
  final double lineHeight;
  final double spineWidth;
  final double actionZoneWidth;
  final Color? accentColor;
  final List<Rect> textBands;
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
            actionZoneWidth: actionZoneWidth,
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
    required this.actionZoneWidth,
    required this.accentColor,
    required this.textBands,
  });

  final ScrollController controller;
  final double lineHeight;
  final double spineWidth;
  final double actionZoneWidth;
  final Color? accentColor;
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
        actionZoneWidth: widget.actionZoneWidth,
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
    required this.actionZoneWidth,
    required this.accentColor,
    required this.textBands,
  });

  final double offset;
  final double lineHeight;
  final double spineWidth;
  final double actionZoneWidth;
  final Color? accentColor;
  final List<Rect> textBands;

  @override
  void paint(Canvas canvas, Size size) {
    final baseY = -(offset % lineHeight);
    final linePaint = Paint()
      ..color = const Color(0xFFCBD5E1).withOpacity(0.28)
      ..strokeWidth = 1;
    for (double y = baseY; y < size.height; y += lineHeight) {
      canvas.drawLine(Offset(spineWidth, y), Offset(size.width, y), linePaint);
    }

    final marginX = spineWidth + actionZoneWidth + 12;
    final marginPaint = Paint()
      ..color = const Color(0xFFEF4444).withOpacity(0.40)
      ..strokeWidth = 2;
    canvas.drawLine(
      Offset(marginX, 0),
      Offset(marginX, size.height),
      marginPaint,
    );

    final accent = accentColor;
    if (accent != null) {
      final bandPaint = Paint()
        ..color = accent.withOpacity(0.35)
        ..style = PaintingStyle.fill;
      final bandRect = Rect.fromLTWH(spineWidth + 4, 0, 6, size.height);
      final rrect = RRect.fromRectAndCorners(
        bandRect,
        topLeft: const Radius.circular(3),
        bottomLeft: const Radius.circular(3),
        topRight: const Radius.circular(3),
        bottomRight: const Radius.circular(3),
      );
      canvas.drawRRect(rrect, bandPaint);
    }

    final whitePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    for (final band in textBands) {
      final rrect = RRect.fromRectAndRadius(band, const Radius.circular(6));
      canvas.drawRRect(rrect, whitePaint);
    }
  }

  @override
  bool shouldRepaint(covariant _RuledPainter oldDelegate) {
    return oldDelegate.offset != offset ||
        oldDelegate.lineHeight != lineHeight ||
        oldDelegate.spineWidth != spineWidth ||
        oldDelegate.actionZoneWidth != actionZoneWidth ||
        oldDelegate.accentColor != accentColor ||
        !listEquals(oldDelegate.textBands, textBands);
  }
}
