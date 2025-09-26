import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_quill/flutter_quill.dart' as quill;

import '../../../../core/models/models.dart';
import '../../../../shared/tokens/design_tokens.dart';
import '../../../../shared/ui/glass_card.dart';

class ChapterEditor extends StatefulWidget {
  const ChapterEditor({super.key, required this.chapter});

  final Chapter chapter;

  @override
  State<ChapterEditor> createState() => _ChapterEditorState();
}

class _ChapterEditorState extends State<ChapterEditor> {
  late quill.QuillController _controller;
  late final ScrollController _scrollController;
  late final FocusNode _editorFocusNode;
  late TextEditingController _titleController;
  late TextEditingController _subtitleController;
  Timer? _saveTimer;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _initController();
    _scrollController = ScrollController();
    _editorFocusNode = FocusNode();
    _titleController = TextEditingController(text: widget.chapter.title);
    _subtitleController = TextEditingController(text: widget.chapter.subtitle ?? '');
  }

  @override
  void didUpdateWidget(covariant ChapterEditor oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.chapter.id != widget.chapter.id) {
      _controller.removeListener(_scheduleAutosave);
      _controller.dispose();
      _initController();
      _titleController.text = widget.chapter.title;
      _subtitleController.text = widget.chapter.subtitle ?? '';
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    _editorFocusNode.dispose();
    _titleController.dispose();
    _subtitleController.dispose();
    _saveTimer?.cancel();
    super.dispose();
  }

  void _initController() {
    _controller = quill.QuillController.basic();
    _controller.addListener(_scheduleAutosave);
  }

  void _scheduleAutosave() {
    _saveTimer?.cancel();
    setState(() => _saving = true);
    _saveTimer = Timer(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _saving = false);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TextField(
                          controller: _titleController,
                          style: theme.textTheme.headlineMedium,
                          decoration: const InputDecoration(
                            border: InputBorder.none,
                            hintText: 'Заголовок главы',
                          ),
                          onChanged: (_) => _scheduleAutosave(),
                        ),
                        TextField(
                          controller: _subtitleController,
                          style: theme.textTheme.titleMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                          decoration: const InputDecoration(
                            border: InputBorder.none,
                            hintText: 'Подзаголовок',
                          ),
                          onChanged: (_) => _scheduleAutosave(),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      _SaveIndicator(isSaving: _saving),
                      const SizedBox(height: 12),
                      _WordCountChip(count: widget.chapter.meta['wordCount'] ?? '—'),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _MetaChip(label: 'Жанр: ${widget.chapter.meta['genre'] ?? '—'}'),
                  _MetaChip(label: 'ЦА: ${widget.chapter.meta['audience'] ?? '—'}'),
                  _StatusBadge(status: widget.chapter.status),
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.account_tree_outlined),
                    label: const Text('Структура'),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Expanded(
          child: Stack(
            children: [
              GlassCard(
                padding: EdgeInsets.zero,
                child: Column(
                  children: [
                    _EditorToolbar(onCommand: (command) {}),
                    const Divider(height: 1),
                    Expanded(
                      child: quill.QuillEditor.basic(
                        controller: _controller,
                        focusNode: _editorFocusNode,
                        scrollController: _scrollController,
                        config: const quill.QuillEditorConfig(
                          expands: true,
                          placeholder: 'Начните диктовать или печатать...',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Positioned(
                top: 24,
                right: 24,
                child: _AiHintCard(onAction: (action) {}),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _EditorToolbar extends StatelessWidget {
  const _EditorToolbar({required this.onCommand});

  final ValueChanged<String> onCommand;

  @override
  Widget build(BuildContext context) {
    final buttons = [
      _ToolbarButton(icon: Icons.undo, label: 'Назад'),
      _ToolbarButton(icon: Icons.redo, label: 'Вперёд'),
      const SizedBox(width: 12),
      _ToolbarButton(icon: Icons.format_bold, label: 'Жирный'),
      _ToolbarButton(icon: Icons.format_italic, label: 'Курсив'),
      _ToolbarButton(icon: Icons.title, label: 'H1'),
      _ToolbarButton(icon: Icons.subtitles_outlined, label: 'H2'),
      _ToolbarButton(icon: Icons.format_list_bulleted, label: 'Список'),
      _ToolbarButton(icon: Icons.format_quote, label: 'Цитата'),
      _ToolbarButton(icon: Icons.code, label: 'Код'),
    ];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface.withOpacity(0.7),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppSpacing.radiusMedium)),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(children: buttons.map((b) => Padding(padding: const EdgeInsets.symmetric(horizontal: 4), child: b)).toList()),
      ),
    );
  }
}

class _ToolbarButton extends StatelessWidget {
  const _ToolbarButton({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return FilledButton.tonalIcon(
      onPressed: () {},
      icon: Icon(icon, size: 18),
      label: Text(label),
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(label),
      backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.08),
      labelStyle: Theme.of(context).textTheme.bodyMedium,
      side: BorderSide(color: Theme.of(context).colorScheme.primary.withOpacity(0.2)),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final ChapterStatus status;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final map = {
      ChapterStatus.draft: ('Черновик', colorScheme.primary),
      ChapterStatus.edit: ('Редактура', AppColors.accent),
      ChapterStatus.final_: ('Финал', Colors.greenAccent.shade400),
    };
    final data = map[status]!;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: data.$2.withOpacity(0.16),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: data.$2.withOpacity(0.4)),
      ),
      child: Text(data.$1, style: Theme.of(context).textTheme.labelMedium?.copyWith(color: data.$2)),
    );
  }
}

class _SaveIndicator extends StatelessWidget {
  const _SaveIndicator({required this.isSaving});

  final bool isSaving;

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 250),
      child: isSaving
          ? Row(
              key: const ValueKey('saving'),
              children: const [
                SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                SizedBox(width: 8),
                Text('Сохраняем...'),
              ],
            )
          : Row(
              key: const ValueKey('saved'),
              children: const [
                Icon(Icons.check_circle, color: Colors.greenAccent, size: 18),
                SizedBox(width: 8),
                Text('Сохранено'),
              ],
            ),
    );
  }
}

class _WordCountChip extends StatelessWidget {
  const _WordCountChip({required this.count});

  final String count;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: Theme.of(context).colorScheme.primary.withOpacity(0.12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.speed, size: 16),
          const SizedBox(width: 6),
          Text('$count слов'),
        ],
      ),
    );
  }
}

class _AiHintCard extends StatelessWidget {
  const _AiHintCard({required this.onAction});

  final ValueChanged<String> onAction;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Icon(Icons.auto_awesome, color: theme.colorScheme.primary),
              const SizedBox(width: 8),
              Text('AI подсказки', style: theme.textTheme.titleMedium),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: [
              ActionChip(label: const Text('Расширить'), onPressed: () => onAction('expand')),
              ActionChip(label: const Text('Перефразировать'), onPressed: () => onAction('rephrase')),
              ActionChip(label: const Text('Упростить'), onPressed: () => onAction('simplify')),
            ],
          ),
        ],
      ),
    );
  }
}
