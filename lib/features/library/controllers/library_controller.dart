import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:voicebook/core/models/notebook.dart';
import 'package:voicebook/core/providers/app_providers.dart';
import 'package:voicebook/core/providers/voicebook_store.dart';
import 'package:voicebook/features/library/models/collection.dart';

part 'library_state.dart';

class LibraryController extends StateNotifier<LibraryState> {
  LibraryController({Ref? ref})
      : _ref = ref,
        super(const LibraryState());

  final Ref? _ref;
  Timer? _searchDebounce;

  void setCollections(List<Notebook> notebooks) {
    final collections = notebooks.map(Collection.fromNotebook).toList()
      ..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    state = state.copyWith(collections: collections);
    _applyFilters();
  }

  void setStoreState(VoicebookStoreState storeState) {
    state = state.copyWith(
      isLoading: storeState.isLoading,
      errorMessage: storeState.hasError
          ? 'Не удалось загрузить коллекции. Повторить?'
          : null,
    );
  }

  void toggleView() {
    final next = state.viewMode == LibraryViewMode.grid
        ? LibraryViewMode.list
        : LibraryViewMode.grid;
    state = state.copyWith(viewMode: next);
  }

  void setViewMode(LibraryViewMode mode) {
    state = state.copyWith(viewMode: mode);
  }

  void setStatusFilter(CollectionStatus? filter) {
    state = state.copyWith(statusFilter: filter);
    _applyFilters();
  }

  void onSearchChanged(String query) {
    _searchDebounce?.cancel();
    _searchDebounce = Timer(const Duration(milliseconds: 300), () {
      setSearchQuery(query);
    });
  }

  @visibleForTesting
  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query.trim());
    _applyFilters();
  }

  Future<Collection?> createNewCollection() async {
    final store = _ref?.read(voicebookStoreProvider.notifier);
    if (store == null) {
      return null;
    }
    final notebook = await store.createNotebook('Новая коллекция');
    return Collection.fromNotebook(notebook);
  }

  Future<void> renameCollection(
      {required String id, required String title}) async {
    final store = _ref?.read(voicebookStoreProvider.notifier);
    if (store == null) {
      return;
    }
    await store.renameNotebook(id: id, title: title);
  }

  Future<Collection?> duplicateCollection(String id) async {
    final store = _ref?.read(voicebookStoreProvider.notifier);
    if (store == null) {
      return null;
    }
    final notebook = await store.duplicateNotebook(id);
    return Collection.fromNotebook(notebook);
  }

  Future<void> deleteCollection(String id) async {
    final store = _ref?.read(voicebookStoreProvider.notifier);
    if (store == null) {
      return;
    }
    await store.deleteNotebook(id);
  }

  void retry() {
    _ref?.read(voicebookStoreProvider.notifier).refresh();
  }

  void _applyFilters() {
    final query = state.searchQuery.toLowerCase();
    final filter = state.statusFilter;
    final result = state.collections.where((collection) {
      if (filter != null && collection.status != filter) {
        return false;
      }
      if (query.isEmpty) {
        return true;
      }
      final haystack = <String>{
        collection.title,
        collection.category,
        ...collection.tags,
      }.map((value) => value.toLowerCase());
      return haystack.any((value) => value.contains(query));
    }).toList();
    state = state.copyWith(visibleCollections: result);
  }

  @override
  void dispose() {
    _searchDebounce?.cancel();
    super.dispose();
  }
}

final libraryControllerProvider =
    StateNotifierProvider.autoDispose<LibraryController, LibraryState>((ref) {
  final controller = LibraryController(ref: ref);
  controller.setCollections(ref.read(notebooksProvider));
  controller.setStoreState(ref.read(voicebookStoreProvider));

  ref.listen<List<Notebook>>(notebooksProvider, (previous, next) {
    controller.setCollections(next);
  });

  ref.listen<VoicebookStoreState>(voicebookStoreProvider, (previous, next) {
    controller.setStoreState(next);
  });

  return controller;
});
