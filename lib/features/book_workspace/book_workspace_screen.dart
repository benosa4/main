import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:voicebook/core/models/models.dart';
import 'package:voicebook/core/providers/app_providers.dart';
import 'package:voicebook/core/providers/dictation_controller.dart';
import 'package:voicebook/core/storage/ui_state_storage.dart';
import 'package:voicebook/shared/tokens/design_tokens.dart';
import 'widgets/editor/chapter_editor.dart';
import 'widgets/fab_panel/fab_action_cluster.dart';
import 'widgets/editor_gate.dart';
import 'widgets/top_taskbar.dart';
import 'spine_notebook/chapter_reader_view.dart';
import 'spine_notebook/spine_notebook_view.dart';

class BookWorkspaceScreen extends ConsumerStatefulWidget {
  const BookWorkspaceScreen({super.key, required this.bookId});

  final String bookId;

  @override
  ConsumerState<BookWorkspaceScreen> createState() => _BookWorkspaceScreenState();
}

enum _WorkspaceMode { list, reading, edit }

class _BookWorkspaceScreenState extends ConsumerState<BookWorkspaceScreen> {
  UiStateStorage? _uiStateStorage;
  bool _restoredChapter = false;
  Timer? _recordingTicker;
  Duration? _recordingElapsed;
  DateTime? _recordingStartedAt;
  final EditorGateController _editorGateController = EditorGateController();
  _WorkspaceMode _workspaceMode = _WorkspaceMode.list;
  String? _pendingModeRaw;
  String? _deferredModeToPersist;

  void _setWorkspaceMode(_WorkspaceMode mode, {String? chapterId}) {
    if (_workspaceMode != mode) {
      setState(() => _workspaceMode = mode);
    }
    _persistWorkspaceMode(mode, chapterId: chapterId);
  }

  void _persistWorkspaceMode(_WorkspaceMode mode, {String? chapterId}) {
    final storage = _uiStateStorage;
    final bookId = widget.bookId;
    final targetId = chapterId ?? ref.read(currentChapterProvider(bookId))?.id;
    String raw;
    switch (mode) {
      case _WorkspaceMode.list:
        raw = 'list';
        break;
      case _WorkspaceMode.reading:
        raw = targetId != null ? 'reading::$targetId' : 'list';
        break;
      case _WorkspaceMode.edit:
        raw = targetId != null ? 'edit::$targetId' : 'list';
        break;
    }
    if (storage == null) {
      _deferredModeToPersist = raw;
      return;
    }
    storage.writeWorkspaceMode(bookId, raw);
  }

  void _handleEditorOpened(String bookId, String chapterId) {
    _uiStateStorage?.writeEditorGateOpened(bookId, chapterId, true);
  }

  void _processPendingWorkspaceMode(List<ChapterSummary> chapters, Chapter? currentChapter) {
    final raw = _pendingModeRaw;
    if (raw == null) {
      return;
    }
    _pendingModeRaw = null;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) {
        return;
      }
      if (raw.startsWith('edit::')) {
        final targetId = raw.split('edit::').last;
        final exists = chapters.any((chapter) => chapter.id == targetId);
        if (exists) {
          if (currentChapter == null || currentChapter.id != targetId) {
            _updateActiveChapter(widget.bookId, targetId);
          }
          if (_workspaceMode != _WorkspaceMode.edit) {
            setState(() => _workspaceMode = _WorkspaceMode.edit);
          }
        } else {
          if (_workspaceMode != _WorkspaceMode.list) {
            setState(() => _workspaceMode = _WorkspaceMode.list);
          }
        }
      } else if (raw.startsWith('reading::')) {
        final targetId = raw.split('reading::').last;
        final exists = chapters.any((chapter) => chapter.id == targetId);
        if (exists) {
          if (currentChapter == null || currentChapter.id != targetId) {
            _updateActiveChapter(widget.bookId, targetId);
          }
          if (_workspaceMode != _WorkspaceMode.reading) {
            setState(() => _workspaceMode = _WorkspaceMode.reading);
          }
        } else {
          if (_workspaceMode != _WorkspaceMode.list) {
            setState(() => _workspaceMode = _WorkspaceMode.list);
          }
        }
      } else if (raw == 'list' || raw == 'overview') {
        if (_workspaceMode != _WorkspaceMode.list) {
          setState(() => _workspaceMode = _WorkspaceMode.list);
        }
      }
    });
  }

  void _openChapterFromList(String chapterId) {
    final bookId = widget.bookId;
    _updateActiveChapter(bookId, chapterId);
    _setWorkspaceMode(_WorkspaceMode.reading, chapterId: chapterId);
  }

  void _returnToList() {
    _editorGateController.close();
    _setWorkspaceMode(_WorkspaceMode.list);
  }

  Future<void> _handleCreateChapter(BuildContext context) async {
    final bookId = widget.bookId;
    final notifier = ref.read(voicebookStoreProvider.notifier);
    try {
      final chapter = await notifier.createChapter(bookId);
      if (!mounted) {
        return;
      }
      _updateActiveChapter(bookId, chapter.id);
      _setWorkspaceMode(_WorkspaceMode.edit, chapterId: chapter.id);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Глава «${chapter.title}» добавлена.')),
      );
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Не удалось добавить главу. Попробуйте ещё раз.')),
      );
    }
  }

  Widget _buildEditorGatePlaceholder({
    required BuildContext context,
    required Chapter chapter,
    required VoidCallback onStartDictation,
    required VoidCallback onShowEditor,
  }) {
    final theme = Theme.of(context);
    return Center(
      child: Container(
        margin: const EdgeInsets.all(AppSpacing.outer),
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 36),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          color: Colors.white.withOpacity(0.82),
          boxShadow: const [
            BoxShadow(color: Color(0x1A0F172A), blurRadius: 24, offset: Offset(0, 12)),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Готовы к работе?',
              style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            Text(
              'Нажмите «Начать диктовку», чтобы озвучить главу «${chapter.title}», или откройте редактор.',
              style: theme.textTheme.bodyMedium?.copyWith(color: const Color(0xFF475569)),
            ),
            const SizedBox(height: 24),
            Wrap(
              spacing: 16,
              runSpacing: 12,
              children: [
                ElevatedButton.icon(
                  onPressed: onStartDictation,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  ),
                  icon: const Icon(Icons.mic),
                  label: const Text('Начать диктовку'),
                ),
                OutlinedButton.icon(
                  onPressed: onShowEditor,
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  ),
                  icon: const Icon(Icons.edit_outlined),
                  label: const Text('Показать редактор'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    UiStateStorage.open().then((storage) {
      if (!mounted) {
        return;
      }
      final restoredMode = storage.readWorkspaceMode(widget.bookId);
      setState(() {
        _uiStateStorage = storage;
        _pendingModeRaw ??= restoredMode;
      });
      final deferred = _deferredModeToPersist;
      if (deferred != null) {
        storage.writeWorkspaceMode(widget.bookId, deferred);
        _deferredModeToPersist = null;
      }
    });
  }

  @override
  void dispose() {
    _recordingTicker?.cancel();
    super.dispose();
  }

  void _updateActiveChapter(String bookId, String chapterId) {
    ref.read(currentChapterIdProvider(bookId).notifier).state = chapterId;
    _uiStateStorage?.writeActiveChapterId(bookId, chapterId);
    _restoredChapter = true;
  }

  void _startRecordingTimer() {
    _recordingTicker?.cancel();
    final startedAt = DateTime.now();
    setState(() {
      _recordingStartedAt = startedAt;
      _recordingElapsed = Duration.zero;
    });
    _recordingTicker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted || _recordingStartedAt == null) {
        return;
      }
      setState(() {
        _recordingElapsed = DateTime.now().difference(_recordingStartedAt!);
      });
    });
  }

  void _stopRecordingTimer() {
    _recordingTicker?.cancel();
    _recordingTicker = null;
    if (mounted) {
      setState(() {
        _recordingStartedAt = null;
        _recordingElapsed = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookId = widget.bookId;
    ref.listen<DictationState>(dictationControllerProvider, (previous, next) {
      if (next.error != null && next.error != previous?.error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка надиктовки: ${next.error}')),
        );
      }
      final wasListening = previous?.isListening ?? false;
      final isListening = next.isListening;
      if (isListening && !wasListening) {
        _startRecordingTimer();
        _editorGateController.open();
      } else if (!isListening && wasListening) {
        _stopRecordingTimer();
      } else if (!next.isListening && !next.isConnecting) {
        _stopRecordingTimer();
      }
    });
    final storeState = ref.watch(voicebookStoreProvider);
    final book = ref.watch(bookProvider(bookId));
    final summaries = ref.watch(chapterSummariesProvider(bookId));
    final chapters = ref.watch(bookChaptersProvider(bookId));
    final currentChapter = ref.watch(currentChapterProvider(bookId));
    final voiceProfile = ref.watch(voiceProfileProvider);
    final dictationState = ref.watch(dictationControllerProvider);

    if (storeState.isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Рабочее пространство')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (storeState.hasError) {
      return Scaffold(
        appBar: AppBar(title: const Text('Рабочее пространство')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.outer),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline, size: 48),
                const SizedBox(height: 16),
                Text(
                  'Не удалось загрузить книгу. Вернитесь в библиотеку и попробуйте снова.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (chapters.isNotEmpty) {
      if (currentChapter == null) {
        if (!_restoredChapter) {
          _restoredChapter = true;
          final storedId = _uiStateStorage?.readActiveChapterId(bookId);
          final targetId = storedId != null && chapters.any((chapter) => chapter.id == storedId)
              ? storedId
              : chapters.first.id;
          WidgetsBinding.instance.addPostFrameCallback((_) {
            _updateActiveChapter(bookId, targetId);
          });
        }
      } else if (!chapters.any((chapter) => chapter.id == currentChapter.id)) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _updateActiveChapter(bookId, chapters.first.id);
        });
      } else {
        final storedId = _uiStateStorage?.readActiveChapterId(bookId);
        if (!_restoredChapter && storedId != null && storedId != currentChapter.id &&
            chapters.any((chapter) => chapter.id == storedId)) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            _updateActiveChapter(bookId, storedId);
          });
        } else {
          _uiStateStorage?.writeActiveChapterId(bookId, currentChapter.id);
          _restoredChapter = true;
        }
      }
    }

    _processPendingWorkspaceMode(summaries, currentChapter);

    if (book == null || voiceProfile == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Рабочее пространство')),
        body: const Center(
          child: Text('Книга недоступна в демо данных. Вернитесь в библиотеку.'),
        ),
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final isDesktop = constraints.maxWidth >= 1024;
        final Chapter? activeChapter = currentChapter;
        if (activeChapter == null && _workspaceMode != _WorkspaceMode.list) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              setState(() => _workspaceMode = _WorkspaceMode.list);
            }
          });
        }
        final activeChapterId = activeChapter?.id ?? (summaries.isNotEmpty ? summaries.first.id : null);

        final bool showList = activeChapter == null || _workspaceMode == _WorkspaceMode.list;
        final bool showReader = activeChapter != null && _workspaceMode == _WorkspaceMode.reading;
        final bool showEditor = activeChapter != null && _workspaceMode == _WorkspaceMode.edit;

        final overview = SpineNotebookView(
          key: const ValueKey('spine_notebook_overview'),
          bookTitle: book.title,
          chapters: summaries,
          activeId: activeChapterId,
          onOpen: _openChapterFromList,
          onAdd: () => _handleCreateChapter(context),
        );

        final Widget reader = showReader
            ? ChapterReaderView(
                key: ValueKey('reader_${activeChapter!.id}'),
                chapter: activeChapter,
                onEdit: () => _setWorkspaceMode(_WorkspaceMode.edit, chapterId: activeChapter.id),
              )
            : const SizedBox.shrink();

        final Chapter? editingChapter = showEditor ? activeChapter : null;
        final bool gateInitiallyOpen = editingChapter != null
            ? _uiStateStorage?.readEditorGateOpened(bookId, editingChapter.id) ?? false
            : false;

        final Widget editorGate = editingChapter != null
            ? EditorGate(
                key: ValueKey('editor_gate_${editingChapter.id}'),
                controller: _editorGateController,
                isOpenInitially: gateInitiallyOpen,
                placeholder: _buildEditorGatePlaceholder(
                  context: context,
                  chapter: editingChapter,
                  onStartDictation: () {
                    _editorGateController.open();
                    ref.read(dictationControllerProvider.notifier).toggle(
                          bookId: bookId,
                          chapterId: editingChapter.id,
                        );
                  },
                  onShowEditor: _editorGateController.open,
                ),
                editor: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.gutter),
                  child: ChapterEditor(chapter: editingChapter),
                ),
                onOpen: () => _handleEditorOpened(bookId, editingChapter.id),
              )
            : const SizedBox.shrink();

        final Widget editorArea = showEditor
            ? (isDesktop
                ? Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(child: editorGate),
                      Expanded(
                        child: Stack(
                          children: [
                            const SizedBox.expand(),
                            Align(
                              alignment: Alignment.bottomRight,
                              child: Padding(
                                padding: const EdgeInsets.all(AppSpacing.outer),
                                child: FabActionCluster(
                                  onToggleRecording: () => ref
                                      .read(dictationControllerProvider.notifier)
                                      .toggle(bookId: bookId, chapterId: editingChapter!.id),
                                  onOpenComposer: () => context.pushNamed('aiComposer'),
                                  onPreviewTts: () {
                                    if (voiceProfile.status == VoiceProfileStatus.ready) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text('Готовим предпрослушку голосом ${voiceProfile.name}...')),
                                      );
                                    } else {
                                      context.pushNamed('voiceTraining');
                                    }
                                  },
                                  isRecording: dictationState.isListening,
                                  isConnecting: dictationState.isConnecting,
                                  elapsed: _recordingElapsed,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  )
                : Column(children: [Expanded(child: editorGate)]))
            : const SizedBox.shrink();

        final Widget stage;
        if (showList) {
          stage = overview;
        } else if (showReader) {
          stage = reader;
        } else {
          stage = KeyedSubtree(key: const ValueKey('editor_area'), child: editorArea);
        }

        final mainContent = AnimatedSwitcher(
          duration: const Duration(milliseconds: 220),
          switchInCurve: Curves.easeOutCubic,
          child: stage,
        );

        final Widget body = Column(
          children: [
            TopTaskbar(
              title: book.title,
              isListMode: _workspaceMode == _WorkspaceMode.list,
              activeChapter: activeChapter,
              onBack: () {
                if (_workspaceMode == _WorkspaceMode.list) {
                  context.pop();
                } else {
                  _returnToList();
                }
              },
              onShowList: _returnToList,
              onExport: () => context.pushNamed('export', queryParameters: {'bookId': bookId}),
              onOpenSettings: () => context.pushNamed('settings'),
            ),
            Expanded(child: SafeArea(child: mainContent)),
          ],
        );

        final Widget? floatingFab = (!isDesktop && showEditor)
            ? FabActionCluster(
                onToggleRecording: () => ref
                    .read(dictationControllerProvider.notifier)
                    .toggle(bookId: bookId, chapterId: editingChapter!.id),
                onOpenComposer: () => context.pushNamed('aiComposer'),
                onPreviewTts: () {
                  if (voiceProfile.status == VoiceProfileStatus.ready) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Готовим предпрослушку голосом ${voiceProfile.name}...')),
                    );
                  } else {
                    context.pushNamed('voiceTraining');
                  }
                },
                isRecording: dictationState.isListening,
                isConnecting: dictationState.isConnecting,
                elapsed: _recordingElapsed,
              )
            : null;

        if (isDesktop) {
          return Scaffold(
            body: body,
          );
        }

        return Scaffold(
          body: body,
          floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
          floatingActionButton: floatingFab,
        );
      },
    );
  }
}
