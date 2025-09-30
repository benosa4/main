import 'dart:math' as math;
import 'dart:ui';

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
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 180),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        final scale = 0.98 + 0.02 * value;
        return Opacity(
          opacity: value.clamp(0, 1),
          child: Transform.scale(
            scale: scale,
            alignment: Alignment.topCenter,
            child: child,
          ),
        );
      },
      child: _NotebookCard(
        bookTitle: bookTitle,
        chapters: chapters,
        onOpenChapter: onOpenChapter,
        onCreateChapter: onCreateChapter,
        onStartDictation: onStartDictation,
      ),
    );
  }
}

class _NotebookCard extends StatelessWidget {
  const _NotebookCard({
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
    final theme = Theme.of(context);
    final surface = theme.colorScheme.surface;

    return Center(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 760),
        margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        decoration: BoxDecoration(
          color: surface,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.12),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: _RuledPaper(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 36, vertical: 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              bookTitle,
                              style: theme.textTheme.displaySmall?.copyWith(
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Выберите главу',
                              style: theme.textTheme.titleMedium?.copyWith(color: const Color(0xFF64748B)),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      FilledButton.icon(
                        onPressed: onCreateChapter,
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFFE0E7FF),
                          foregroundColor: const Color(0xFF4338CA),
                          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          textStyle: theme.textTheme.labelLarge,
                        ),
                        icon: const Icon(Icons.add_rounded),
                        label: const Text('Добавить главу'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  Expanded(
                    child: chapters.isEmpty
                        ? _EmptyChapters(onCreateChapter: onCreateChapter)
                        : _ChapterList(
                            chapters: chapters,
                            onOpenChapter: onOpenChapter,
                          ),
                  ),
                  const SizedBox(height: 32),
                  Wrap(
                    spacing: 16,
                    runSpacing: 12,
                    children: [
                      FilledButton.icon(
                        onPressed: onStartDictation,
                        style: FilledButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        icon: const Icon(Icons.mic_rounded),
                        label: const Text('Начать диктовку'),
                      ),
                      OutlinedButton.icon(
                        onPressed: () {
                          if (chapters.isNotEmpty) {
                            onOpenChapter(chapters.first.id);
                          } else {
                            onCreateChapter();
                          }
                        },
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 18),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        icon: const Icon(Icons.edit_outlined),
                        label: const Text('Открыть редактор'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ChapterList extends StatelessWidget {
  const _ChapterList({required this.chapters, required this.onOpenChapter});

  final List<ChapterSummary> chapters;
  final ValueChanged<String> onOpenChapter;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: EdgeInsets.zero,
      itemBuilder: (context, index) {
        final chapter = chapters[index];
        final accent = _chapterAccentColor(chapter.id);
        return _ChapterTile(
          index: index,
          chapter: chapter,
          accent: accent,
          onTap: () => onOpenChapter(chapter.id),
        );
      },
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemCount: chapters.length,
    );
  }
}

class _ChapterTile extends StatefulWidget {
  const _ChapterTile({
    required this.index,
    required this.chapter,
    required this.accent,
    required this.onTap,
  });

  final int index;
  final ChapterSummary chapter;
  final Color accent;
  final VoidCallback onTap;

  @override
  State<_ChapterTile> createState() => _ChapterTileState();
}

class _ChapterTileState extends State<_ChapterTile> {
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
      '${widget.index + 1}'.padLeft(2, '0'),
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
                  color: widget.accent,
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

class _RuledPaper extends StatelessWidget {
  const _RuledPaper({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: const _RuledPaperPainter(),
      child: child,
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

