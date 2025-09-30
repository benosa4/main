import 'dart:ui';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'spine_constants.dart';

class SpineTab extends StatefulWidget {
  const SpineTab({
    super.key,
    required this.index,
    required this.lines,
    required this.lineHeight,
    required this.color,
    required this.active,
    required this.onTap,
  });

  final int index;
  final int lines;
  final double lineHeight;
  final Color color;
  final bool active;
  final VoidCallback onTap;

  static const double baseWidth = kSpineWidth;
  static const double hoverWidth = kSpineWidth;

  @override
  State<SpineTab> createState() => _SpineTabState();
}

class _SpineTabState extends State<SpineTab> {
  bool _hovered = false;
  bool get _isHoverEnabled => kIsWeb || defaultTargetPlatform == TargetPlatform.macOS || defaultTargetPlatform == TargetPlatform.windows || defaultTargetPlatform == TargetPlatform.linux;

  void _setHovered(bool value) {
    if (!_isHoverEnabled) {
      return;
    }
    if (_hovered != value) {
      setState(() => _hovered = value);
    }
  }

  @override
  Widget build(BuildContext context) {
    final height = widget.lines * widget.lineHeight;
    final radius = Radius.circular(20);
    final width = SpineTab.baseWidth;

    final decoration = BoxDecoration(
      gradient: const LinearGradient(
        colors: [Color(0xFF312E81), Color(0xFF5B21B6)],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ),
      borderRadius: BorderRadius.only(topRight: radius, bottomRight: radius),
      boxShadow: [
        if (widget.active)
          BoxShadow(color: const Color(0xFF06B6D4).withOpacity(0.38), blurRadius: 18, spreadRadius: 1)
        else
          BoxShadow(color: Colors.black.withOpacity(0.18), blurRadius: 14, offset: const Offset(0, 8)),
      ],
    );

    final bookmark = _ChapterBookmark(
      color: widget.color,
      radius: radius,
    );

    final badge = Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.36),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.35), width: 1),
        boxShadow: const [
          BoxShadow(color: Color(0x26000000), blurRadius: 10, spreadRadius: 1),
        ],
      ),
      child: Text(
        widget.index.toString().padLeft(2, '0'),
        style: const TextStyle(
          fontFeatures: [FontFeature.tabularFigures()],
          fontSize: 14,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.6,
          color: Colors.white,
        ),
      ),
    );

    final content = GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: widget.onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        curve: Curves.easeOutCubic,
        width: width,
        height: height,
        decoration: decoration,
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Positioned.fill(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
                child: const SizedBox(),
              ),
            ),
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.white.withOpacity(0.18),
                      Colors.white.withOpacity(0.04),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
              ),
            ),
            Positioned.fill(child: bookmark),
            const _SpineGrooves(),
            Align(
              alignment: Alignment.centerRight,
              child: Container(
                width: 18,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                    colors: [Color(0x00FFFFFF), Color(0x66FFFFFF)],
                  ),
                ),
              ),
            ),
            if (widget.active)
              Positioned(
                left: 0,
                top: 0,
                bottom: 0,
                child: Container(
                  width: 2.5,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF22D3EE), Color(0xFF67E8F9)],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
              ),
            ),
            Center(child: badge),
          ],
        ),
      ),
    );

    if (_isHoverEnabled) {
      return MouseRegion(
        onEnter: (_) => _setHovered(true),
        onExit: (_) => _setHovered(false),
        child: content,
      );
    }
    return content;
  }
}

class _SpineGrooves extends StatelessWidget {
  const _SpineGrooves();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _SpineGroovesPainter(),
    );
  }
}

class _SpineGroovesPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0x33111B4B)
      ..strokeWidth = 1;
    final spacing = 14.0;
    for (double x = 18; x < size.width - 16; x += spacing) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _ChapterBookmark extends StatelessWidget {
  const _ChapterBookmark({required this.color, required this.radius});

  final Color color;
  final Radius radius;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: ClipPath(
        clipper: _BookmarkClipper(),
        child: Container(
          width: double.infinity,
          decoration: BoxDecoration(
            color: color.withOpacity(0.92),
            borderRadius: BorderRadius.only(
              topRight: radius,
              bottomRight: radius,
            ),
            boxShadow: const [
              BoxShadow(color: Color(0x22000000), blurRadius: 12, offset: Offset(2, 6)),
            ],
          ),
        ),
      ),
    );
  }
}

class _BookmarkClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.moveTo(0, 4);
    path.lineTo(size.width - 8, 0);
    path.lineTo(size.width, size.height * 0.12);
    path.lineTo(size.width, size.height * 0.88);
    path.lineTo(size.width - 8, size.height);
    path.lineTo(0, size.height - 4);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}
