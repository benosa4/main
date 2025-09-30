import 'dart:math' as math;
import 'dart:ui';

import 'package:flutter/material.dart';

import 'package:voicebook/core/models/chapter.dart';

import 'ruled_viewport.dart';
import 'spine_constants.dart';
import 'spine_palette.dart';

class ChapterReaderView extends StatefulWidget {
  const ChapterReaderView({
    super.key,
    required this.chapter,
    required this.onEdit,
  });

  final Chapter chapter;
  final VoidCallback onEdit;

  @override
  State<ChapterReaderView> createState() => _ChapterReaderViewState();
}

class _ChapterReaderViewState extends State<ChapterReaderView> {
  final ScrollController _controller = ScrollController();
  final GlobalKey _stackKey = GlobalKey();
  final GlobalKey _headerKey = GlobalKey();
  final GlobalKey _bodyKey = GlobalKey();
  final ValueNotifier<List<Rect>> _bands = ValueNotifier<List<Rect>>(<Rect>[]);
  bool _bandsDirty = false;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_scheduleBands);
    WidgetsBinding.instance.addPostFrameCallback((_) => _collectBands());
  }

  @override
  void dispose() {
    _controller.removeListener(_scheduleBands);
    _controller.dispose();
    _bands.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant ChapterReaderView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.chapter.id != widget.chapter.id || oldWidget.chapter.body != widget.chapter.body) {
      _scheduleBands();
    }
  }

  void _scheduleBands() {
    if (_bandsDirty) {
      return;
    }
    _bandsDirty = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) {
        return;
      }
      _bandsDirty = false;
      _collectBands();
    });
  }

  void _collectBands() {
    final RenderBox? stackBox = _stackKey.currentContext?.findRenderObject() as RenderBox?;
    if (stackBox == null) {
      return;
    }
    final double width = stackBox.size.width;
    final double left = kCollapsedSpineWidth;
    final double right = math.max(left, width - kRightMarginOffset);
    final double bandWidth = right - left;
    final List<Rect> result = <Rect>[];

    void addBand(GlobalKey key) {
      final RenderBox? box = key.currentContext?.findRenderObject() as RenderBox?;
      if (box == null) {
        return;
      }
      final Offset offset = box.localToGlobal(Offset.zero, ancestor: stackBox);
      final Size size = box.size;
      if (size.height <= 0) {
        return;
      }
      final double inset = math.min(12.0, size.height * 0.15);
      final Rect rect = Rect.fromLTRB(
        left,
        offset.dy + inset,
        left + bandWidth,
        offset.dy + size.height - inset,
      );
      if (rect.bottom > rect.top) {
        result.add(rect);
      }
    }

    addBand(_headerKey);
    addBand(_bodyKey);

    _bands.value = result;
  }

  @override
  Widget build(BuildContext context) {
    final chapter = widget.chapter;
    final Color accentColor = spineAccentFor(chapter.id);
    final TextTheme textTheme = Theme.of(context).textTheme;
    final EdgeInsets contentPadding = const EdgeInsets.symmetric(horizontal: 32, vertical: 24);
    final double horizontalInset = kCollapsedSpineWidth + 24;

    return Stack(
      key: _stackKey,
      children: [
        ValueListenableBuilder<List<Rect>>(
          valueListenable: _bands,
          builder: (context, bands, child) {
            return RuledViewport(
              controller: _controller,
              spineWidth: kCollapsedSpineWidth,
              accentColor: accentColor,
              textBands: bands,
              child: child!,
            );
          },
          child: ListView(
            controller: _controller,
            padding: EdgeInsets.only(bottom: 96),
            children: [
              Padding(
                key: _headerKey,
                padding: EdgeInsets.fromLTRB(horizontalInset, 40, contentPadding.right, 24),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Hero(
                            tag: 'chapter_title_${chapter.id}',
                            child: Material(
                              color: Colors.transparent,
                              child: Text(
                                chapter.title,
                                style: textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF0F172A),
                                ),
                              ),
                            ),
                          ),
                          if ((chapter.subtitle ?? '').isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Text(
                                chapter.subtitle!,
                                style: textTheme.titleMedium?.copyWith(color: const Color(0xFF475569)),
                              ),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 24),
                    FilledButton.tonal(
                      onPressed: widget.onEdit,
                      child: const Text('Редактировать'),
                    ),
                  ],
                ),
              ),
              Padding(
                key: _bodyKey,
                padding: EdgeInsets.fromLTRB(horizontalInset, 0, contentPadding.right, 40),
                child: _ChapterBody(chapter: chapter),
              ),
            ],
          ),
        ),
        Positioned(
          left: 0,
          top: 0,
          bottom: 0,
          width: kCollapsedSpineWidth,
          child: IgnorePointer(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    const Color(0xFF312E81).withOpacity(0.85),
                    const Color(0xFF5B21B6).withOpacity(0.85),
                  ],
                ),
                boxShadow: const [
                  BoxShadow(color: Color(0x33000000), blurRadius: 12, offset: Offset(0, 4)),
                ],
              ),
              child: const _SpineSlices(),
            ),
          ),
        ),
      ],
    );
  }
}

class _ChapterBody extends StatelessWidget {
  const _ChapterBody({required this.chapter});

  final Chapter chapter;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bodyText = chapter.body.trim();
    if (bodyText.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.82),
          borderRadius: BorderRadius.circular(18),
          boxShadow: const [
            BoxShadow(color: Color(0x140F172A), blurRadius: 18, offset: Offset(0, 6)),
          ],
        ),
        child: Text(
          'Пока нет текста. Нажмите «Редактировать», чтобы начать работу над главой.',
          style: theme.textTheme.bodyLarge?.copyWith(color: const Color(0xFF64748B)),
        ),
      );
    }

    final paragraphs = bodyText.split(RegExp(r'\n{2,}'));
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (int i = 0; i < paragraphs.length; i += 1)
          Padding(
            padding: EdgeInsets.only(bottom: i == paragraphs.length - 1 ? 0 : 18),
            child: Text(
              paragraphs[i].trim(),
              style: theme.textTheme.bodyLarge?.copyWith(
                height: 1.5,
                color: const Color(0xFF1E293B),
              ),
            ),
          ),
      ],
    );
  }
}

class _SpineSlices extends StatelessWidget {
  const _SpineSlices();

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        const double sliceHeight = kLineHeight;
        final int slices = (constraints.maxHeight / sliceHeight).ceil();
        return Column(
          children: [
            for (int i = 0; i < slices; i += 1)
              Expanded(
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 2, horizontal: 4),
                    width: 12,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(i.isEven ? 0.12 : 0.18),
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}
