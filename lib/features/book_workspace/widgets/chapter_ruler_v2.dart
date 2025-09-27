import 'dart:async';
import 'dart:math' as math;
import 'dart:ui';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'package:voicebook/core/models/chapter_summary.dart';

class ChapterRulerV2 extends StatefulWidget {
  const ChapterRulerV2({
    super.key,
    required this.bookId,
    required this.chapters,
    required this.activeChapterId,
    required this.onSelect,
    required this.onReorder,
    required this.onAddChapter,
  });

  final String bookId;
  final List<ChapterSummary> chapters;
  final String activeChapterId;
  final ValueChanged<String> onSelect;
  final void Function(int oldIndex, int newIndex) onReorder;
  final VoidCallback onAddChapter;

  @override
  State<ChapterRulerV2> createState() => _ChapterRulerV2State();
}

class _ChapterRulerV2State extends State<ChapterRulerV2> {
  static const _scrollBoxName = 'ui_state';
  static const _scrollKeyPrefix = 'chapterRulerScrollOffset::';
  static const _hoverWidth = 124.0;
  static const _baseWidth = 96.0;
  static const _tickSpacing = 48.0;
  static const _tickParallax = 0.16;
  static const _hoverDuration = Duration(milliseconds: 180);

  final ScrollController _scrollController = ScrollController();
  final FocusScopeNode _listFocus = FocusScopeNode();

  Box<dynamic>? _uiStateBox;
  Timer? _persistDebounce;
  double? _pendingOffset;
  bool _hovered = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_handleScroll);
    _restoreScrollOffset();
  }

  @override
  void didUpdateWidget(covariant ChapterRulerV2 oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.bookId != widget.bookId) {
      _pendingOffset = null;
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
    _scrollController.removeListener(_handleScroll);
    _scrollController.dispose();
    _listFocus.dispose();
    super.dispose();
  }

  Future<void> _restoreScrollOffset() async {
    try {
      _uiStateBox ??= await Hive.openBox<dynamic>(_scrollBoxName);
    } catch (_) {
      return;
    }

    final stored = _uiStateBox?.get('$_scrollKeyPrefix${widget.bookId}');
    if (stored is num) {
      _pendingOffset = stored.toDouble();
    } else {
      _pendingOffset = 0;
    }
    _applyPendingOffset();
  }

  void _applyPendingOffset() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) {
        return;
      }
      if (!_scrollController.hasClients) {
        _applyPendingOffset();
        return;
      }
      final target = (_pendingOffset ?? 0).clamp(
        0.0,
        _scrollController.position.maxScrollExtent,
      );
      _pendingOffset = null;
      _scrollController.jumpTo(target);
    });
  }

  void _handleScroll() {
    _persistDebounce?.cancel();
    _persistDebounce = Timer(const Duration(milliseconds: 160), _persistScrollOffset);
    setState(() {});
  }

  void _persistScrollOffset() {
    if (_uiStateBox == null || !_scrollController.hasClients) {
      return;
    }
    final offset = _scrollController.offset;
    unawaited(_uiStateBox!.put('$_scrollKeyPrefix${widget.bookId}', offset));
  }

  void _setHovered(bool value) {
    if (_hovered == value) {
      return;
    }
    setState(() => _hovered = value);
  }

  @override
  Widget build(BuildContext context) {
    final width = _hovered && (kIsWeb || Theme.of(context).platform != TargetPlatform.android)
        ? _hoverWidth
        : _baseWidth;

    return MouseRegion(
      onEnter: (_) => _setHovered(true),
      onExit: (_) => _setHovered(false),
      child: AnimatedContainer(
        duration: _hoverDuration,
        curve: Curves.easeOutCubic,
        width: _hoverWidth,
        alignment: Alignment.centerLeft,
        padding: EdgeInsets.only(right: (_hoverWidth - width)),
        child: SizedBox(
          width: width,
          child: ClipRRect(
            borderRadius: const BorderRadius.only(
              topRight: Radius.circular(24),
              bottomRight: Radius.circular(24),
            ),
            child: Stack(
              fit: StackFit.expand,
              children: [
                _RulerBackdrop(controller: _scrollController),
                Positioned.fill(
                  child: FocusScope(
                    node: _listFocus,
                    child: Padding(
                      padding: const EdgeInsets.only(top: 24, bottom: 104),
                      child: ReorderableListView.builder(
                        controller: _scrollController,
                        buildDefaultDragHandles: false,
                        padding: EdgeInsets.only(
                          left: 16,
                          right: kIsWeb ? 20 : 16,
                          bottom: 24,
                        ),
                        itemBuilder: (context, index) {
                          final chapter = widget.chapters[index];
                          final active = chapter.id == widget.activeChapterId;
                          final accent = _chapterAccentColor(chapter.id);
                          final canDrag = kIsWeb || Theme.of(context).platform != TargetPlatform.android;
                          final tile = _ChapterTab(
                            key: ValueKey(chapter.id),
                            id: chapter.id,
                            title: chapter.title,
                            active: active,
                            accent: accent,
                            onTap: () => widget.onSelect(chapter.id),
                            showHandle: canDrag,
                          );
                          if (!canDrag) {
                            return tile;
                          }
                          return ReorderableDragStartListener(
                            index: index,
                            child: tile,
                          );
                        },
                        itemCount: widget.chapters.length,
                        onReorder: widget.onReorder,
                        proxyDecorator: (child, index, animation) {
                          return ScaleTransition(
                            scale: CurvedAnimation(parent: animation, curve: Curves.easeOutCubic),
                            child: child,
                          );
                        },
                      ),
                    ),
                  ),
                ),
                Positioned(
                  left: 12,
                  right: 12,
                  bottom: 20,
                  child: _AddChapterButton(onPressed: widget.onAddChapter),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _RulerBackdrop extends StatelessWidget {
  const _RulerBackdrop({required this.controller});

  final ScrollController controller;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, child) {
        final offset = controller.hasClients ? controller.offset : 0.0;
        return _BackdropPainter(offset: offset);
      },
    );
  }
}

class _BackdropPainter extends StatelessWidget {
  const _BackdropPainter({required this.offset});

  final double offset;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
              child: const SizedBox.shrink(),
            ),
          ),
          CustomPaint(
            painter: _TickPainter(scrollOffset: offset),
          ),
          Align(
            alignment: Alignment.centerRight,
            child: Container(
              width: 12,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [
                    Colors.black.withOpacity(0.24),
                    Colors.black.withOpacity(0.05),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TickPainter extends CustomPainter {
  const _TickPainter({required this.scrollOffset});

  final double scrollOffset;

  @override
  void paint(Canvas canvas, Size size) {
    final tickPaint = Paint()
      ..color = Colors.white.withOpacity(0.16)
      ..strokeWidth = 1.4;

    final parallax = -scrollOffset * _ChapterRulerV2State._tickParallax;
    final start = (parallax % _ChapterRulerV2State._tickSpacing) - _ChapterRulerV2State._tickSpacing;

    for (double y = start; y < size.height + _ChapterRulerV2State._tickSpacing; y += _ChapterRulerV2State._tickSpacing) {
      final opacity = 0.22 + 0.1 * math.cos(y / _ChapterRulerV2State._tickSpacing);
      tickPaint.color = Colors.white.withOpacity(opacity.clamp(0.12, 0.32));
      canvas.drawLine(Offset(0, y), Offset(size.width, y), tickPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _TickPainter oldDelegate) => oldDelegate.scrollOffset != scrollOffset;
}

class _ChapterTab extends StatelessWidget {
  const _ChapterTab({
    super.key,
    required this.id,
    required this.title,
    required this.active,
    required this.accent,
    required this.onTap,
    required this.showHandle,
  });

  final String id;
  final String title;
  final bool active;
  final Color accent;
  final VoidCallback onTap;
  final bool showHandle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final handle = showHandle
        ? Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Icon(Icons.drag_handle_rounded, color: Colors.white.withOpacity(0.72)),
          )
        : const SizedBox(width: 4);

    final background = active ? Colors.white.withOpacity(0.24) : Colors.white.withOpacity(0.08);
    final glow = active
        ? [
            BoxShadow(color: const Color(0x4206B6D4), blurRadius: 18, spreadRadius: 1, offset: const Offset(0, 4)),
          ]
        : [
            BoxShadow(color: Colors.black.withOpacity(0.18), blurRadius: 6, offset: const Offset(0, 3)),
          ];

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(26),
          child: Ink(
            height: 52,
            decoration: ShapeDecoration(
              color: background,
              shape: _SkewedPillBorder(
                borderRadius: 26,
                cut: 14,
                side: active
                    ? BorderSide(color: Colors.white.withOpacity(0.5), width: 1.2)
                    : BorderSide(color: Colors.white.withOpacity(0.18), width: 1),
              ),
              shadows: glow,
            ),
            child: Row(
              children: [
                Container(
                  width: 4,
                  height: double.infinity,
                  decoration: BoxDecoration(
                    color: active ? const Color(0xFF06B6D4) : accent.withOpacity(0.8),
                    borderRadius: const BorderRadius.horizontal(left: Radius.circular(18)),
                    boxShadow: active
                        ? [
                            BoxShadow(
                              color: const Color(0xFF06B6D4).withOpacity(0.6),
                              blurRadius: 14,
                              spreadRadius: 0.5,
                            ),
                          ]
                        : null,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: DefaultTextStyle(
                    style: theme.textTheme.titleMedium!.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                    child: Text(
                      title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
                handle,
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _AddChapterButton extends StatelessWidget {
  const _AddChapterButton({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF6366F1),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        elevation: 8,
        shadowColor: const Color(0xFF4338CA).withOpacity(0.42),
      ),
      icon: const Icon(Icons.add_circle_outline),
      label: const Text(
        'Глава',
        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
      ),
    );
  }
}

class _SkewedPillBorder extends ShapeBorder {
  const _SkewedPillBorder({
    required this.borderRadius,
    required this.cut,
    this.side = BorderSide.none,
  });

  final double borderRadius;
  final double cut;
  final BorderSide side;

  @override
  EdgeInsetsGeometry get dimensions => EdgeInsets.all(side.width);

  @override
  ShapeBorder scale(double t) {
    return _SkewedPillBorder(
      borderRadius: borderRadius * t,
      cut: cut * t,
      side: side.scale(t),
    );
  }

  Path _buildPath(Rect rect) {
    final right = rect.right;
    final left = rect.left;
    final top = rect.top;
    final bottom = rect.bottom;
    final r = borderRadius;
    final cutAmount = cut;

    return Path()
      ..moveTo(left + cutAmount, top)
      ..lineTo(right - r, top)
      ..quadraticBezierTo(right, top, right, top + r)
      ..lineTo(right, bottom - r)
      ..quadraticBezierTo(right, bottom, right - r, bottom)
      ..lineTo(left + cutAmount, bottom)
      ..lineTo(left, bottom - cutAmount)
      ..lineTo(left, top + cutAmount)
      ..close();
  }

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) => _buildPath(rect);

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) {
    final insetRect = rect.deflate(side.width);
    return _buildPath(insetRect);
  }

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    if (side.style == BorderStyle.none || side.width == 0) {
      return;
    }
    final paint = side.toPaint();
    canvas.drawPath(getOuterPath(rect, textDirection: textDirection), paint);
  }
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
  final hash = id.codeUnits.fold<int>(0, (prev, code) => (prev * 37 + code) & 0x7fffffff);
  return palette[hash % palette.length];
}
