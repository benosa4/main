import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_quill/flutter_quill.dart' as quill;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:voicebook/core/models/models.dart';
import 'package:voicebook/core/providers/app_providers.dart';
import 'package:voicebook/core/providers/dictation_controller.dart';
import 'package:voicebook/shared/tokens/design_tokens.dart';
import 'package:voicebook/shared/ui/glass_card.dart';

class ChapterEditor extends ConsumerStatefulWidget {
  const ChapterEditor({super.key, required this.chapter});

  final Chapter chapter;

  @override
  ConsumerState<ChapterEditor> createState() => _ChapterEditorState();
}

class _ChapterEditorState extends ConsumerState<ChapterEditor> {
  late quill.QuillController _controller;
  late final ScrollController _scrollController;
  late final FocusNode _editorFocusNode;
  late final FocusNode _titleFocusNode;
  late final FocusNode _subtitleFocusNode;
  late final TextEditingController _titleController;
  late final TextEditingController _subtitleController;
  late final ProviderSubscription<DictationState> _dictationSubscription;
  Timer? _saveTimer;
  bool _saving = false;
  _AiActionState _aiActionState = _AiActionState.idle;
  String _aiStatusMessage = '';
  bool _dictationPanelCollapsed = false;
  bool _aiPanelExpanded = false;

  @override
  void initState() {
    super.initState();
    _initController();
    _scrollController = ScrollController();
    _editorFocusNode = FocusNode();
    _titleFocusNode = FocusNode();
    _subtitleFocusNode = FocusNode();
    _titleController = TextEditingController(text: widget.chapter.title);
    _subtitleController = TextEditingController(text: widget.chapter.subtitle ?? '');
    _dictationSubscription = ref.listenManual<DictationState>(
      dictationControllerProvider,
      (previous, next) {
        if (next.lastCommittedText != null && next.lastCommittedText!.trim().isNotEmpty) {
          _appendDictation(next.lastCommittedText!);
          ref.read(dictationControllerProvider.notifier).acknowledgeCommit();
        }
        final hadActivity =
            (previous?.isConnecting ?? false) || (previous?.isListening ?? false) || (previous?.phrases.isNotEmpty ?? false);
        final hasActivity = next.isConnecting || next.isListening || next.phrases.isNotEmpty;
        if (hasActivity && _dictationPanelCollapsed && mounted) {
          setState(() => _dictationPanelCollapsed = false);
        } else if (!hasActivity && hadActivity && mounted) {
          setState(() {});
        }
      },
    );
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
      _dictationPanelCollapsed = false;
      _aiPanelExpanded = false;
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_scheduleAutosave);
    _controller.dispose();
    _scrollController.dispose();
    _editorFocusNode.dispose();
    _titleFocusNode.dispose();
    _subtitleFocusNode.dispose();
    _titleController.dispose();
    _subtitleController.dispose();
    _saveTimer?.cancel();
    _dictationSubscription.close();
    super.dispose();
  }

  void _initController() {
    final document = quill.Document()..insert(0, widget.chapter.body.isEmpty ? '' : '${widget.chapter.body}\n');
    _controller = quill.QuillController(
      document: document,
      selection: const TextSelection.collapsed(offset: 0),
    );
    _controller.addListener(_scheduleAutosave);
  }

  void _scheduleAutosave() {
    _saveTimer?.cancel();
    setState(() => _saving = true);
    _saveTimer = Timer(const Duration(seconds: 2), () async {
      final body = _controller.document.toPlainText().trimRight();
      await ref.read(voicebookStoreProvider.notifier).updateChapterDraft(
            bookId: widget.chapter.bookId,
            chapterId: widget.chapter.id,
            title: _titleController.text.trim(),
            subtitle: _subtitleController.text.trim(),
            body: body,
          );
      if (mounted) {
        setState(() => _saving = false);
      }
    });
  }

  void _appendDictation(String text) {
    final trimmed = text.trim();
    if (trimmed.isEmpty) {
      return;
    }

    if (_titleFocusNode.hasFocus) {
      _insertIntoTextController(_titleController, trimmed, allowSentenceTermination: false);
      return;
    }

    if (_subtitleFocusNode.hasFocus) {
      _insertIntoTextController(_subtitleController, trimmed, allowSentenceTermination: false);
      return;
    }

    final sanitized = trimmed.replaceAll('\n', ' ').trim();
    if (sanitized.isEmpty) {
      return;
    }

    final shouldTerminate =
        !sanitized.endsWith('.') && !sanitized.endsWith('!') && !sanitized.endsWith('?');
    final textToInsert = shouldTerminate ? '$sanitized.' : sanitized;
    final docLength = _controller.document.length;
    final selection = _controller.selection;
    var selectionStart = selection.start;
    var selectionEnd = selection.end;

    if (selectionStart < 0 || selectionEnd < 0) {
      selectionStart = math.max(0, docLength - 1);
      selectionEnd = selectionStart;
    }

    final safeStart = math.max(0, math.min(selectionStart, docLength));
    final isAtEnd = docLength <= 1 || safeStart >= docLength - 1;
    final insertionText = isAtEnd ? '$textToInsert\n\n' : '$textToInsert ';
    final baseIndex = docLength == 0 ? 0 : math.max(0, math.min(selectionStart, docLength - 1));
    final selectionLength = math.max(0, selectionEnd - selectionStart);

    _controller.replaceText(
      baseIndex,
      selectionLength,
      insertionText,
      TextSelection.collapsed(offset: baseIndex + insertionText.length),
    );
    _scheduleAutosave();
  }

  void _insertIntoTextController(
    TextEditingController controller,
    String text, {
    required bool allowSentenceTermination,
  }) {
    final sanitized = text.replaceAll('\n', ' ').trim();
    if (sanitized.isEmpty) {
      return;
    }
    final needsPeriod = allowSentenceTermination &&
        !sanitized.endsWith('.') &&
        !sanitized.endsWith('!') &&
        !sanitized.endsWith('?');
    final insertion = needsPeriod ? '$sanitized.' : sanitized;
    final selection = controller.selection;
    final currentText = controller.text;
    final start = selection.start >= 0 ? selection.start : currentText.length;
    final end = selection.end >= 0 ? selection.end : currentText.length;
    final updated = currentText.replaceRange(start, end, insertion);
    controller.value = controller.value.copyWith(
      text: updated,
      selection: TextSelection.collapsed(offset: start + insertion.length),
    );
    _scheduleAutosave();
  }

  void _runAiAction(String action) {
    if (_aiActionState == _AiActionState.processing) {
      return;
    }
    final prompts = {
      'expand': 'AI расширяет абзац...',
      'rephrase': 'AI ищет новую формулировку...',
      'simplify': 'AI упрощает выбранный текст...',
    };
    final completions = {
      'expand': 'Добавлено художественное описание сцены.',
      'rephrase': 'Предложена альтернативная формулировка.',
      'simplify': 'Текст стал короче и яснее.',
    };
    setState(() {
      _aiActionState = _AiActionState.processing;
      _aiStatusMessage = prompts[action] ?? 'AI работает...';
    });
    Future.delayed(const Duration(milliseconds: 2200), () {
      if (!mounted) {
        return;
      }
      final insertion = switch (action) {
        'expand' => 'Туман вспыхнул мягким светом, и голоса словно выстроились в хореографию.',
        'rephrase' => 'Мы услышали более уверенную версию записи, где эмоции читаются сразу.',
        'simplify' => 'Туман загудел, и станции стало легче дышать.',
        _ => 'AI подсказал новый вариант фразы.',
      };
      _controller.document.insert(_controller.document.length - 1, '$insertion\n\n');
      _scheduleAutosave();
      setState(() {
        _aiActionState = _AiActionState.completed;
        _aiStatusMessage = completions[action] ?? 'AI внёс правку.';
      });
      Future.delayed(const Duration(milliseconds: 1400), () {
        if (!mounted) {
          return;
        }
        setState(() {
          _aiActionState = _AiActionState.idle;
          _aiStatusMessage = '';
        });
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dictationState = ref.watch(dictationControllerProvider);
    final hasDictationActivity =
        dictationState.isConnecting || dictationState.isListening || dictationState.phrases.isNotEmpty;
    final showDictationPanel = hasDictationActivity && !_dictationPanelCollapsed;
    final editorTextStyle = (theme.textTheme.bodyMedium ?? const TextStyle()).copyWith(
      color: (theme.textTheme.bodyMedium?.color ?? theme.colorScheme.onSurface),
    );

    return LayoutBuilder(
      builder: (context, constraints) {
        final isCompact = constraints.maxWidth < 860;
        final spineWidth = math.max(260.0, math.min(340.0, constraints.maxWidth * 0.32));

        Widget buildSpinePanel({required bool fillHeight, required double width}) {
          final scrollableContent = SingleChildScrollView(
            padding: const EdgeInsets.only(right: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: _titleController,
                  focusNode: _titleFocusNode,
                  style: theme.textTheme.headlineMedium,
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    hintText: 'Заголовок главы',
                  ),
                  onChanged: (_) => _scheduleAutosave(),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _subtitleController,
                  focusNode: _subtitleFocusNode,
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    hintText: 'Подзаголовок',
                  ),
                  onChanged: (_) => _scheduleAutosave(),
                ),
                const SizedBox(height: 24),
                Text(
                  'Параметры',
                  style: theme.textTheme.titleSmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _MetaChip(label: 'Жанр: ${widget.chapter.meta['genre'] ?? '—'}'),
                    _MetaChip(label: 'ЦА: ${widget.chapter.meta['audience'] ?? '—'}'),
                    _StatusBadge(status: widget.chapter.status),
                  ],
                ),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  onPressed: () {
                    GoRouter.of(context).pushNamed(
                      'mindmap',
                      pathParameters: {'bookId': widget.chapter.bookId},
                      queryParameters: {'chapterId': widget.chapter.id},
                    );
                  },
                  icon: const Icon(Icons.account_tree_outlined),
                  label: const Text('Структура'),
                ),
              ],
            ),
          );

          final spineCardChild = fillHeight
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: scrollableContent),
                    const SizedBox(height: 12),
                    const Divider(height: 1),
                    const SizedBox(height: 12),
                    _SaveIndicator(isSaving: _saving || dictationState.isListening),
                    const SizedBox(height: 12),
                    _WordCountChip(count: widget.chapter.meta['wordCount'] ?? '—'),
                  ],
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    scrollableContent,
                    const SizedBox(height: 12),
                    const Divider(height: 1),
                    const SizedBox(height: 12),
                    _SaveIndicator(isSaving: _saving || dictationState.isListening),
                    const SizedBox(height: 12),
                    _WordCountChip(count: widget.chapter.meta['wordCount'] ?? '—'),
                  ],
                );

          final card = GlassCard(child: spineCardChild);

          if (fillHeight) {
            return SizedBox(
              width: width,
              child: SizedBox.expand(child: card),
            );
          }

          if (width.isFinite) {
            return SizedBox(width: width, child: card);
          }

          return card;
        }

        Widget buildEditorStack() {
          return Stack(
            children: [
              GlassCard(
                padding: EdgeInsets.zero,
                child: Column(
                  children: [
                    _EditorToolbar(controller: _controller),
                    const Divider(height: 1),
                    Expanded(
                      child: DefaultTextStyle.merge(
                        style: editorTextStyle,
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
                    ),
                  ],
                ),
              ),
              Positioned(
                top: 24,
                right: 24,
                child: _AiHintDrawer(
                  expanded: _aiPanelExpanded,
                  onToggle: () {
                    setState(() => _aiPanelExpanded = !_aiPanelExpanded);
                  },
                  onAction: (action) {
                    if (action == 'expand' || action == 'rephrase' || action == 'simplify') {
                      _runAiAction(action);
                    } else {
                      GoRouter.of(context).pushNamed('aiComposer');
                    }
                  },
                ),
              ),
              if (hasDictationActivity)
                Align(
                  alignment: Alignment.bottomCenter,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                    child: IgnorePointer(
                      ignoring: !showDictationPanel,
                      child: AnimatedSlide(
                        duration: const Duration(milliseconds: 260),
                        curve: Curves.easeOutCubic,
                        offset: showDictationPanel ? Offset.zero : const Offset(0, 0.12),
                        child: AnimatedOpacity(
                          duration: const Duration(milliseconds: 260),
                          opacity: showDictationPanel ? 1 : 0,
                          child: _DictationStreamView(
                            state: dictationState,
                            onDismiss: () {
                              setState(() => _dictationPanelCollapsed = true);
                            },
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              if (!showDictationPanel && hasDictationActivity)
                Positioned(
                  bottom: 24,
                  right: 24,
                  child: _DictationPanelHandle(
                    onPressed: () {
                      setState(() => _dictationPanelCollapsed = false);
                    },
                  ),
                ),
              if (_aiActionState != _AiActionState.idle)
                Positioned.fill(
                  child: IgnorePointer(
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: const BorderRadius.vertical(
                          bottom: Radius.circular(AppSpacing.radiusMedium),
                        ),
                        color: theme.colorScheme.surfaceTint.withOpacity(0.08),
                      ),
                      child: Center(
                        child: AnimatedSwitcher(
                          duration: const Duration(milliseconds: 260),
                          child: _aiActionState == _AiActionState.processing
                              ? Column(
                                  key: const ValueKey('processing'),
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const CircularProgressIndicator(),
                                    const SizedBox(height: 12),
                                    Text(_aiStatusMessage, style: theme.textTheme.bodyLarge),
                                  ],
                                )
                              : Column(
                                  key: const ValueKey('completed'),
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.auto_awesome, color: Colors.greenAccent, size: 36),
                                    const SizedBox(height: 8),
                                    Text(_aiStatusMessage, style: theme.textTheme.bodyLarge),
                                  ],
                                ),
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          );
        }

        final editorPanel = Expanded(child: buildEditorStack());

        if (isCompact) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              buildSpinePanel(fillHeight: false, width: double.infinity),
              const SizedBox(height: 20),
              editorPanel,
            ],
          );
        }

        return Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            buildSpinePanel(fillHeight: true, width: spineWidth),
            const SizedBox(width: 20),
            editorPanel,
          ],
        );
      },
    );
  }
}

class _EditorToolbar extends StatelessWidget {
  const _EditorToolbar({required this.controller});

  final quill.QuillController controller;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface.withOpacity(0.7),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(AppSpacing.radiusMedium)),
          ),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _ToolbarButton(
                  icon: Icons.undo,
                  label: 'Назад',
                  onPressed: controller.undo,
                ),
                _ToolbarButton(
                  icon: Icons.redo,
                  label: 'Вперёд',
                  onPressed: controller.redo,
                ),
                const SizedBox(width: 12),
                _ToolbarToggleButton(
                  icon: Icons.format_bold,
                  label: 'Жирный',
                  attribute: quill.Attribute.bold,
                  controller: controller,
                ),
                _ToolbarToggleButton(
                  icon: Icons.format_italic,
                  label: 'Курсив',
                  attribute: quill.Attribute.italic,
                  controller: controller,
                ),
                _ToolbarToggleButton(
                  icon: Icons.title,
                  label: 'H1',
                  attribute: quill.Attribute.h1,
                  controller: controller,
                ),
                _ToolbarToggleButton(
                  icon: Icons.subtitles_outlined,
                  label: 'H2',
                  attribute: quill.Attribute.h2,
                  controller: controller,
                ),
                _ToolbarToggleButton(
                  icon: Icons.format_list_bulleted,
                  label: 'Список',
                  attribute: quill.Attribute.ul,
                  controller: controller,
                ),
                _ToolbarToggleButton(
                  icon: Icons.format_quote,
                  label: 'Цитата',
                  attribute: quill.Attribute.blockQuote,
                  controller: controller,
                ),
                _ToolbarToggleButton(
                  icon: Icons.code,
                  label: 'Код',
                  attribute: quill.Attribute.codeBlock,
                  controller: controller,
                ),
              ]
                  .map((widget) => Padding(padding: const EdgeInsets.symmetric(horizontal: 4), child: widget))
                  .toList(),
            ),
          ),
        );
      },
    );
  }
}

class _ToolbarButton extends StatelessWidget {
  const _ToolbarButton({required this.icon, required this.label, required this.onPressed});

  final IconData icon;
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return FilledButton.tonalIcon(
      onPressed: onPressed,
      icon: Icon(icon, size: 18),
      label: Text(label),
    );
  }
}

class _ToolbarToggleButton extends StatelessWidget {
  const _ToolbarToggleButton({
    required this.icon,
    required this.label,
    required this.attribute,
    required this.controller,
  });

  final IconData icon;
  final String label;
  final quill.Attribute attribute;
  final quill.QuillController controller;

  void _toggle() {
    final style = controller.getSelectionStyle();
    final existing = style.attributes[attribute.key];
    final shouldRemove = existing != null && existing.value == attribute.value;
    if (shouldRemove) {
      controller.formatSelection(quill.Attribute(attribute.key, attribute.scope, null));
    } else {
      controller.formatSelection(attribute);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isActive = controller.getSelectionStyle().attributes[attribute.key]?.value == attribute.value;

    return FilledButton.tonalIcon(
      onPressed: _toggle,
      style: isActive
          ? FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.24),
            )
          : null,
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
  const _AiHintCard({required this.onAction, required this.onClose});

  final ValueChanged<String> onAction;
  final VoidCallback onClose;

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
              Expanded(child: Text('AI подсказки', style: theme.textTheme.titleMedium)),
              IconButton(
                tooltip: 'Свернуть',
                onPressed: onClose,
                icon: const Icon(Icons.close),
                style: IconButton.styleFrom(
                  foregroundColor: theme.colorScheme.primary,
                  visualDensity: VisualDensity.compact,
                ),
              ),
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

class _AiHintDrawer extends StatelessWidget {
  const _AiHintDrawer({
    required this.expanded,
    required this.onToggle,
    required this.onAction,
  });

  final bool expanded;
  final VoidCallback onToggle;
  final ValueChanged<String> onAction;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 260),
          transitionBuilder: (child, animation) {
            final slideAnimation = Tween<Offset>(begin: const Offset(0.2, 0), end: Offset.zero)
                .chain(CurveTween(curve: Curves.easeOutCubic))
                .animate(animation);
            return FadeTransition(
              opacity: animation,
              child: SlideTransition(position: slideAnimation, child: child),
            );
          },
          child: expanded
              ? Padding(
                  key: const ValueKey('ai-expanded'),
                  padding: const EdgeInsets.only(right: 12),
                  child: _AiHintCard(
                    onAction: onAction,
                    onClose: onToggle,
                  ),
                )
              : const SizedBox(key: ValueKey('ai-collapsed')),
        ),
        FloatingActionButton.small(
          heroTag: null,
          tooltip: expanded ? 'Скрыть подсказки' : 'Показать подсказки',
          onPressed: onToggle,
          child: Icon(expanded ? Icons.close : Icons.auto_awesome),
        ),
      ],
    );
  }
}

class _DictationStreamView extends StatelessWidget {
  const _DictationStreamView({required this.state, required this.onDismiss});

  final DictationState state;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isVisible = state.isConnecting || state.isListening || state.phrases.isNotEmpty;
    if (!isVisible) {
      return const SizedBox.shrink();
    }
    final background = theme.colorScheme.surface.withOpacity(0.85);
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        color: background,
        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 18, offset: Offset(0, 8))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Icon(state.isListening ? Icons.mic : Icons.graphic_eq,
                  color: theme.colorScheme.primary),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  state.isConnecting
                      ? 'Подключаемся к надиктовке...'
                      : state.isListening
                          ? 'Идёт надиктовка'
                          : 'Последние результаты',
                  style: theme.textTheme.titleSmall,
                ),
              ),
              if (state.isListening)
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              const SizedBox(width: 8),
              IconButton(
                tooltip: 'Скрыть панель',
                onPressed: onDismiss,
                icon: const Icon(Icons.expand_more),
                style: IconButton.styleFrom(
                  foregroundColor: theme.colorScheme.primary,
                  visualDensity: VisualDensity.compact,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (state.phrases.isEmpty)
            Text(
              'Результаты появятся после первых фраз.',
              style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
            )
          else
            ...state.phrases.take(3).map(
              (phrase) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      switch (phrase.status) {
                        DictationPhraseStatus.streaming => Icons.circle,
                        DictationPhraseStatus.committing => Icons.sync,
                        DictationPhraseStatus.committed => Icons.check_circle,
                      },
                      size: 16,
                      color: switch (phrase.status) {
                        DictationPhraseStatus.streaming => theme.colorScheme.primary,
                        DictationPhraseStatus.committing => AppColors.accent,
                        DictationPhraseStatus.committed => Colors.greenAccent,
                      },
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: AnimatedDefaultTextStyle(
                        duration: const Duration(milliseconds: 200),
                        style: theme.textTheme.bodyMedium!.copyWith(
                          fontStyle: phrase.status == DictationPhraseStatus.streaming ? FontStyle.italic : null,
                        ),
                        child: Text(phrase.text),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _DictationPanelHandle extends StatelessWidget {
  const _DictationPanelHandle({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return FilledButton.tonalIcon(
      onPressed: onPressed,
      icon: const Icon(Icons.graphic_eq),
      label: const Text('Последние результаты'),
    );
  }
}

enum _AiActionState { idle, processing, completed }
