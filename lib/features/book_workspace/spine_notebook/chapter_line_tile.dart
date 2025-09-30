import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'spine_constants.dart';
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
    this.bandKey,
    required this.onTap,
  });

  final int index;
  final String title;
  final Color color;
  final bool active;
  final double lineHeight;
  final double spineWidth;
  final GlobalKey? bandKey;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final availableWidth = constraints.maxWidth;
        const double horizontalPadding = 24.0;
        final textMaxWidth = math.max(
          0,
          availableWidth - spineWidth - horizontalPadding * 2,
        );

        int measureLines(double fontSize) {
          final painter = TextPainter(
            text: TextSpan(
              text: title,
              style: TextStyle(
                fontSize: fontSize,
                fontWeight: FontWeight.w700,
                height: 1.2,
                color: const Color(0xFF0F172A),
              ),
            ),
            textDirection: TextDirection.ltr,
            maxLines: 999,
          );
          painter.layout(maxWidth: textMaxWidth.toDouble());
          return painter.computeLineMetrics().length;
        }

        double fontSize = kTitleBase;
        int linesNeeded = measureLines(fontSize);
        if (linesNeeded > 2) {
          while (fontSize > kTitleMin && linesNeeded > kTabMaxLines) {
            fontSize = math.max(kTitleMin, fontSize - 1);
            linesNeeded = measureLines(fontSize);
          }
          if (linesNeeded > kTabMaxLines) {
            linesNeeded = kTabMaxLines;
          }
        }
        final int lines = linesNeeded.clamp(kTabMinLines, kTabMaxLines);
        final rowHeight = lines * lineHeight;

        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 3),
          child: SizedBox(
            key: bandKey,
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
                      padding: const EdgeInsets.symmetric(horizontal: horizontalPadding),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            maxLines: lines,
                            overflow: TextOverflow.ellipsis,
                            softWrap: true,
                            style: TextStyle(
                              fontSize: fontSize,
                              fontWeight: FontWeight.w700,
                              height: 1.2,
                              color: const Color(0xFF0F172A),
                            ),
                          ),
                        ],
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
