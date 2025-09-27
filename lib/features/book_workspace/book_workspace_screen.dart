import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:voicebook/core/models/models.dart';
import 'package:voicebook/core/providers/app_providers.dart';
import 'package:voicebook/core/providers/dictation_controller.dart';
import 'package:voicebook/core/storage/ui_state_storage.dart';
import 'package:voicebook/shared/tokens/design_tokens.dart';
import 'widgets/chapter_ruler/chapter_ruler.dart';
import 'widgets/editor/chapter_editor.dart';
import 'widgets/fab_panel/fab_action_cluster.dart';

class BookWorkspaceScreen extends ConsumerStatefulWidget {
  const BookWorkspaceScreen({super.key, required this.bookId});

  final String bookId;

  @override
  ConsumerState<BookWorkspaceScreen> createState() => _BookWorkspaceScreenState();
}

class _BookWorkspaceScreenState extends ConsumerState<BookWorkspaceScreen> {
  static const double _collapsedPeek = 16.0;
  static const double _toggleButtonSize = 40.0;
  static const Duration _panelAnimationDuration = Duration(milliseconds: 280);

  bool _isRulerCollapsed = false;
  UiStateStorage? _uiStateStorage;
  bool _restoredChapter = false;
  Timer? _recordingTicker;
  Duration? _recordingElapsed;
  DateTime? _recordingStartedAt;

  void _toggleRuler() {
    setState(() {
      _isRulerCollapsed = !_isRulerCollapsed;
    });
  }

  @override
  void initState() {
    super.initState();
    UiStateStorage.open().then((storage) {
      if (!mounted) {
        return;
      }
      setState(() => _uiStateStorage = storage);
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

    if (book == null || currentChapter == null || voiceProfile == null) {
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
        final rulerWidth = isDesktop ? 72.0 : 64.0;
        final isCollapsed = _isRulerCollapsed;
        final rulerLeft = isCollapsed ? -rulerWidth + _collapsedPeek : 0.0;
        final contentPaddingLeft = isCollapsed ? _collapsedPeek : rulerWidth;
        final toggleLeft = math.max(0.0, rulerLeft + rulerWidth - _toggleButtonSize / 2);

        final ruler = ChapterRuler(
          bookId: bookId,
          width: rulerWidth,
          compact: !isDesktop,
          chapters: summaries,
          activeChapterId: currentChapter.id,
          onSelect: (chapterId) {
            _updateActiveChapter(bookId, chapterId);
          },
          onAddChapter: () async {
            final notifier = ref.read(voicebookStoreProvider.notifier);
            try {
              final chapter = await notifier.createChapter(bookId);
              if (context.mounted) {
                _updateActiveChapter(bookId, chapter.id);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Глава «${chapter.title}» добавлена.')),
                );
              }
            } catch (error) {
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Не удалось добавить главу. Попробуйте ещё раз.')),
                );
              }
            }
          },
          onReorder: (oldIndex, newIndex) {
            ref.read(voicebookStoreProvider.notifier).reorderChapters(
              bookId: bookId,
              oldIndex: oldIndex,
              newIndex: newIndex,
            );
          },
        );

        final editor = Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.gutter),
          child: ChapterEditor(chapter: currentChapter),
        );

        final fabPanel = Align(
          alignment: Alignment.bottomRight,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.outer),
            child: FabActionCluster(
              onToggleRecording: () =>
                  ref.read(dictationControllerProvider.notifier).toggle(bookId: bookId, chapterId: currentChapter.id),
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
        );

        final appBar = AppBar(
          titleSpacing: 16,
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(book.title),
              if (chapters.isNotEmpty)
                Text(
                  currentChapter.title,
                  style: Theme.of(context).textTheme.bodyMedium,
                  overflow: TextOverflow.ellipsis,
                ),
            ],
          ),
          actions: [
            IconButton(
              tooltip: 'Экспорт',
              onPressed: () => context.pushNamed('export', queryParameters: {'bookId': bookId}),
              icon: const Icon(Icons.ios_share_outlined),
            ),
            IconButton(
              tooltip: 'Настройки',
              onPressed: () => context.pushNamed('settings'),
              icon: const Icon(Icons.settings_outlined),
            ),
          ],
        );

        final baseContent = isDesktop
            ? Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(child: editor),
                  Expanded(
                    child: Stack(
                      children: [
                        const SizedBox.expand(),
                        fabPanel,
                      ],
                    ),
                  ),
                ],
              )
            : Column(
                children: [
                  Expanded(child: editor),
                ],
              );

        final body = SafeArea(
          child: Stack(
            children: [
              Positioned.fill(
                child: AnimatedPadding(
                  duration: _panelAnimationDuration,
                  curve: Curves.easeOutCubic,
                  padding: EdgeInsets.only(left: contentPaddingLeft),
                  child: baseContent,
                ),
              ),
              AnimatedPositioned(
                duration: _panelAnimationDuration,
                curve: Curves.easeOutCubic,
                top: 0,
                bottom: 0,
                left: rulerLeft,
                child: SizedBox(
                  width: rulerWidth,
                  child: IgnorePointer(
                    ignoring: isCollapsed,
                    child: ruler,
                  ),
                ),
              ),
              AnimatedPositioned(
                duration: _panelAnimationDuration,
                curve: Curves.easeOutCubic,
                top: 16,
                left: toggleLeft,
                child: _RulerToggleButton(
                  collapsed: isCollapsed,
                  size: _toggleButtonSize,
                  onPressed: _toggleRuler,
                ),
              ),
            ],
          ),
        );

        if (isDesktop) {
          return Scaffold(
            appBar: appBar,
            body: body,
          );
        }

        return Scaffold(
          appBar: appBar,
          body: body,
          floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
          floatingActionButton: FabActionCluster(
            onToggleRecording: () =>
                ref.read(dictationControllerProvider.notifier).toggle(bookId: bookId, chapterId: currentChapter.id),
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
        );
      },
    );
  }
}

class _RulerToggleButton extends StatelessWidget {
  const _RulerToggleButton({
    required this.collapsed,
    required this.size,
    required this.onPressed,
  });

  final bool collapsed;
  final double size;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final message = collapsed ? 'Показать переплёт' : 'Скрыть переплёт';

    return Tooltip(
      message: message,
      waitDuration: const Duration(milliseconds: 400),
      child: Material(
        color: colorScheme.surface,
        elevation: 4,
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onPressed,
          child: SizedBox(
            width: size,
            height: size,
            child: Icon(
              collapsed ? Icons.chevron_right : Icons.chevron_left,
              color: colorScheme.onSurface,
            ),
          ),
        ),
      ),
    );
  }
}
