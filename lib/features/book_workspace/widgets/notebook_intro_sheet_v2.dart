import 'dart:math' as math;
import 'dart:ui';

import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';

import 'package:voicebook/core/models/chapter_summary.dart';

class NotebookIntroSheetV2 extends StatelessWidget {
  const NotebookIntroSheetV2({
    super.key,
    required this.bookTitle,
    required this.chapters,
    required this.onOpenChapter,
    required this.onCreateChapter,
    required this.onStartDictation,
  });

  final String bookTitle;
  final List<ChapterSummary> chapters;
  final ValueChanged<String> onOpenChapter;
  final VoidCallback onCreateChapter;
  final VoidCallback onStartDictation;

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    final isWide = media.size.width >= 900;
    final cardPadding = EdgeInsets.fromLTRB(isWide ? 32 : 24, 24, isWide ? 32 : 24, 12);

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 720),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Card(
            elevation: 8,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(18),
              child: CustomPaint(
                painter: const _RuledPaperPainter(),
                child: Padding(
                  padding: cardPadding,
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      final viewportHeight = constraints.maxHeight;
                      double minHeight;
                      if (viewportHeight.isFinite && viewportHeight > 0) {
                        minHeight = viewportHeight * 0.72;
                      } else {
                        final screenHeight = media.size.height;
                        minHeight = (screenHeight.isFinite && screenHeight > 0) ? screenHeight * 0.72 : 480.0;
                      }
                      minHeight = math.max(360.0, minHeight);

                      final hasChapters = chapters.isNotEmpty;

                      return ConstrainedBox(
                        constraints: BoxConstraints(minHeight: minHeight),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            AutoSizeText(
                              bookTitle,
                              style: Theme.of(context)
                                  .textTheme
                                  .headlineMedium
                                  ?.copyWith(fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
                              maxLines: 2,
                              minFontSize: 18,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Выберите главу',
                              style: TextStyle(color: Color(0xFF64748B)),
                            ),
                            const SizedBox(height: 16),
                            Expanded(
                              child: Scrollbar(
                                thumbVisibility: true,
                                child: SingleChildScrollView(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: ListView.separated(
                                    shrinkWrap: true,
                                    physics: const NeverScrollableScrollPhysics(),
                                    itemCount: hasChapters ? chapters.length : 1,
                                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                                    itemBuilder: (context, index) {
                                      if (!hasChapters) {
                                        return _EmptyChapters(onCreateChapter: onCreateChapter);
                                      }
                                      final chapter = chapters[index];
                                      final accent = _chapterAccentColor(chapter.id);
                                      return _ChapterRow(
                                        index: index + 1,
                                        chapter: chapter,
                                        color: accent,
                                        onTap: () => onOpenChapter(chapter.id),
                                      );
                                    },
                                  ),
                                ),
                              ),
                            ),
                            SafeArea(
                              top: false,
                              child: Padding(
                                padding: const EdgeInsets.only(top: 12),
                                child: Row(
                                  children: [
                                    ElevatedButton.icon(
                                      icon: const Icon(Icons.mic),
                                      label: const Text('Начать диктовку'),
                                      onPressed: onStartDictation,
                                    ),
                                    const SizedBox(width: 12),
                                    OutlinedButton.icon(
                                      icon: const Icon(Icons.edit),
                                      label: const Text('Открыть редактор'),
                                      onPressed: () {
                                        if (chapters.isNotEmpty) {
                                          onOpenChapter(chapters.first.id);
                                        } else {
                                          onCreateChapter();
                                        }
                                      },
                                    ),
                                    const Spacer(),
                                    TextButton.icon(
                                      icon: const Icon(Icons.add),
                                      label: const Text('Создать главу'),
                                      onPressed: onCreateChapter,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ChapterRow extends StatefulWidget {
  const _ChapterRow({
    required this.index,
    required this.chapter,
    required this.color,
    required this.onTap,
  });

  final int index;
  final ChapterSummary chapter;
  final Color color;
  final VoidCallback onTap;

  @override
  State<_ChapterRow> createState() => _ChapterRowState();
}

class _ChapterRowState extends State<_ChapterRow> {
  bool _hovered = false;

  void _setHovered(bool value) {
    if (_hovered == value) {
      return;
    }
    setState(() => _hovered = value);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final number = Text(
      '${widget.index}'.padLeft(2, '0'),
      style: theme.textTheme.titleMedium?.copyWith(
        fontFeatures: const [FontFeature.tabularFigures()],
        fontWeight: FontWeight.w600,
        color: const Color(0xFF475569),
      ),
    );

    final hero = Hero(
      tag: 'chapter_title_${widget.chapter.id}',
      flightShuttleBuilder: (context, animation, direction, fromContext, toContext) {
        final child = direction == HeroFlightDirection.pop ? fromContext.widget : toContext.widget;
        return FadeTransition(
          opacity: animation.drive(CurveTween(curve: Curves.easeOutCubic)),
          child: child,
        );
      },
      child: Material(
        color: Colors.transparent,
        child: Text(
          widget.chapter.title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          softWrap: false,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: const Color(0xFF0F172A),
          ),
        ),
      ),
    );

    return MouseRegion(
      onEnter: (_) => _setHovered(true),
      onExit: (_) => _setHovered(false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 140),
          curve: Curves.easeOutCubic,
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color: Colors.white.withOpacity(0.82),
            boxShadow: _hovered
                ? [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 12,
                      offset: const Offset(0, 6),
                    ),
                  ]
                : null,
          ),
          transform: Matrix4.identity()..translate(0.0, _hovered ? -1.0 : 0.0),
          child: Row(
            children: [
              number,
              const SizedBox(width: 16),
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: widget.color,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(child: hero),
              const SizedBox(width: 12),
              Icon(Icons.chevron_right_rounded, color: const Color(0xFF94A3B8)),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmptyChapters extends StatelessWidget {
  const _EmptyChapters({required this.onCreateChapter});

  final VoidCallback onCreateChapter;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          'Глава ещё не создана.',
          style: theme.textTheme.titleMedium?.copyWith(color: const Color(0xFF64748B)),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: onCreateChapter,
          icon: const Icon(Icons.add_rounded),
          label: const Text('Создать первую главу'),
        ),
      ],
    );
  }
}

class _RuledPaperPainter extends CustomPainter {
  const _RuledPaperPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final horizontal = Paint()
      ..color = const Color(0xFFCBD5E1).withOpacity(.28)
      ..strokeWidth = 1;
    for (double y = 28; y < size.height; y += 28) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), horizontal);
    }

    final margin = Paint()
      ..color = const Color(0xFFEF4444).withOpacity(.40)
      ..strokeWidth = 2;
    canvas.drawLine(const Offset(24, 0), Offset(24, size.height), margin);

    final density = (size.width * size.height) / 900;
    final count = density.clamp(280, 2000).toInt();
    final noisePaint = Paint()
      ..color = const Color(0xFF0F172A).withOpacity(0.035)
      ..strokeWidth = 1.2
      ..strokeCap = StrokeCap.round;
    final random = math.Random(1337);
    final points = <Offset>[];
    for (var i = 0; i < count; i++) {
      points.add(Offset(random.nextDouble() * size.width, random.nextDouble() * size.height));
    }
    if (points.isNotEmpty) {
      canvas.drawPoints(PointMode.points, points, noisePaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

Color _chapterAccentColor(String id) {
  final hash = id.codeUnits.fold<int>(0, (acc, code) => (acc + code) & 0xFFFFFFFF);
  final palette = <Color>[
    const Color(0xFF0EA5E9),
    const Color(0xFFF97316),
    const Color(0xFF10B981),
    const Color(0xFFF59E0B),
    const Color(0xFF22D3EE),
    const Color(0xFFFB7185),
    const Color(0xFFA855F7),
  ];
  return palette[hash % palette.length];
}

