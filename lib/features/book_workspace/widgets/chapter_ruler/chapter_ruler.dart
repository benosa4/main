import 'dart:async';
import 'dart:math' as math;
import 'dart:ui';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:voicebook/core/models/models.dart';
import 'package:voicebook/core/storage/ui_state_storage.dart';
import 'package:voicebook/shared/tokens/design_tokens.dart';

class ChapterRuler extends StatefulWidget {
  const ChapterRuler({
    super.key,
    required this.bookId,
    required this.chapters,
    required this.activeChapterId,
    required this.onSelect,
    required this.onReorder,
    required this.onAddChapter,
    this.width = 68.0,
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

class _ChapterRulerState extends State<ChapterRuler> with SingleTickerProviderStateMixin {
  static const _tickSpacing = 48.0;
  static const _tickParallaxFactor = 0.12;

  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode(debugLabel: 'ChapterRulerFocus');
  final Map<String, GlobalKey> _itemKeys = {};

  UiStateStorage? _uiStateStorage;
  Timer? _persistDebounce;
  double _scrollOffset = 0;
  int _focusedIndex = 0;

  late final AnimationController _breathController = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 6),
    lowerBound: 0,
    upperBound: 1,
  )..repeat(reverse: true);

  @override
  void initState() {
    super.initState();
    _focusedIndex = math.max(0, widget.chapters.indexWhere((c) => c.id == widget.activeChapterId));
    _restoreScroll();
    _scrollController.addListener(_handleScrollChange);
    _focusNode.addListener(_handleFocusChanged);
    WidgetsBinding.instance.addPostFrameCallback((_) => _ensureActiveVisible());
  }

  @override
  void didUpdateWidget(covariant ChapterRuler oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.activeChapterId != widget.activeChapterId) {
      _focusedIndex = math.max(0, widget.chapters.indexWhere((c) => c.id == widget.activeChapterId));
      _ensureActiveVisible();
    }

    if (oldWidget.chapters.length != widget.chapters.length && _scrollController.hasClients) {
      final max = _scrollController.position.maxScrollExtent;
      if (_scrollController.offset > max) {
        _scrollController.jumpTo(max);
      }
    }
  }

  @override
  void dispose() {
    _persistDebounce?.cancel();
    _persistScroll();
    _scrollController.removeListener(_handleScrollChange);
    _focusNode.removeListener(_handleFocusChanged);
    _scrollController.dispose();
    _focusNode.dispose();
    _breathController.dispose();
    super.dispose();
  }

  void _handleScrollChange() {
    final offset = _scrollController.offset;
    if (offset == _scrollOffset) {
      return;
    }
    setState(() {
      _scrollOffset = offset;
    });
    _persistDebounce?.cancel();
    _persistDebounce = Timer(const Duration(milliseconds: 240), _persistScroll);
  }

  Future<void> _restoreScroll() async {
    UiStateStorage storage;
    try {
      storage = await UiStateStorage.open();
    } catch (_) {
      return;
    }

    final stored = storage.readChapterRulerOffset(widget.bookId);
    _uiStateStorage = storage;
    if (stored == null) {
      return;
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) {
        return;
      }
      final maxExtent = _scrollController.position.maxScrollExtent;
      final clamped = stored.clamp(0.0, maxExtent);
      _scrollController.jumpTo(clamped);
      setState(() {
        _scrollOffset = clamped;
      });
    });
  }

  void _persistScroll() {
    final storage = _uiStateStorage;
    if (storage == null) {
      return;
    }
    storage.writeChapterRulerOffset(widget.bookId, _scrollController.offset);
  }

  void _handleFocusChanged() {
    if (_focusNode.hasFocus) {
      _focusedIndex = math.max(0, widget.chapters.indexWhere((c) => c.id == widget.activeChapterId));
    }
  }

  KeyEventResult _handleKey(FocusNode node, RawKeyEvent event) {
    if (event is! RawKeyDownEvent) {
      return KeyEventResult.ignored;
    }

    final isMetaPressed = event.isMetaPressed || event.isControlPressed;
    if (event.logicalKey == LogicalKeyboardKey.arrowDown) {
      if (isMetaPressed) {
        _reorderFromKeyboard(1);
      } else {
        _moveFocus(1);
      }
      return KeyEventResult.handled;
    }

    if (event.logicalKey == LogicalKeyboardKey.arrowUp) {
      if (isMetaPressed) {
        _reorderFromKeyboard(-1);
      } else {
        _moveFocus(-1);
      }
      return KeyEventResult.handled;
    }

    if (event.logicalKey == LogicalKeyboardKey.enter ||
        event.logicalKey == LogicalKeyboardKey.space) {
      if (_focusedIndex >= 0 && _focusedIndex < widget.chapters.length) {
        widget.onSelect(widget.chapters[_focusedIndex].id);
      }
      return KeyEventResult.handled;
    }

    return KeyEventResult.ignored;
  }

  void _moveFocus(int delta) {
    if (widget.chapters.isEmpty) {
      return;
    }
    _focusedIndex = (_focusedIndex + delta).clamp(0, widget.chapters.length - 1);
    widget.onSelect(widget.chapters[_focusedIndex].id);
  }

  void _reorderFromKeyboard(int direction) {
    if (widget.chapters.length <= 1) {
      return;
    }
    final currentIndex = widget.chapters.indexWhere((c) => c.id == widget.activeChapterId);
    if (currentIndex == -1) {
      return;
    }
    final baseTarget = (currentIndex + direction).clamp(0, widget.chapters.length - 1);
    if (baseTarget == currentIndex) {
      return;
    }
    final rawNewIndex = direction > 0
        ? math.min(widget.chapters.length, baseTarget + 1)
        : baseTarget;
    widget.onReorder(currentIndex, rawNewIndex);
  }

  void _ensureActiveVisible() {
    if (!mounted) {
      return;
    }
    final key = _itemKeys[widget.activeChapterId];
    if (key == null) {
      return;
    }
    final context = key.currentContext;
    if (context == null) {
      return;
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) {
        return;
      }
      Scrollable.ensureVisible(
        context,
        duration: const Duration(milliseconds: 280),
        alignment: 0.3,
        curve: Curves.easeOutCubic,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final compact = widget.compact;
    final rulerWidth = widget.width;

    return SizedBox(
      width: rulerWidth,
      child: ClipRRect(
        borderRadius: const BorderRadius.horizontal(right: Radius.circular(16)),
        child: DecoratedBox(
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [AppColors.primary, AppColors.secondary],
            ),
            border: Border.all(color: AppColors.border.withOpacity(0.18)),
            boxShadow: const [
              BoxShadow(color: Colors.black12, blurRadius: 12, offset: Offset(0, 6)),
            ],
          ),
          child: Stack(
            children: [
              Positioned.fill(
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
                  child: const SizedBox(),
                ),
              ),
              Positioned.fill(
                child: CustomPaint(
                  painter: _RulerTickPainter(
                    offset: _scrollOffset,
                    spacing: _tickSpacing,
                    parallaxFactor: _tickParallaxFactor,
                    color: Colors.white.withOpacity(0.1),
                  ),
                ),
              ),
              Positioned.fill(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: _buildList(context, compact),
                ),
              ),
              Positioned(
                bottom: compact ? 12 : 16,
                left: 0,
                right: 0,
                child: _AddChapterButton(
                  onPressed: widget.onAddChapter,
                  compact: compact,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildList(BuildContext context, bool compact) {
    return Padding(
      padding: EdgeInsets.only(bottom: (compact ? 72 : 92)),
      child: Focus(
        focusNode: _focusNode,
        onKey: _handleKey,
        child: ReorderableListView.builder(
          padding: EdgeInsets.only(top: compact ? 16 : 24, bottom: compact ? 16 : 24),
          scrollController: _scrollController,
          physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
          itemCount: widget.chapters.length,
          buildDefaultDragHandles: false,
          onReorder: (oldIndex, newIndex) {
            widget.onReorder(oldIndex, newIndex);
          },
          itemBuilder: (context, index) {
            final chapter = widget.chapters[index];
            final isActive = chapter.id == widget.activeChapterId;
            final key = _itemKeys.putIfAbsent(chapter.id, () => GlobalObjectKey(chapter.id));

            return KeyedSubtree(
              key: ValueKey(chapter.id),
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: compact ? 4 : 6),
                child: _ChapterTab(
                  key: key,
                  chapter: chapter,
                  index: index,
                  isActive: isActive,
                  compact: compact,
                  controller: _breathController,
                  rulerFocusNode: _focusNode,
                  onTap: () => widget.onSelect(chapter.id),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _ChapterTab extends StatefulWidget {
  const _ChapterTab({
    super.key,
    required this.chapter,
    required this.index,
    required this.isActive,
    required this.compact,
    required this.controller,
    required this.rulerFocusNode,
    required this.onTap,
  });

  final ChapterSummary chapter;
  final int index;
  final bool isActive;
  final bool compact;
  final AnimationController controller;
  final FocusNode rulerFocusNode;
  final VoidCallback onTap;

  @override
  State<_ChapterTab> createState() => _ChapterTabState();
}

class _ChapterTabState extends State<_ChapterTab> {
  bool _hovering = false;

  @override
  Widget build(BuildContext context) {
    final paletteColor = _chapterColor(widget.chapter.id);
    final luminance = paletteColor.computeLuminance();
    final textColor = luminance > 0.6 ? const Color(0xFF0F172A) : Colors.white;
    final captionColor = Color.lerp(textColor, Colors.black, 0.2)!;
    final accent = AppColors.accent.withOpacity(0.24);

    final padding = EdgeInsets.symmetric(horizontal: widget.compact ? 10 : 12, vertical: widget.compact ? 6 : 8);
    final minHeight = widget.compact ? 36.0 : 44.0;

    final animation = CurvedAnimation(parent: widget.controller, curve: Curves.easeInOut);
    final glowOpacity = widget.isActive ? Tween(begin: 0.2, end: 0.24).animate(animation) : null;

    final borderColor = widget.isActive
        ? accent
        : AppColors.border.withOpacity(0.18);

    Widget buildTile({Widget? trailing}) {
      return GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () {
          widget.rulerFocusNode.requestFocus();
          widget.onTap();
        },
        child: AnimatedBuilder(
          animation: widget.controller,
          builder: (context, child) {
            final glow = glowOpacity?.value ?? 0;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 120),
              curve: Curves.easeOut,
              height: minHeight,
              padding: padding,
              decoration: BoxDecoration(
                boxShadow: widget.isActive
                    ? [
                        BoxShadow(
                          color: AppColors.accent.withOpacity(0.12 + glow / 2),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ]
                    : [
                        if (_hovering)
                          const BoxShadow(
                            color: Colors.black12,
                            blurRadius: 6,
                            offset: Offset(0, 2),
                          ),
                      ],
                border: Border.all(
                  color: widget.isActive ? accent : borderColor,
                  width: widget.isActive ? 1.6 : 1,
                ),
                color: paletteColor,
                borderRadius: BorderRadius.circular(999),
              ),
              child: ClipPath(
                clipper: _BookmarkClipper(compact: widget.compact),
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: AnimatedOpacity(
                        duration: const Duration(milliseconds: 200),
                        opacity: _hovering ? 0.08 : 0.0,
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [Colors.white.withOpacity(0.32), Colors.white.withOpacity(0)],
                            ),
                          ),
                        ),
                      ),
                    ),
                    Positioned.fill(
                      child: Padding(
                        padding: EdgeInsets.only(left: widget.compact ? 12 : 14, right: widget.compact ? 10 : 12),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '#${widget.index + 1}',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                          fontWeight: FontWeight.w600,
                                          color: captionColor,
                                        ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    widget.chapter.title,
                                    maxLines: widget.compact ? 1 : 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                          fontWeight: FontWeight.w600,
                                          color: textColor,
                                        ),
                                  ),
                                ],
                              ),
                            ),
                            if (trailing != null) trailing,
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      );
    }

    return MouseRegion(
      onEnter: (_) => setState(() => _hovering = true),
      onExit: (_) => setState(() => _hovering = false),
      cursor: SystemMouseCursors.click,
      child: FocusableActionDetector(
        mouseCursor: SystemMouseCursors.click,
        child: kIsWeb
            ? buildTile(
                trailing: AnimatedOpacity(
                  duration: const Duration(milliseconds: 120),
                  opacity: _hovering ? 1 : 0,
                  child: ReorderableDragStartListener(
                    index: widget.index,
                    child: Icon(
                      Icons.drag_indicator,
                      size: widget.compact ? 16 : 18,
                      color: textColor.withOpacity(0.72),
                    ),
                  ),
                ),
              )
            : ReorderableDelayedDragStartListener(
                index: widget.index,
                child: buildTile(
                  trailing: Icon(
                    Icons.more_vert,
                    size: widget.compact ? 16 : 18,
                    color: textColor.withOpacity(0.72),
                  ),
                ),
              ),
      ),
    );
  }
}

class _AddChapterButton extends StatefulWidget {
  const _AddChapterButton({required this.onPressed, required this.compact});

  final VoidCallback onPressed;
  final bool compact;

  @override
  State<_AddChapterButton> createState() => _AddChapterButtonState();
}

class _AddChapterButtonState extends State<_AddChapterButton> with SingleTickerProviderStateMixin {
  late final AnimationController _pulseController = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 320),
    lowerBound: 0,
    upperBound: 1,
  );

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _handleTap() {
    widget.onPressed();
    _pulseController
      ..value = 0
      ..forward();
  }

  @override
  Widget build(BuildContext context) {
    final size = widget.compact ? 48.0 : 56.0;
    final gradient = const LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [AppColors.primary, AppColors.secondary],
    );

    return SizedBox(
      height: size,
      child: Center(
        child: AnimatedBuilder(
          animation: _pulseController,
          builder: (context, child) {
            final double scale =
                1 + (_pulseController.isAnimating ? (0.04 * (1 - _pulseController.value)) : 0);
            return Transform.scale(
              scale: scale,
              child: child,
            );
          },
          child: Material(
            color: Colors.transparent,
            elevation: widget.compact ? 2 : 4,
            shape: const CircleBorder(),
            child: InkWell(
              onTap: _handleTap,
              customBorder: const CircleBorder(),
              child: Ink(
                width: size,
                height: size,
                decoration: ShapeDecoration(
                  shape: const CircleBorder(),
                  gradient: gradient,
                  shadows: const [
                    BoxShadow(color: Colors.black26, blurRadius: 12, offset: Offset(0, 4)),
                  ],
                ),
                child: const Icon(Icons.add, color: Colors.white),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _RulerTickPainter extends CustomPainter {
  const _RulerTickPainter({
    required this.offset,
    required this.spacing,
    required this.parallaxFactor,
    required this.color,
  });

  final double offset;
  final double spacing;
  final double parallaxFactor;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1;

    final parallaxOffset = (offset * parallaxFactor) % spacing;
    double y = -parallaxOffset;
    while (y < size.height) {
      final startX = size.width - 18;
      canvas.drawLine(Offset(startX, y), Offset(size.width - 8, y), paint);
      y += spacing;
    }
  }

  @override
  bool shouldRepaint(covariant _RulerTickPainter oldDelegate) {
    return offset != oldDelegate.offset || color != oldDelegate.color || spacing != oldDelegate.spacing;
  }
}

class _BookmarkClipper extends CustomClipper<Path> {
  const _BookmarkClipper({required this.compact});

  final bool compact;

  @override
  Path getClip(Size size) {
    final notch = compact ? 10.0 : 12.0;
    final curve = compact ? 12.0 : 16.0;
    final path = Path();

    path.moveTo(notch, 0);
    path.lineTo(size.width - curve, 0);
    path.quadraticBezierTo(size.width, 0, size.width, curve);
    path.lineTo(size.width, size.height - curve);
    path.quadraticBezierTo(size.width, size.height, size.width - curve, size.height);
    path.lineTo(notch, size.height);
    path.quadraticBezierTo(0, size.height, 0, size.height - curve * 0.6);
    path.lineTo(0, curve * 0.6);
    path.quadraticBezierTo(0, 0, notch, 0);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant _BookmarkClipper oldClipper) => oldClipper.compact != compact;
}

const _chapterPalette = <Color>[
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

Color _chapterColor(String chapterId) {
  final hash = chapterId.codeUnits.fold<int>(0, (value, element) => (value * 31 + element) & 0x7fffffff);
  return _chapterPalette[hash % _chapterPalette.length];
}
