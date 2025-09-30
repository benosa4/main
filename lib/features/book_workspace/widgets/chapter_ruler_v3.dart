import 'dart:async';
import 'dart:math' as math;
import 'dart:ui';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'package:voicebook/core/models/chapter_summary.dart';

class ChapterRulerV3 extends StatefulWidget {
  const ChapterRulerV3({
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
  State<ChapterRulerV3> createState() => _ChapterRulerV3State();
}

class _ChapterRulerV3State extends State<ChapterRulerV3> {
  static const _scrollBoxName = 'ui_state';
  static const _scrollKeyPrefix = 'chapterRulerScrollOffset::';
  static const _hoverWidth = 132.0;
  static const _baseWidth = 104.0;
  static const _tickSpacing = 48.0;
  static const _tickParallax = 0.16;
  static const _hoverDuration = Duration(milliseconds: 180);

  final ScrollController _scrollController = ScrollController();
  final FocusScopeNode _focusNode = FocusScopeNode();
  final GlobalKey<_AddChapterFabState> _fabKey = GlobalKey<_AddChapterFabState>();

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
  void didUpdateWidget(covariant ChapterRulerV3 oldWidget) {
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
      _fabKey.currentState?.pulse();
    }
  }

  @override
  void dispose() {
    _persistDebounce?.cancel();
    _persistScrollOffset();
    _scrollController.removeListener(_handleScroll);
    _scrollController.dispose();
    _focusNode.dispose();
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

  bool get _hoverCapable {
    final platform = Theme.of(context).platform;
    return kIsWeb || platform == TargetPlatform.macOS || platform == TargetPlatform.windows || platform == TargetPlatform.linux;
  }

  void _setHovered(bool value) {
    if (!_hoverCapable) {
      return;
    }
    if (_hovered == value) {
      return;
    }
    setState(() => _hovered = value);
  }

  @override
  Widget build(BuildContext context) {
    final width = _hovered ? _hoverWidth : _baseWidth;
    final theme = Theme.of(context);

    return MouseRegion(
      onEnter: (_) => _setHovered(true),
      onExit: (_) => _setHovered(false),
      child: AnimatedContainer(
        duration: _hoverDuration,
        curve: Curves.easeOutCubic,
        width: width,
        child: Container(
          margin: const EdgeInsets.only(right: 12),
          decoration: BoxDecoration(
            borderRadius: const BorderRadius.only(
              topRight: Radius.circular(20),
              bottomRight: Radius.circular(20),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.12),
                blurRadius: 14,
                spreadRadius: 1,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: const BorderRadius.only(
              topRight: Radius.circular(20),
              bottomRight: Radius.circular(20),
            ),
            child: Stack(
              fit: StackFit.expand,
              children: [
                _RulerBackdrop(controller: _scrollController),
                Positioned.fill(
                  child: FocusScope(
                    node: _focusNode,
                    child: Padding(
                      padding: const EdgeInsets.only(top: 28, bottom: 132),
                      child: ReorderableListView.builder(
                        scrollController: _scrollController,
                        buildDefaultDragHandles: false,
                        padding: EdgeInsets.only(
                          left: 12,
                          right: _hoverCapable ? 20 : 16,
                          bottom: 24,
                        ),
                        itemBuilder: (context, index) {
                          final chapter = widget.chapters[index];
                          final active = chapter.id == widget.activeChapterId;
                          final accent = _chapterAccentColor(chapter.id);
                          final canDrag = _hoverCapable;
                          final itemKey = ValueKey('chapter_${chapter.id}');
                          final tile = Transform.translate(
                            offset: Offset((index % 3) * 2.0, index % 4 == 0 ? 3.0 : 0.0),
                            child: _BookmarkTab(
                              key: canDrag ? null : itemKey,
                              index: index,
                              id: chapter.id,
                              title: chapter.title,
                              active: active,
                              accent: accent,
                              onTap: () => widget.onSelect(chapter.id),
                              showHandle: canDrag,
                            ),
                          );
                          if (!canDrag) {
                            return tile;
                          }
                          return ReorderableDragStartListener(
                            key: itemKey,
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
                  left: 0,
                  right: 0,
                  bottom: 20,
                  child: _AddChapterFab(
                    key: _fabKey,
                    onPressed: () {
                      widget.onAddChapter();
                      _fabKey.currentState?.pulse();
                    },
                    labelStyle: theme.textTheme.labelLarge,
                  ),
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
        return _BackdropLayer(scrollOffset: offset);
      },
    );
  }
}

class _BackdropLayer extends StatelessWidget {
  const _BackdropLayer({required this.scrollOffset});

  final double scrollOffset;

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
        ),
        Positioned.fill(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
            child: Container(color: Colors.white.withOpacity(0.06)),
          ),
        ),
        const CustomPaint(
          painter: _GroovesPainter(),
        ),
        CustomPaint(
          painter: _TickMarksPainter(scrollOffset: scrollOffset),
        ),
        Align(
          alignment: Alignment.centerRight,
          child: Container(
            width: 36,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
                colors: [
                  Colors.black.withOpacity(0.22),
                  Colors.black.withOpacity(0.08),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _TickMarksPainter extends CustomPainter {
  const _TickMarksPainter({required this.scrollOffset});

  final double scrollOffset;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.16)
      ..strokeWidth = 1.2;

    final parallax = -scrollOffset * _ChapterRulerV3State._tickParallax;
    final start = (parallax % _ChapterRulerV3State._tickSpacing) - _ChapterRulerV3State._tickSpacing;

    for (double y = start; y < size.height + _ChapterRulerV3State._tickSpacing; y += _ChapterRulerV3State._tickSpacing) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant _TickMarksPainter oldDelegate) => oldDelegate.scrollOffset != scrollOffset;
}

class _GroovesPainter extends CustomPainter {
  const _GroovesPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..strokeWidth = 1;
    for (double x = 10; x < size.width - 10; x += 12) {
      final alpha = 0.06 + 0.02 * math.sin(x * .25);
      paint.color = Colors.white.withOpacity(alpha);
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _BookmarkTab extends StatefulWidget {
  const _BookmarkTab({
    super.key,
    required this.index,
    required this.id,
    required this.title,
    required this.active,
    required this.accent,
    required this.onTap,
    required this.showHandle,
  });

  final int index;
  final String id;
  final String title;
  final bool active;
  final Color accent;
  final VoidCallback onTap;
  final bool showHandle;

  @override
  State<_BookmarkTab> createState() => _BookmarkTabState();
}

class _BookmarkTabState extends State<_BookmarkTab> with SingleTickerProviderStateMixin {
  late final AnimationController _breathController = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 7),
  )..addListener(() {
      if (widget.active) {
        setState(() {});
      }
    });

  bool _hovered = false;
  bool _pressed = false;

  @override
  void initState() {
    super.initState();
    if (widget.active) {
      _breathController.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(covariant _BookmarkTab oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.active && !_breathController.isAnimating) {
      _breathController.repeat(reverse: true);
    } else if (!widget.active && _breathController.isAnimating) {
      _breathController.stop();
    }
  }

  @override
  void dispose() {
    _breathController.dispose();
    super.dispose();
  }

  void _setHovered(bool value) {
    if (_hovered == value) {
      return;
    }
    setState(() => _hovered = value);
  }

  void _setPressed(bool value) {
    if (_pressed == value) {
      return;
    }
    setState(() => _pressed = value);
  }

  @override
  Widget build(BuildContext context) {
    final scale = _hovered ? 1.02 : 1.0;
    final glowFactor = widget.active ? (0.20 + 0.06 * (_breathController.value)) : 0.0;
    final background = Color.lerp(widget.accent.withOpacity(0.24), Colors.white.withOpacity(0.12), widget.active ? 0 : 0.4)!;
    final textColor = widget.active ? Colors.white : Colors.white.withOpacity(0.88);
    final badge = _numberBadge(widget.index + 1);
    final title = Text(
      widget.title,
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: textColor,
          ),
    );

    final handle = widget.showHandle
        ? Padding(
            padding: const EdgeInsets.only(left: 8),
            child: Icon(
              Icons.drag_handle_rounded,
              color: Colors.white.withOpacity(0.68),
              size: 18,
            ),
          )
        : const SizedBox(width: 4);

    final shape = _BookmarkShape(radius: 18, notch: 16);

    return MouseRegion(
      onEnter: (_) => _setHovered(true),
      onExit: (_) => _setHovered(false),
      child: AnimatedScale(
        scale: scale,
        duration: const Duration(milliseconds: 140),
        curve: Curves.easeOutCubic,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          curve: Curves.easeOutCubic,
          transform: Matrix4.identity()..translate(0.0, _pressed ? 1.0 : 0.0),
          height: 56,
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: widget.onTap,
              onHover: (value) => _setHovered(value),
              onTapDown: (_) => _setPressed(true),
              onTapUp: (_) => _setPressed(false),
              onTapCancel: () => _setPressed(false),
              customBorder: shape,
              child: Ink(
                decoration: ShapeDecoration(
                  shape: shape,
                  color: background,
                  shadows: [
                    if (widget.active)
                      BoxShadow(
                        color: const Color(0xFF06B6D4).withOpacity(glowFactor),
                        blurRadius: 22,
                        spreadRadius: 1,
                        offset: const Offset(0, 6),
                      )
                    else if (_hovered)
                      BoxShadow(
                        color: Colors.black.withOpacity(0.18),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                  ],
                ),
                child: Stack(
                  children: [
                    _neonStrip(widget.active),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      child: Row(
                        children: [
                          badge,
                          const SizedBox(width: 10),
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: widget.accent,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: widget.accent.withOpacity(0.6),
                                  blurRadius: 8,
                                  spreadRadius: -1,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(child: title),
                          handle,
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _BookmarkShape extends ShapeBorder {
  const _BookmarkShape({required this.radius, required this.notch});

  final double radius;
  final double notch;

  @override
  EdgeInsetsGeometry get dimensions => EdgeInsets.zero;

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    final r = Radius.circular(radius);
    final path = Path();
    path.moveTo(rect.left + notch, rect.top);
    path.lineTo(rect.right - r.x, rect.top);
    path.quadraticBezierTo(rect.right, rect.top, rect.right, rect.top + r.y);
    path.lineTo(rect.right, rect.bottom - r.y);
    path.quadraticBezierTo(rect.right, rect.bottom, rect.right - r.x, rect.bottom);
    path.lineTo(rect.left + notch, rect.bottom);
    path.lineTo(rect.left, rect.bottom - 14);
    path.lineTo(rect.left, rect.top + 14);
    path.close();
    return path;
  }

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) => getOuterPath(rect, textDirection: textDirection);

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {}

  @override
  ShapeBorder scale(double t) => _BookmarkShape(radius: radius * t, notch: notch * t);
}

class _AddChapterFab extends StatefulWidget {
  const _AddChapterFab({super.key, required this.onPressed, required this.labelStyle});

  final VoidCallback onPressed;
  final TextStyle? labelStyle;

  @override
  State<_AddChapterFab> createState() => _AddChapterFabState();
}

class _AddChapterFabState extends State<_AddChapterFab> with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 260),
    lowerBound: 0.0,
    upperBound: 0.12,
  );

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void pulse() {
    if (!mounted) {
      return;
    }
    _controller.forward(from: 0).then((_) => _controller.reverse());
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final scale = 1 + _controller.value;
        return Transform.scale(
          scale: scale,
          child: child,
        );
      },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ElevatedButton(
            onPressed: () {
              widget.onPressed();
              pulse();
            },
            style: ElevatedButton.styleFrom(
              shape: const CircleBorder(),
              minimumSize: const Size(62, 62),
              padding: EdgeInsets.zero,
              backgroundColor: const Color(0xFF06B6D4),
              foregroundColor: Colors.white,
              elevation: 6,
            ),
            child: const Icon(Icons.add_rounded, size: 28),
          ),
          const SizedBox(height: 8),
          Text('+ Глава', style: widget.labelStyle?.copyWith(color: Colors.white.withOpacity(0.86)) ?? const TextStyle(color: Colors.white)),
        ],
      ),
    );
  }
}

Widget _numberBadge(int n) => Container(
      height: 18,
      padding: const EdgeInsets.symmetric(horizontal: 6),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(.10),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        '$n',
        style: const TextStyle(
          fontFeatures: [FontFeature.tabularFigures()],
          fontSize: 11,
          color: Color(0xFF0F172A),
          fontWeight: FontWeight.w600,
        ),
      ),
    );

Widget _neonStrip(bool active) => Positioned(
      left: 0,
      top: 8,
      bottom: 8,
      child: AnimatedOpacity(
        opacity: active ? 1 : 0,
        duration: const Duration(milliseconds: 160),
        child: Container(
          width: 2.5,
          decoration: BoxDecoration(
            color: const Color(0xFF06B6D4),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
      ),
    );

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

