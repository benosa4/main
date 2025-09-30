import 'dart:async';

import 'package:flutter/material.dart';

import 'package:voicebook/core/models/chapter_summary.dart';

import 'chapter_line_tile.dart';
import 'ruled_viewport.dart';
import 'spine_tab.dart';

class SpineNotebookView extends StatefulWidget {
  const SpineNotebookView({
    super.key,
    required this.bookTitle,
    required this.chapters,
    required this.activeId,
    required this.onOpen,
    required this.onAdd,
    this.accentColor,
    this.collapsed = false,
    this.minVisibleSpineSlots = 20,
  });

  final String bookTitle;
  final List<ChapterSummary> chapters;
  final String? activeId;
  final ValueChanged<String> onOpen;
  final ValueChanged<int> onAdd;
  final Color? accentColor;
  final bool collapsed;
  final int minVisibleSpineSlots;

  static const double spineWidth = 112;
  static const double collapsedSpineWidth = SpineTab.collapsedWidth;
  static const double lineHeight = 28;

  @override
  State<SpineNotebookView> createState() => _SpineNotebookViewState();
}

class _SpineNotebookViewState extends State<SpineNotebookView> {
  final ScrollController _controller = ScrollController();
  final GlobalKey _viewportKey = GlobalKey();

  late double _spineWidth;
  int _bandGeneration = 0;
  final List<Rect> _pendingBands = <Rect>[];
  List<Rect> _textBands = const <Rect>[];
  bool _flushScheduled = false;

  @override
  void initState() {
    super.initState();
    _spineWidth = widget.collapsed
        ? SpineNotebookView.collapsedSpineWidth
        : SpineNotebookView.spineWidth;
  }

  @override
  void didUpdateWidget(covariant SpineNotebookView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.collapsed != widget.collapsed) {
      setState(() {
        _spineWidth = widget.collapsed
            ? SpineNotebookView.collapsedSpineWidth
            : SpineNotebookView.spineWidth;
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _beginCollectBands() {
    _bandGeneration++;
    _pendingBands.clear();
    _flushScheduled = false;
  }

  void _registerTextBand(Rect globalRect, int generation) {
    if (generation != _bandGeneration) {
      return;
    }
    final context = _viewportKey.currentContext;
    if (context == null) {
      return;
    }
    final renderBox = context.findRenderObject();
    if (renderBox is! RenderBox) {
      return;
    }
    final topLeft = renderBox.globalToLocal(globalRect.topLeft);
    final bottomRight = renderBox.globalToLocal(globalRect.bottomRight);
    final localRect = Rect.fromPoints(topLeft, bottomRight);
    _pendingBands.add(localRect);
    if (_flushScheduled) {
      return;
    }
    _flushScheduled = true;
    scheduleMicrotask(() {
      if (!mounted || generation != _bandGeneration) {
        return;
      }
      setState(() {
        _textBands = List<Rect>.unmodifiable(_pendingBands);
        _flushScheduled = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final chapters = widget.chapters;
    final activeId = widget.activeId;

    _beginCollectBands();
    final generation = _bandGeneration;

    final items = <_ChapterSlot>[];
    for (int i = 0; i < chapters.length; i++) {
      items.add(_ChapterSlot.chapter(chapters[i]));
    }
    while (items.length < widget.minVisibleSpineSlots) {
      items.add(_ChapterSlot.empty(index: items.length + 1));
    }

    final listView = ListView.builder(
      controller: _controller,
      padding: const EdgeInsets.only(bottom: 120),
      itemCount: items.length + 1,
      itemBuilder: (context, index) {
        if (index == 0) {
          return _NotebookHeader(
            title: widget.bookTitle,
            lineHeight: SpineNotebookView.lineHeight,
            spineWidth: _spineWidth,
            collapsed: widget.collapsed,
          );
        }
        final slot = items[index - 1];
        return slot.map(
          chapter: (chapter) {
            final summary = chapter.summary;
            final color = _colorFor(summary.id);
            final isActive = summary.id == activeId;
            return ChapterLineTile(
              index: index,
              title: summary.title,
              color: color,
              active: isActive,
              lineHeight: SpineNotebookView.lineHeight,
              spineWidth: _spineWidth,
              onTap: () => widget.onOpen(summary.id),
              registerTextBand: (rect) => _registerTextBand(rect, generation),
              collapsed: widget.collapsed,
            );
          },
          empty: (empty) {
            return SizedBox(
              height: SpineNotebookView.lineHeight * 2 + 8,
              child: Row(
                children: [
                  SpineTab(
                    index: empty.index,
                    lines: 2,
                    lineHeight: SpineNotebookView.lineHeight,
                    color: Colors.transparent,
                    active: false,
                    onTap: () {},
                    onCreate: () => widget.onAdd(empty.index),
                    spineWidth: _spineWidth,
                    collapsed: widget.collapsed,
                    isEmpty: true,
                  ),
                  const Spacer(),
                ],
              ),
            );
          },
        );
      },
    );

    final padding = widget.collapsed
        ? const EdgeInsets.only(left: 12, right: 24)
        : EdgeInsets.zero;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOutCubic,
      padding: padding,
      child: Stack(
        children: [
          RuledViewport(
            key: _viewportKey,
            controller: _controller,
            lineHeight: SpineNotebookView.lineHeight,
            spineWidth: _spineWidth,
            actionZoneWidth: 40,
            accentColor: widget.accentColor,
            textBands: _textBands,
            child: listView,
          ),
        ],
      ),
    );
  }
}

class _NotebookHeader extends StatelessWidget {
  const _NotebookHeader({
    required this.title,
    required this.lineHeight,
    required this.spineWidth,
    required this.collapsed,
  });

  final String title;
  final double lineHeight;
  final double spineWidth;
  final bool collapsed;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final height = lineHeight * 2;
    final horizontalInset = collapsed ? 20.0 : 16.0;
    return SizedBox(
      height: height,
      child: Row(
        children: [
          SizedBox(width: spineWidth),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(left: horizontalInset, right: 16),
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

class _ChapterSlot {
  const _ChapterSlot._({this.summary, this.index});

  factory _ChapterSlot.chapter(ChapterSummary summary) =>
      _ChapterSlot._(summary: summary);
  factory _ChapterSlot.empty({required int index}) => _ChapterSlot._(index: index);

  final ChapterSummary? summary;
  final int? index;

  T map<T>({required T Function(_ChapterSlotChapter value) chapter, required T Function(_ChapterSlotEmpty value) empty}) {
    if (summary != null) {
      return chapter(_ChapterSlotChapter(summary!));
    }
    return empty(_ChapterSlotEmpty(index ?? 0));
  }
}

class _ChapterSlotChapter {
  const _ChapterSlotChapter(this.summary);
  final ChapterSummary summary;
}

class _ChapterSlotEmpty {
  const _ChapterSlotEmpty(this.index);
  final int index;
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

Color spineNotebookAccentColorFor(String? id) {
  if (id == null) {
    return _pastelPalette.first;
  }
  return _colorFor(id);
}
