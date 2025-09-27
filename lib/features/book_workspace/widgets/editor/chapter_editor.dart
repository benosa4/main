import 'dart:async';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_quill/flutter_quill.dart' as quill;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:voicebook/core/models/models.dart';
import 'package:voicebook/core/providers/app_providers.dart';
import 'package:voicebook/core/providers/dictation_controller.dart';
import 'package:voicebook/features/book_workspace/widgets/chapter_header_card/chapter_header_card.dart';
import 'package:voicebook/features/book_workspace/widgets/editor/editor_toolbar.dart';
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
      color: theme.textTheme.bodyMedium?.color ?? theme.colorScheme.onSurface,
      height: 1.6,
      fontSize: 16,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ChapterHeaderCard(
          titleController: _titleController,
          subtitleController: _subtitleController,
          titleFocusNode: _titleFocusNode,
          subtitleFocusNode: _subtitleFocusNode,
          metaChips: [
            _MetaChip(label: 'Жанр: ${widget.chapter.meta['genre'] ?? '—'}'),
            _MetaChip(label: 'ЦА: ${widget.chapter.meta['audience'] ?? '—'}'),
            _StatusBadge(status: widget.chapter.status),
          ],
          onOpenStructure: () {
            GoRouter.of(context).pushNamed(
              'mindmap',
              pathParameters: {'bookId': widget.chapter.bookId},
              queryParameters: {'chapterId': widget.chapter.id},
            );
          },
          saved: !_saving && !dictationState.isListening,
          wordCount: _resolveWordCount(),
          onTitleChanged: (_) => _scheduleAutosave(),
          onSubtitleChanged: (_) => _scheduleAutosave(),
        ),
        const SizedBox(height: 16),
        Expanded(
          child: _buildEditorSurface(
            context: context,
            editorTextStyle: editorTextStyle,
            dictationState: dictationState,
            hasDictationActivity: hasDictationActivity,
            showDictationPanel: showDictationPanel,
          ),
        ),
      ],
    );
  }

  int? _resolveWordCount() {
    final value = widget.chapter.meta['wordCount'];
    if (value is num) {
      return value.toInt();
    }
    if (value is String) {
      return int.tryParse(value);
    }
    return null;
  }

  Widget _buildEditorSurface({
    required BuildContext context,
    required TextStyle editorTextStyle,
    required DictationState dictationState,
    required bool hasDictationActivity,
    required bool showDictationPanel,
  }) {
    final theme = Theme.of(context);

    final editorCard = ClipRRect(
      borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.68),
            borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
            border: Border.all(color: AppColors.border.withOpacity(0.18)),
            boxShadow: const [
              BoxShadow(color: Colors.black12, blurRadius: 12, offset: Offset(0, 6)),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: EditorToolbar(
                    onCommand: (command) => _handleToolbarCommand(context, command),
                  ),
                ),
              ),
              const Divider(height: 1),
              Expanded(
                child: DefaultTextStyle.merge(
                  style: editorTextStyle,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
                    child: Align(
                      alignment: Alignment.topCenter,
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 760),
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
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );

    return Stack(
      children: [
        editorCard,
        Positioned(
          top: 20,
          right: 20,
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
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
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

  void _handleToolbarCommand(BuildContext context, EditorCommand command) {
    switch (command) {
      case EditorCommand.undo:
        _controller.undo();
        break;
      case EditorCommand.redo:
        _controller.redo();
        break;
      case EditorCommand.heading1:
        _toggleHeading(1);
        break;
      case EditorCommand.heading2:
        _toggleHeading(2);
        break;
      case EditorCommand.bold:
        _toggleAttribute(quill.Attribute.bold);
        break;
      case EditorCommand.italic:
        _toggleAttribute(quill.Attribute.italic);
        break;
      case EditorCommand.bulletList:
        _toggleList(quill.Attribute.ul);
        break;
      case EditorCommand.more:
        _showMoreFormattingMenu(context);
        break;
    }
    _scheduleAutosave();
  }

  void _toggleAttribute(quill.Attribute attribute) {
    final style = _controller.getSelectionStyle();
    final isApplied = style.attributes.containsKey(attribute.key);
    final target = isApplied ? quill.Attribute.clone(attribute, null) : attribute;
    _controller.formatSelection(target);
  }

  void _toggleHeading(int level) {
    final heading = _controller.getSelectionStyle().attributes[quill.Attribute.heading.key];
    final target = level == 1 ? quill.Attribute.h1 : quill.Attribute.h2;
    final shouldUnset = heading?.value == level;
    _controller.formatSelection(shouldUnset ? quill.Attribute.clone(quill.Attribute.heading, null) : target);
  }

  void _toggleList(quill.Attribute attribute) {
    final style = _controller.getSelectionStyle();
    final isActive = style.attributes.containsKey(attribute.key);
    _controller.formatSelection(isActive ? quill.Attribute.clone(attribute, null) : attribute);
  }

  Future<void> _showMoreFormattingMenu(BuildContext context) async {
    final action = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: Colors.white.withOpacity(0.9),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.format_list_numbered),
                title: const Text('Нумерованный список'),
                onTap: () => Navigator.of(context).pop('ordered'),
              ),
              ListTile(
                leading: const Icon(Icons.format_quote),
                title: const Text('Цитата'),
                onTap: () => Navigator.of(context).pop('quote'),
              ),
              ListTile(
                leading: const Icon(Icons.code),
                title: const Text('Код'),
                onTap: () => Navigator.of(context).pop('code'),
              ),
            ],
          ),
        );
      },
    );

    switch (action) {
      case 'ordered':
        _toggleList(quill.Attribute.ol);
        break;
      case 'quote':
        _toggleAttribute(quill.Attribute.blockQuote);
        break;
      case 'code':
        _toggleAttribute(quill.Attribute.codeBlock);
        break;
    }
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
