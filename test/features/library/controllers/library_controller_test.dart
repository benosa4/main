import 'package:flutter_test/flutter_test.dart';

import 'package:voicebook/core/models/notebook.dart';
import 'package:voicebook/core/providers/voicebook_store.dart';
import 'package:voicebook/features/library/controllers/library_controller.dart';
import 'package:voicebook/features/library/models/collection.dart';

void main() {
  group('LibraryController', () {
    test('applies status filter together with search query', () {
      final controller = LibraryController();
      controller.setStoreState(const VoicebookStoreState(isLoading: false));
      controller.setCollections([
        Notebook(
          id: 'romance',
          title: 'Летняя любовь',
          tags: const ['Романтика', 'Audio-ready'],
          updatedAt: DateTime(2024, 7, 12),
          chapters: 8,
          words: 32000,
          audioMinutes: 60,
        ),
        Notebook(
          id: 'fantasy',
          title: 'Путешествие героя',
          tags: const ['Фэнтези', 'Draft'],
          updatedAt: DateTime(2024, 7, 10),
          chapters: 10,
          words: 28000,
          audioMinutes: 45,
        ),
      ]);

      controller.setStatusFilter(CollectionStatus.completed);
      controller.setSearchQuery('любов');

      expect(controller.state.visibleCollections, hasLength(1));
      expect(controller.state.visibleCollections.first.title, 'Летняя любовь');
    });
  });
}
