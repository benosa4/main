import 'dart:async';
import 'dart:ui';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'package:voicebook/core/models/chapter_summary.dart';

class ChapterRuler extends StatefulWidget {
  const ChapterRuler({
    super.key,
    required this.bookId,
    required this.chapters,
    required this.activeChapterId,
    required this.onSelect,
    required this.onReorder,
    required this.onAddChapter,
    this.width = 68,
    this.compact = false,
  });

  final String bookId;
  final List<ChapterSummary> chapters;
  final String activeChapterId;
  final ValueChanged<String> onSelect;
  final void Function(int oldIndex, int newIndex) onReorder;
  final VoidCallback onAddChapter;
  final double width;
  final bool compact;

  @override
  State<ChapterRuler> createState() => _ChapterRulerState();
}

class _ChapterRulerState extends State<ChapterRuler> {
  static const _scrollBoxName = 'ui_state';
  static const _scrollKeyPrefix = 'chapterRulerScrollOffset::';
  static const _tickSpacing = 48.0;
  static const _tickParallax = 0.14;

  final ScrollController _scrollController = ScrollController();

  Box<dynamic>? _uiStateBox;
  Timer? _persistDebounce;
  double? _pendingRestoreOffset;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_handleScrollChange);
    _restoreScrollOffset();
  }

  @override
  void didUpdateWidget(covariant ChapterRuler oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.bookId != widget.bookId) {
      _pendingRestoreOffset = null;
      if (_scrollController.hasClients) {
        _scrollController.jumpTo(0);
      }
      _restoreScrollOffset();
    }

    if (oldWidget.chapters.length != widget.chapters.length) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!_scrollController.hasClients) {
          return;
        }
        final maxExtent = _scrollController.position.maxScrollExtent;
        if (_scrollController.offset > maxExtent) {
          _scrollController.jumpTo(maxExtent);
        }
      });
    }
  }

  @override
  void dispose() {
    _persistDebounce?.cancel();
    _persistScrollOffset();
    _scrollController.removeListener(_handleScrollChange);
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _restoreScrollOffset() async {
    try {
      _uiStateBox ??= await Hive.openBox<dynamic>(_scrollBoxName);
    } catch (_) {
      return;
    }

    final key = '$_scrollKeyPrefix${widget.bookId}';
    final stored = _uiStateBox?.get(key);
    if (stored is num) {
      _pendingRestoreOffset = stored.toDouble();
      _scheduleApplyPendingOffset();
    } else {
      _pendingRestoreOffset = 0;
      _scheduleApplyPendingOffset();
    }
  }

  void _scheduleApplyPendingOffset() {
    if (!mounted) {
      return;
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) {
        return;
      }
      if (!_scrollController.hasClients) {
        if (_pendingRestoreOffset != null) {
          _scheduleApplyPendingOffset();
        }
        return;
      }
      final target = (_pendingRestoreOffset ?? 0).clamp(
        0.0,
        _scrollController.position.maxScrollExtent,
      ).toDouble();
      _pendingRestoreOffset = null;
      _scrollController.jumpTo(target);
    });
  }

  void _handleScrollChange() {
    _persistDebounce?.cancel();
    _persistDebounce = Timer(const Duration(milliseconds: 200), _persistScrollOffset);
  }

  void _persistScrollOffset() {
    _persistDebounce?.cancel();
    if (_uiStateBox == null || !_scrollController.hasClients) {
      return;
    }
    final key = '$_scrollKeyPrefix${widget.bookId}';
    final offset = _scrollController.offset;
    _uiStateBox!.put(key, offset);
  }

  @override
  Widget build(BuildContext context) {
    final rulerWidth = widget.width;
    final media = MediaQuery.of(context);
    final paddingTop = media.padding.top > 0 ? 12.0 : 16.0;

    return SizedBox(
      width: rulerWidth,
      child: ClipRRect(
        borderRadius: const BorderRadius.only(
          topRight: Radius.circular(16),
          bottomRight: Radius.circular(16),
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                ),
              ),
            ),
            Positioned.fill(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
                child: Container(
                  color: Colors.white.withOpacity(0.06),
                ),
              ),
            ),
            Positioned.fill(
              child: CustomPaint(
                painter: _RulerTexturePainter(
                  controller: _scrollController,
                  tickSpacing: _tickSpacing,
                  parallaxFactor: _tickParallax,
                ),
              ),
            ),
            Positioned.fill(
              child: Padding(
                padding: EdgeInsets.fromLTRB(6, paddingTop, 6, 96),
                child: RepaintBoundary(
                  child: _buildReorderableList(),
                ),
              ),
            ),
            Positioned(
              left: 8,
              right: 8,
              bottom: 16,
              child: _AddChapterFab(onPressed: widget.onAddChapter),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReorderableList() {
    if (widget.chapters.isEmpty) {
      return ListView(
        controller: _scrollController,
        physics: const BouncingScrollPhysics(),
        children: const [SizedBox(height: 12)],
      );
    }

    return ReorderableListView.builder(
      padding: EdgeInsets.zero,
      scrollController: _scrollController,
      physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
      primary: false,
      buildDefaultDragHandles: false,
      itemCount: widget.chapters.length,
      proxyDecorator: (child, index, animation) {
        return AnimatedBuilder(
          animation: animation,
          builder: (context, _) {
            final t = Curves.easeOut.transform(animation.value);
            return Transform.scale(
              scale: 1 + t * 0.04,
              child: child,
            );
          },
        );
      },
      onReorder: widget.onReorder,
      itemBuilder: (context, index) {
        final chapter = widget.chapters[index];
        final active = chapter.id == widget.activeChapterId;
        final tile = _ChapterTab(
          key: ValueKey(chapter.id),
          index: index,
          label: '${index + 1}. ${chapter.title}',
          color: _colorFor(chapter.id),
          compact: widget.compact,
          isActive: active,
          showHandle: kIsWeb,
          onTap: () => widget.onSelect(chapter.id),
        );

        if (kIsWeb) {
          return tile;
        }

        return ReorderableDelayedDragStartListener(
          key: ValueKey(chapter.id),
          index: index,
          child: tile,
        );
      },
    );
  }
}

class _RulerTexturePainter extends CustomPainter {
  _RulerTexturePainter({
    required ScrollController controller,
    required this.tickSpacing,
    required this.parallaxFactor,
  }) : _controller = controller,
       super(repaint: controller);

  final ScrollController _controller;
  final double tickSpacing;
  final double parallaxFactor;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;

    final highlight = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0x33FFFFFF), Color(0x00000000)],
      ).createShader(rect);
    canvas.drawRect(rect, highlight);

    final innerShadow = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.centerRight,
        end: Alignment.centerLeft,
        colors: [Color(0x3D000000), Color(0x00000000)],
      ).createShader(Rect.fromLTWH(size.width - 18, 0, 18, size.height));
    canvas.drawRect(Rect.fromLTWH(size.width - 18, 0, 18, size.height), innerShadow);

    final tickPaint = Paint()
      ..color = Colors.white.withOpacity(0.18)
      ..strokeWidth = 1
      ..strokeCap = StrokeCap.round
      ..isAntiAlias = true;

    final offset = _controller.hasClients ? _controller.offset : 0.0;
    final base = -offset * parallaxFactor;
    for (double y = base % tickSpacing; y < size.height; y += tickSpacing) {
      canvas.drawLine(
        Offset(size.width - 20, y),
        Offset(size.width - 8, y),
        tickPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _RulerTexturePainter oldDelegate) {
    return oldDelegate.tickSpacing != tickSpacing ||
        oldDelegate.parallaxFactor != parallaxFactor ||
        oldDelegate._controller != _controller;
  }
}

class _ChapterTab extends StatelessWidget {
  const _ChapterTab({
    super.key,
    required this.index,
    required this.label,
    required this.color,
    required this.compact,
    required this.isActive,
    required this.showHandle,
    required this.onTap,
  });

  final int index;
  final String label;
  final Color color;
  final bool compact;
  final bool isActive;
  final bool showHandle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final height = compact ? 36.0 : 44.0;
    final shape = const _BookmarkShape(radius: 14, cut: 12);
    final background = isActive ? color.withOpacity(0.95) : color.withOpacity(0.82);
    final textStyle = Theme.of(context).textTheme.labelMedium?.copyWith(
          fontWeight: FontWeight.w600,
          fontSize: compact ? 12 : 13.5,
          height: 1.1,
          color: Colors.black.withOpacity(0.8),
        ) ??
        TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: compact ? 12 : 13.5,
          height: 1.1,
          color: Colors.black.withOpacity(0.8),
        );

    final tab = RepaintBoundary(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            customBorder: shape,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              height: height,
              padding: const EdgeInsets.symmetric(horizontal: 10),
              decoration: ShapeDecoration(
                color: background,
                shape: shape,
                shadows: isActive
                    ? [
                        const BoxShadow(
                          color: Color(0x3D06B6D4),
                          blurRadius: 16,
                          spreadRadius: 1.4,
                          offset: Offset(0, 2),
                        ),
                      ]
                    : const [
                        BoxShadow(
                          color: Color(0x14000000),
                          blurRadius: 6,
                          offset: Offset(0, 2),
                        ),
                      ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      label,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: textStyle,
                    ),
                  ),
                  if (showHandle)
                    ReorderableDragStartListener(
                      index: index,
                      child: Padding(
                        padding: const EdgeInsets.only(left: 6),
                        child: Icon(
                          Icons.drag_handle_rounded,
                          size: 18,
                          color: Colors.black.withOpacity(0.4),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );

    return tab;
  }
}

class _BookmarkShape extends ShapeBorder {
  const _BookmarkShape({this.radius = 14, this.cut = 12});

  final double radius;
  final double cut;

  @override
  EdgeInsetsGeometry get dimensions => EdgeInsets.zero;

  @override
  ShapeBorder scale(double t) {
    return _BookmarkShape(radius: radius * t, cut: cut * t);
  }

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    final r = Radius.circular(radius);
    return Path()
      ..moveTo(rect.left + cut, rect.top)
      ..lineTo(rect.right - radius, rect.top)
      ..arcToPoint(Offset(rect.right, rect.top + radius), radius: r)
      ..lineTo(rect.right, rect.bottom - radius)
      ..arcToPoint(Offset(rect.right - radius, rect.bottom), radius: r)
      ..lineTo(rect.left + cut, rect.bottom)
      ..lineTo(rect.left, rect.bottom - cut)
      ..lineTo(rect.left, rect.top + cut)
      ..close();
  }

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) {
    return getOuterPath(rect, textDirection: textDirection);
  }

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {}

  @override
  BorderSide get side => BorderSide.none;
}

class _AddChapterFab extends StatelessWidget {
  const _AddChapterFab({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 56,
      child: FloatingActionButton.extended(
        heroTag: 'chapter-ruler-add',
        backgroundColor: const Color(0xFF4F46E5).withOpacity(0.92),
        foregroundColor: Colors.white,
        elevation: 8,
        onPressed: onPressed,
        label: const Text('+ Глава'),
      ),
    );
  }
}

const List<Color> _pastelPalette = <Color>[
  Color(0xFFE8E7FE),
  Color(0xFFEDE6FB),
  Color(0xFFE6FAFD),
  Color(0xFFEFFBF2),
  Color(0xFFFFF3E4),
  Color(0xFFFFE9ED),
  Color(0xFFE6F0FF),
  Color(0xFFEAF7FF),
  Color(0xFFF2E7FF),
  Color(0xFFE7FFF6),
];

Color _colorFor(String id) {
  if (id.isEmpty) {
    return _pastelPalette.first;
  }
  final hash = id.codeUnits.fold<int>(0, (acc, unit) => (acc * 31 + unit) & 0x7fffffff);
  return _pastelPalette[hash % _pastelPalette.length];
}
