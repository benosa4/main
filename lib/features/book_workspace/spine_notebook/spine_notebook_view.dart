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
  static const double _lineHeight = 28;
  static const double _spineWidth = 104;

  final ScrollController _controller = ScrollController();
  bool _showAddButton = false;
  Timer? _revealTimer;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_handleScroll);
  }

  @override
  void dispose() {
    _revealTimer?.cancel();
    _controller.removeListener(_handleScroll);
    _controller.dispose();
    super.dispose();
  }

  void _handleScroll() {
    _setAddVisibility(false);
    _revealTimer?.cancel();
    _revealTimer = Timer(const Duration(milliseconds: 360), () {
      if (mounted) {
        _setAddVisibility(true);
      }
    });
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

  @override
  Widget build(BuildContext context) {
    final chapters = widget.chapters;

    return Stack(
      children: [
        RuledViewport(
          controller: _controller,
          lineHeight: _lineHeight,
          spineWidth: _spineWidth,
          child: ListView.builder(
            controller: _controller,
            padding: const EdgeInsets.only(bottom: 120),
            itemCount: chapters.length + 1,
            itemBuilder: (context, index) {
              if (index == 0) {
                return _NotebookHeader(
                  title: widget.bookTitle,
                  lineHeight: _lineHeight,
                  spineWidth: _spineWidth,
                );
              }
              final chapter = chapters[index - 1];
              final isActive = chapter.id == widget.activeId;
              return ChapterLineTile(
                index: index,
                title: chapter.title,
                color: _colorFor(chapter.id),
                active: isActive,
                lineHeight: _lineHeight,
                spineWidth: _spineWidth,
                onTap: () => widget.onOpen(chapter.id),
              );
            },
          ),
        ),
        Positioned(
          left: 0,
          top: 0,
          bottom: 0,
          width: _spineWidth,
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
                child: _GhostAddTab(lineHeight: _lineHeight),
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
              padding: const EdgeInsets.symmetric(horizontal: 16),
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
