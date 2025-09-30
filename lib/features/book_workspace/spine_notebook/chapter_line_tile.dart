import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'spine_tab.dart';

class ChapterLineTile extends StatelessWidget {
  const ChapterLineTile({
    super.key,
    required this.index,
    required this.title,
    required this.color,
    required this.active,
    required this.lineHeight,
    required this.spineWidth,
    required this.onTap,
  });

  final int index;
  final String title;
  final Color color;
  final bool active;
  final double lineHeight;
  final double spineWidth;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final availableWidth = constraints.maxWidth;
        final textMaxWidth = availableWidth - spineWidth - 24 - 32;

        int measureLines(double fontSize) {
          final painter = TextPainter(
            text: TextSpan(
              text: title,
              style: TextStyle(
                fontSize: fontSize,
                fontWeight: FontWeight.w700,
                height: 1.25,
                color: const Color(0xFF0F172A),
              ),
            ),
            textDirection: TextDirection.ltr,
            maxLines: 999,
          );
          painter.layout(maxWidth: textMaxWidth.clamp(0, double.infinity).toDouble());
          return painter.computeLineMetrics().length;
        }

        double fontSize = 16;
        int linesNeeded = measureLines(fontSize);
        if (linesNeeded > 2) {
          fontSize = math.max(13, 16 - 1.5 * (linesNeeded - 2));
          linesNeeded = measureLines(fontSize);
        }
        final int lines = linesNeeded.clamp(1, 4) as int;
        final rowHeight = lines * lineHeight;

        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: SizedBox(
            height: rowHeight,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                ConstrainedBox(
                  constraints: const BoxConstraints(
                    minWidth: SpineTab.baseWidth,
                    maxWidth: SpineTab.hoverWidth,
                  ),
                  child: SpineTab(
                    index: index,
                    lines: lines,
                    lineHeight: lineHeight,
                    color: color,
                    active: active,
                    onTap: onTap,
                  ),
                ),
                Expanded(
                  child: InkWell(
                    onTap: onTap,
                    borderRadius: BorderRadius.circular(8),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          title,
                          maxLines: lines,
                          overflow: TextOverflow.ellipsis,
                          softWrap: true,
                          style: TextStyle(
                            fontSize: fontSize,
                            fontWeight: FontWeight.w700,
                            height: 1.25,
                            color: const Color(0xFF0F172A),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
