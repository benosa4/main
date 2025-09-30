import 'dart:async';
import 'dart:math' as math;
import 'dart:ui';

import 'package:collection/collection.dart';
import 'package:flutter/material.dart';

import 'package:voicebook/core/models/chapter_summary.dart';

import 'chapter_line_tile.dart';
import 'ruled_viewport.dart';
import 'spine_constants.dart';
import 'spine_palette.dart';
import 'spine_tab.dart';

class SpineNotebookView extends StatefulWidget {
  const SpineNotebookView({
    super.key,
    required this.bookTitle,
    required this.chapters,
    required this.activeId,
    required this.onOpen,
    required this.onAdd,
  });

  final String bookTitle;
  final List<ChapterSummary> chapters;
  final String? activeId;
  final ValueChanged<String> onOpen;
  final VoidCallback onAdd;

  @override
  State<SpineNotebookView> createState() => _SpineNotebookViewState();
}

class _SpineNotebookViewState extends State<SpineNotebookView> {
  final ScrollController _controller = ScrollController();
  bool _showAddButton = false;
  Timer? _revealTimer;
  final ValueNotifier<List<Rect>> _textBands = ValueNotifier<List<Rect>>(<Rect>[]);
  final GlobalKey _stackKey = GlobalKey();
  final GlobalKey _headerBandKey = GlobalKey();
  final Map<String, GlobalKey> _chapterBandKeys = <String, GlobalKey>{};
  bool _bandsDirty = false;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_handleScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) => _collectTextBands());
  }

  @override
  void dispose() {
    _revealTimer?.cancel();
    _controller.removeListener(_handleScroll);
    _controller.dispose();
    _textBands.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant SpineNotebookView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!const ListEquality<String>().equals(
      oldWidget.chapters.map((chapter) => chapter.id).toList(),
      widget.chapters.map((chapter) => chapter.id).toList(),
    )) {
      _syncChapterKeys();
      _scheduleBandCollection();
    } else if (oldWidget.bookTitle != widget.bookTitle) {
      _scheduleBandCollection();
    }
  }

  void _handleScroll() {
    _setAddVisibility(false);
    _revealTimer?.cancel();
    _revealTimer = Timer(const Duration(milliseconds: 360), () {
      if (mounted) {
        _setAddVisibility(true);
      }
    });
    _scheduleBandCollection();
  }

  void _setAddVisibility(bool visible) {
    if (_showAddButton != visible) {
      setState(() => _showAddButton = visible);
    }
  }

  void _handlePointerHover(bool hovering) {
    if (hovering) {
      _setAddVisibility(true);
    } else {
      _setAddVisibility(false);
    }
  }

  void _syncChapterKeys() {
    final Map<String, GlobalKey> updated = <String, GlobalKey>{};
    for (final chapter in widget.chapters) {
      updated[chapter.id] = _chapterBandKeys[chapter.id] ?? GlobalKey();
    }
    _chapterBandKeys
      ..clear()
      ..addAll(updated);
  }

  void _scheduleBandCollection() {
    if (_bandsDirty) {
      return;
    }
    _bandsDirty = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) {
        return;
      }
      _bandsDirty = false;
      _collectTextBands();
    });
  }

  void _collectTextBands() {
    final RenderBox? stackBox = _stackKey.currentContext?.findRenderObject() as RenderBox?;
    if (stackBox == null) {
      return;
    }
    final double width = stackBox.size.width;
    final double left = kSpineWidth;
    final double right = math.max(left, width - kRightMarginOffset);
    final double maxWidth = right - left;
    final List<Rect> bands = <Rect>[];

    void addBand(GlobalKey key) {
      final RenderBox? renderBox = key.currentContext?.findRenderObject() as RenderBox?;
      if (renderBox == null) {
        return;
      }
      final Offset origin = renderBox.localToGlobal(Offset.zero, ancestor: stackBox);
      final double bandHeight = renderBox.size.height;
      if (bandHeight <= 0) {
        return;
      }
      final Rect baseRect = Rect.fromLTWH(left, origin.dy, maxWidth, bandHeight);
      final double inset = math.min(6.0, bandHeight / 3);
      final Rect clipped = Rect.fromLTRB(
        baseRect.left,
        baseRect.top + inset,
        baseRect.right,
        baseRect.bottom - inset,
      );
      if (clipped.bottom > clipped.top) {
        bands.add(clipped);
      }
    }

    addBand(_headerBandKey);
    for (final chapter in widget.chapters) {
      final key = _chapterBandKeys[chapter.id];
      if (key != null) {
        addBand(key);
      }
    }

    bands.sort((a, b) => a.top.compareTo(b.top));
    _textBands.value = bands;
  }

  @override
  Widget build(BuildContext context) {
    final chapters = widget.chapters;
    _syncChapterKeys();
    _scheduleBandCollection();

    return Stack(
      key: _stackKey,
      children: [
        ValueListenableBuilder<List<Rect>>(
          valueListenable: _textBands,
          builder: (context, bands, child) {
            final accentId = widget.activeId;
            final Color accentColor = accentId != null
                ? spineAccentFor(accentId)
                : const Color(0xFF38BDF8);
            return RuledViewport(
              controller: _controller,
              child: child!,
              accentColor: accentColor,
              textBands: bands,
            );
          },
          child: ListView.builder(
            controller: _controller,
            padding: const EdgeInsets.only(bottom: 120),
            itemCount: chapters.length + 1,
            itemBuilder: (context, index) {
              if (index == 0) {
                return _NotebookHeader(
                  key: _headerBandKey,
                  title: widget.bookTitle,
                  lineHeight: kLineHeight,
                  spineWidth: kSpineWidth,
                );
              }
              final chapter = chapters[index - 1];
              final isActive = chapter.id == widget.activeId;
              final bandKey = _chapterBandKeys[chapter.id] ?? GlobalKey();
              _chapterBandKeys[chapter.id] = bandKey;
              return ChapterLineTile(
                bandKey: bandKey,
                index: index,
                title: chapter.title,
                color: spineAccentFor(chapter.id),
                active: isActive,
                lineHeight: kLineHeight,
                spineWidth: kSpineWidth,
                onTap: () => widget.onOpen(chapter.id),
              );
            },
          ),
        ),
        Positioned(
          left: 0,
          top: 0,
          bottom: 0,
          width: kSpineWidth,
          child: MouseRegion(
            onEnter: (_) => _handlePointerHover(true),
            onExit: (_) => _handlePointerHover(false),
            child: const SizedBox.expand(),
          ),
        ),
        Positioned(
          left: 12,
          bottom: 12,
          child: GestureDetector(
            onTap: widget.onAdd,
            onLongPressStart: (_) => _setAddVisibility(true),
            onLongPressEnd: (_) => _setAddVisibility(false),
            child: AnimatedOpacity(
              opacity: _showAddButton ? 1 : 0,
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeOutCubic,
              child: IgnorePointer(
                ignoring: !_showAddButton,
                child: _GhostAddTab(lineHeight: kLineHeight),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _GhostAddTab extends StatelessWidget {
  const _GhostAddTab({required this.lineHeight});

  final double lineHeight;

  @override
  Widget build(BuildContext context) {
    final height = lineHeight * 2;
    return Container(
      height: height,
      width: SpineTab.baseWidth,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.32),
        borderRadius: const BorderRadius.horizontal(right: Radius.circular(18)),
        border: Border.all(color: const Color(0xFF2563EB).withOpacity(0.4), width: 1),
      ),
      child: const Center(
        child: Icon(Icons.add, color: Color(0xFF1D4ED8), size: 24),
      ),
    );
  }
}

class _NotebookHeader extends StatelessWidget {
  const _NotebookHeader({
    super.key,
    required this.title,
    required this.lineHeight,
    required this.spineWidth,
  });

  final String title;
  final double lineHeight;
  final double spineWidth;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final height = lineHeight * 2;
    return SizedBox(
      height: height,
      child: Row(
        children: [
          SizedBox(width: spineWidth),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Align(
                alignment: Alignment.bottomLeft,
                child: Text(
                  title,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF0F172A),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

