import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'spine_tab.dart';

class ChapterLineTile extends StatefulWidget {
  const ChapterLineTile({
    super.key,
    required this.index,
    required this.title,
    required this.color,
    required this.active,
    required this.lineHeight,
    required this.spineWidth,
    required this.onTap,
    required this.registerTextBand,
    this.collapsed = false,
  });

  final int index;
  final String title;
  final Color color;
  final bool active;
  final double lineHeight;
  final double spineWidth;
  final VoidCallback onTap;
  final void Function(Rect textBandRect) registerTextBand;
  final bool collapsed;

  static const double _verticalPadding = 8;
  static const double _horizontalPadding = 16;
  static const int _maxLines = 4;

  @override
  State<ChapterLineTile> createState() => _ChapterLineTileState();
}

class _ChapterLineTileState extends State<ChapterLineTile> {
  Rect? _lastReportedRect;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (widget.collapsed) {
          const lines = 2;
          final rowHeight = lines * widget.lineHeight + ChapterLineTile._verticalPadding;
          return SizedBox(
            height: rowHeight,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SpineTab(
                  index: widget.index,
                  lines: lines,
                  lineHeight: widget.lineHeight,
                  color: widget.color,
                  active: widget.active,
                  onTap: widget.onTap,
                  spineWidth: widget.spineWidth,
                  collapsed: true,
                ),
                const Expanded(child: SizedBox.shrink()),
              ],
            ),
          );
        }

        final double textAreaWidth = math.max(
          0.0,
          constraints.maxWidth - widget.spineWidth - ChapterLineTile._horizontalPadding * 2,
        );

        double fontSize = 18.0;
        int linesNeeded = _measureLines(fontSize, textAreaWidth);
        if (linesNeeded > 2) {
          fontSize = math.max(14.0, 18.0 - 1.5 * (linesNeeded - 2));
          linesNeeded = _measureLines(fontSize, textAreaWidth);
        }
        final int lines = math
            .min(ChapterLineTile._maxLines, math.max(1, linesNeeded))
            .toInt();
        final rowHeight = lines * widget.lineHeight + ChapterLineTile._verticalPadding;
        final paddingTop = ChapterLineTile._verticalPadding / 2;

        if (!widget.collapsed) {
          _scheduleBandRegistration(
            lines: lines,
            paddingTop: paddingTop,
            textAreaWidth: textAreaWidth,
          );
        }

        return SizedBox(
          height: rowHeight,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SpineTab(
                index: widget.index,
                lines: lines,
                lineHeight: widget.lineHeight,
                color: widget.color,
                active: widget.active,
                onTap: widget.onTap,
                spineWidth: widget.spineWidth,
                collapsed: widget.collapsed,
              ),
              Expanded(
                child: widget.collapsed
                    ? const SizedBox.shrink()
                    : Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: ChapterLineTile._horizontalPadding,
                        ),
                        child: Align(
                          alignment: Alignment.topLeft,
                          child: Padding(
                            padding: EdgeInsets.only(top: paddingTop),
                            child: Text(
                              widget.title,
                              maxLines: lines,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: fontSize,
                                fontWeight: FontWeight.w700,
                                height: widget.lineHeight / fontSize,
                                color: const Color(0xFF0F172A),
                              ),
                            ),
                          ),
                        ),
                      ),
              ),
            ],
          ),
        );
      },
    );
  }

  int _measureLines(double fontSize, double maxWidth) {
    if (maxWidth <= 0) {
      return 1;
    }
    final painter = TextPainter(
      text: TextSpan(
        text: widget.title,
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: FontWeight.w700,
          height: widget.lineHeight / fontSize,
        ),
      ),
      maxLines: ChapterLineTile._maxLines,
      textDirection: TextDirection.ltr,
    )
      ..layout(maxWidth: maxWidth);
    return math.max(1, painter.computeLineMetrics().length);
  }

  void _scheduleBandRegistration({
    required int lines,
    required double paddingTop,
    required double textAreaWidth,
  }) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) {
        return;
      }
      final renderObject = context.findRenderObject();
      if (renderObject is! RenderBox) {
        return;
      }
      final offset = renderObject.localToGlobal(Offset.zero);
      final rect = Rect.fromLTWH(
        offset.dx + widget.spineWidth,
        offset.dy + paddingTop,
        textAreaWidth,
        lines * widget.lineHeight,
      );
      if (_lastReportedRect != rect) {
        _lastReportedRect = rect;
        widget.registerTextBand(rect);
      }
    });
  }
}
