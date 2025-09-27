import 'package:flutter/material.dart';

import 'package:voicebook/core/models/chapter_summary.dart';

class NotebookIntroSheet extends StatelessWidget {
  const NotebookIntroSheet({
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
      child: _NotebookPaper(
        bookTitle: bookTitle,
        chapters: chapters,
        onOpenChapter: onOpenChapter,
        onCreateChapter: onCreateChapter,
        onStartDictation: onStartDictation,
      ),
    );
  }
}

class _NotebookPaper extends StatelessWidget {
  const _NotebookPaper({
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

  static const _paperPadding = EdgeInsets.symmetric(horizontal: 32, vertical: 40);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final surface = theme.colorScheme.surface;

    return Center(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 720),
        margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          color: surface,
          boxShadow: const [
            BoxShadow(color: Color(0x1F0F172A), blurRadius: 30, spreadRadius: 4, offset: Offset(0, 12)),
          ],
        ),
        child: CustomPaint(
          painter: const RuledPaperPainter(),
          child: DecoratedBox(
            decoration: const BoxDecoration(
              borderRadius: BorderRadius.all(Radius.circular(20)),
            ),
            child: ClipPath(
              clipper: _SheetCornerClipper(),
              child: Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                ),
                child: Padding(
                  padding: _paperPadding,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        bookTitle,
                        style: theme.textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Выберите главу',
                        style: theme.textTheme.titleMedium?.copyWith(color: const Color(0xFF64748B)),
                      ),
                      const SizedBox(height: 28),
                      Expanded(
                        child: _OutlineList(
                          chapters: chapters,
                          onOpenChapter: onOpenChapter,
                        ),
                      ),
                      const SizedBox(height: 24),
                      Row(
                        children: [
                          ElevatedButton.icon(
                            onPressed: onStartDictation,
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            icon: const Icon(Icons.mic),
                            label: const Text('Начать диктовку'),
                          ),
                          const SizedBox(width: 16),
                          OutlinedButton.icon(
                            onPressed: onCreateChapter,
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            icon: const Icon(Icons.auto_stories_outlined),
                            label: const Text('Создать главу'),
                          ),
                        ],
                      ),
                    ],
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

class _OutlineList extends StatelessWidget {
  const _OutlineList({
    required this.chapters,
    required this.onOpenChapter,
  });

  final List<ChapterSummary> chapters;
  final ValueChanged<String> onOpenChapter;

  static const _rowHeight = 56.0;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (chapters.isEmpty) {
      return Center(
        child: Text(
          'Глава ещё не создана. Нажмите «Создать главу», чтобы начать.',
          style: theme.textTheme.titleMedium?.copyWith(color: const Color(0xFF64748B)),
          textAlign: TextAlign.center,
        ),
      );
    }

    return ListView.separated(
      padding: EdgeInsets.zero,
      itemBuilder: (context, index) {
        final chapter = chapters[index];
        final accent = _chapterAccentColor(chapter.id);

        return Hero(
          tag: 'chapter_title_${chapter.id}',
          flightShuttleBuilder: (flightContext, animation, direction, fromContext, toContext) {
            final child = direction == HeroFlightDirection.pop ? fromContext.widget : toContext.widget;
            return FadeTransition(
              opacity: animation.drive(CurveTween(curve: Curves.easeOutCubic)),
              child: child,
            );
          },
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () => onOpenChapter(chapter.id),
              borderRadius: BorderRadius.circular(18),
              child: Ink(
                height: _rowHeight,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Row(
                    children: [
                      _AccentDot(color: accent),
                      const SizedBox(width: 16),
                      Text(
                        '${index + 1}'.padLeft(2, '0'),
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          curve: Curves.easeOutCubic,
                          transform: Matrix4.identity()..translate(0.0, 0.0, 0.0),
                          child: Text(
                            chapter.title,
                            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w500),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ),
                      const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: Color(0xFF94A3B8)),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemCount: chapters.length,
    );
  }
}

class _AccentDot extends StatefulWidget {
  const _AccentDot({required this.color});

  final Color color;

  @override
  State<_AccentDot> createState() => _AccentDotState();
}

class _AccentDotState extends State<_AccentDot> with SingleTickerProviderStateMixin {
  static const _hoverScale = 1.08;
  static const _duration = Duration(milliseconds: 180);

  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: AnimatedContainer(
        duration: _duration,
        curve: Curves.easeOutCubic,
        width: 14 * (_hovered ? _hoverScale : 1),
        height: 14 * (_hovered ? _hoverScale : 1),
        decoration: BoxDecoration(
          color: widget.color,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(color: widget.color.withOpacity(0.35), blurRadius: 12, spreadRadius: 2),
          ],
        ),
      ),
    );
  }
}

class RuledPaperPainter extends CustomPainter {
  const RuledPaperPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = const Color(0xFFCBD5E1).withOpacity(.28)
      ..strokeWidth = 1;
    for (double y = 28; y < size.height; y += 28) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), linePaint);
    }
    final marginPaint = Paint()
      ..color = const Color(0xFFEF4444).withOpacity(.40)
      ..strokeWidth = 2;
    canvas.drawLine(const Offset(24, 0), Offset(24, size.height), marginPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _SheetCornerClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    const foldSize = 18.0;
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width - foldSize, 0)
      ..lineTo(size.width, foldSize)
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}

Color _chapterAccentColor(String id) {
  const palette = [
    Color(0xFFE0F2FE),
    Color(0xFFFBCFE8),
    Color(0xFFE9D5FF),
    Color(0xFFE0E7FF),
    Color(0xFFDCFCE7),
    Color(0xFFFDE68A),
  ];
  final hash = id.codeUnits.fold<int>(0, (prev, code) => (prev * 31 + code) & 0x7fffffff);
  return palette[hash % palette.length];
}
