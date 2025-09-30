import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:voicebook/core/models/notebook.dart';
import 'package:voicebook/core/providers/voicebook_store.dart';
import 'package:voicebook/features/library/controllers/library_controller.dart';
import 'package:voicebook/features/library/widgets/view_toggle.dart';

final _testControllerProvider =
    StateNotifierProvider<LibraryController, LibraryState>((ref) {
  final controller = LibraryController();
  controller.setStoreState(const VoicebookStoreState(isLoading: false));
  controller.setCollections([
    Notebook(
      id: 'test',
      title: 'Летняя любовь',
      tags: const ['Романтика', 'Audio-ready'],
      updatedAt: DateTime(2024, 7, 12),
      chapters: 8,
      words: 28000,
      audioMinutes: 60,
    ),
  ]);
  return controller;
});

class _ViewToggleHarness extends ConsumerWidget {
  const _ViewToggleHarness();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(_testControllerProvider);
    final controller = ref.read(_testControllerProvider.notifier);
    return ViewToggle(
      mode: state.viewMode,
      onChanged: controller.setViewMode,
    );
  }
}

void main() {
  testWidgets('switching between grid and list updates state', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          home: Scaffold(body: Center(child: _ViewToggleHarness())),
        ),
      ),
    );

    final element = tester.element(find.byType(ViewToggle));
    final container = ProviderScope.containerOf(element);
    final controller = container.read(_testControllerProvider.notifier);

    expect(controller.state.viewMode, LibraryViewMode.grid);

    await tester.tap(find.byIcon(Icons.view_list_rounded));
    await tester.pumpAndSettle();

    expect(controller.state.viewMode, LibraryViewMode.list);

    await tester.tap(find.byIcon(Icons.grid_view_rounded));
    await tester.pumpAndSettle();

    expect(controller.state.viewMode, LibraryViewMode.grid);
  });
}
