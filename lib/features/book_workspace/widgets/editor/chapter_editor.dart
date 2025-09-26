import 'package:flutter/material.dart';
import 'package:flutter_quill/flutter_quill.dart' as quill;

import '../../../../core/models/models.dart';
import '../../../../shared/ui/glass_card.dart';

class ChapterEditor extends StatefulWidget {
  const ChapterEditor({super.key, required this.chapter});

  final Chapter? chapter;

  @override
  State<ChapterEditor> createState() => _ChapterEditorState();
}

class _ChapterEditorState extends State<ChapterEditor> {
  late final quill.QuillController _controller;

  @override
  void initState() {
    super.initState();
    _controller = quill.QuillController.basic();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final chapter = widget.chapter;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(chapter?.title ?? 'Без названия', style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 12),
        Expanded(
          child: GlassCard(
            child: quill.QuillEditor.basic(
              controller: _controller,
              config: const quill.QuillEditorConfig(
                scrollable: true,
                expands: true,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
