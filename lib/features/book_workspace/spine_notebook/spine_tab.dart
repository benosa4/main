import 'dart:ui';

import 'package:flutter/material.dart';

class SpineTab extends StatelessWidget {
  const SpineTab({
    super.key,
    required this.index,
    required this.lines,
    required this.lineHeight,
    required this.color,
    required this.active,
    required this.onTap,
    required this.spineWidth,
    this.collapsed = false,
    this.isEmpty = false,
    this.onCreate,
  });

  final int index;
  final int lines;
  final double lineHeight;
  final Color color;
  final bool active;
  final VoidCallback onTap;
  final double spineWidth;
  final bool collapsed;
  final bool isEmpty;
  final VoidCallback? onCreate;

  static const double collapsedWidth = 24;

  @override
  Widget build(BuildContext context) {
    final height = lines * lineHeight;
    final width = collapsed ? collapsedWidth : spineWidth;
    final radius = const Radius.circular(18);

    final tapHandler = isEmpty ? (onCreate ?? onTap) : onTap;

    if (isEmpty) {
      return _SpineTabShell(
        width: width,
        height: height,
        collapsed: collapsed,
        child: _DashedSlot(index: index, collapsed: collapsed, onTap: tapHandler),
      );
    }

    final tabContent = ClipPath(
      clipper: _SpineClipper(radius: radius),
      child: Container(
        decoration: BoxDecoration(
          color: color,
          boxShadow: [
            if (active)
              BoxShadow(
                color: const Color(0x4706B6D4),
                blurRadius: 14,
                spreadRadius: 1,
              )
            else
              const BoxShadow(
                color: Color(0x140F172A),
                blurRadius: 12,
                offset: Offset(0, 6),
              ),
          ],
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (active)
              const Positioned(
                left: 0,
                top: 0,
                bottom: 0,
                width: 2.5,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0xFF22D3EE), Color(0xFF67E8F9)],
                    ),
                  ),
                ),
              ),
            Center(
              child: Text(
                index.toString().padLeft(2, '0'),
                style: const TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w700,
                  fontFeatures: [FontFeature.tabularFigures()],
                  color: Color(0xFF0F172A),
                ),
              ),
            ),
          ],
        ),
      ),
    );

    return _SpineTabShell(
      width: width,
      height: height,
      collapsed: collapsed,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: tapHandler,
        child: tabContent,
      ),
    );
  }
}

class _SpineTabShell extends StatelessWidget {
  const _SpineTabShell({
    required this.width,
    required this.height,
    required this.collapsed,
    required this.child,
  });

  final double width;
  final double height;
  final bool collapsed;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOutCubic,
      width: width,
      height: height,
      padding: EdgeInsets.symmetric(horizontal: collapsed ? 0 : 4),
      child: child,
    );
  }
}

class _SpineClipper extends CustomClipper<Path> {
  const _SpineClipper({required this.radius});

  final Radius radius;

  @override
  Path getClip(Size size) {
    final path = Path();
    path.moveTo(0, 6);
    path.lineTo(8, 0);
    path.lineTo(size.width - radius.x, 0);
    path.quadraticBezierTo(size.width, 0, size.width, radius.y);
    path.lineTo(size.width, size.height - radius.y);
    path.quadraticBezierTo(
      size.width,
      size.height,
      size.width - radius.x,
      size.height,
    );
    path.lineTo(8, size.height);
    path.lineTo(0, size.height - 6);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}

class _DashedSlot extends StatelessWidget {
  const _DashedSlot({
    required this.index,
    required this.collapsed,
    required this.onTap,
  });

  final int index;
  final bool collapsed;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: CustomPaint(
        painter: _DashedRectPainter(color: const Color(0xFF94A3B8)),
        child: Center(
          child: Text(
            index.toString().padLeft(2, '0'),
            style: TextStyle(
              fontSize: collapsed ? 11 : 13,
              fontWeight: FontWeight.w600,
              fontFeatures: const [FontFeature.tabularFigures()],
              color: const Color(0xFF64748B),
            ),
          ),
        ),
      ),
    );
  }
}

class _DashedRectPainter extends CustomPainter {
  const _DashedRectPainter({required this.color});

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    const dashWidth = 6.0;
    const dashSpace = 4.0;
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1.3
      ..style = PaintingStyle.stroke;
    final rect = RRect.fromRectAndRadius(
      Rect.fromLTWH(1, 1, size.width - 2, size.height - 2),
      const Radius.circular(14),
    );
    _dashRRect(canvas, rect, paint, dashWidth, dashSpace);
  }

  void _dashRRect(Canvas canvas, RRect rrect, Paint paint, double dashWidth, double dashSpace) {
    final path = Path()..addRRect(rrect);
    final metrics = path.computeMetrics();
    for (final metric in metrics) {
      var distance = 0.0;
      while (distance < metric.length) {
        final next = distance + dashWidth;
        final extract = metric.extractPath(distance, next);
        canvas.drawPath(extract, paint);
        distance = next + dashSpace;
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
