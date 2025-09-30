part of 'library_controller.dart';

enum LibraryViewMode { grid, list }

class LibraryState {
  const LibraryState({
    this.collections = const <Collection>[],
    this.visibleCollections = const <Collection>[],
    this.viewMode = LibraryViewMode.grid,
    this.statusFilter,
    this.searchQuery = '',
    this.isLoading = true,
    this.errorMessage,
  });

  final List<Collection> collections;
  final List<Collection> visibleCollections;
  final LibraryViewMode viewMode;
  final CollectionStatus? statusFilter;
  final String searchQuery;
  final bool isLoading;
  final String? errorMessage;

  bool get hasResults => visibleCollections.isNotEmpty;

  LibraryState copyWith({
    List<Collection>? collections,
    List<Collection>? visibleCollections,
    LibraryViewMode? viewMode,
    Object? statusFilter = _noUpdate,
    String? searchQuery,
    bool? isLoading,
    Object? errorMessage = _noUpdate,
  }) {
    return LibraryState(
      collections: collections ?? this.collections,
      visibleCollections: visibleCollections ?? this.visibleCollections,
      viewMode: viewMode ?? this.viewMode,
      statusFilter: statusFilter == _noUpdate
          ? this.statusFilter
          : statusFilter as CollectionStatus?,
      searchQuery: searchQuery ?? this.searchQuery,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage == _noUpdate
          ? this.errorMessage
          : errorMessage as String?,
    );
  }
}

const _noUpdate = Object();
