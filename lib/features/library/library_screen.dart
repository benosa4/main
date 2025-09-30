import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:voicebook/core/providers/app_providers.dart';
import 'package:voicebook/features/library/controllers/library_controller.dart';
import 'package:voicebook/features/library/models/collection.dart';
import 'package:voicebook/features/library/widgets/collection_card.dart';
import 'package:voicebook/features/library/widgets/collapsible_promo_header.dart';
import 'package:voicebook/features/library/widgets/status_filter_chips.dart';
import 'package:voicebook/features/library/widgets/view_toggle.dart';
import 'package:voicebook/shared/tokens/design_tokens.dart';

class LibraryScreen extends ConsumerStatefulWidget {
  const LibraryScreen({super.key});

  @override
  ConsumerState<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends ConsumerState<LibraryScreen> {
  late final TextEditingController _searchController;
  VoidCallback? _searchListener;

  @override
  void initState() {
    super.initState();
    final state = ref.read(libraryControllerProvider);
    _searchController = TextEditingController(text: state.searchQuery);
    _searchListener = () {
      ref
          .read(libraryControllerProvider.notifier)
          .onSearchChanged(_searchController.text);
    };
    _searchController.addListener(_searchListener!);
  }

  @override
  void dispose() {
    if (_searchListener != null) {
      _searchController.removeListener(_searchListener!);
    }
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final libraryState = ref.watch(libraryControllerProvider);
    final permissions = ref.watch(permissionsProvider);
    final controller = ref.read(libraryControllerProvider.notifier);
    final storeState = ref.watch(voicebookStoreProvider);

    if (_searchController.text != libraryState.searchQuery) {
      _searchController.value = TextEditingValue(
        text: libraryState.searchQuery,
        selection:
            TextSelection.collapsed(offset: libraryState.searchQuery.length),
      );
    }

    final width = MediaQuery.of(context).size.width;
    final showSearchField = width >= 480;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: _buildAppBar(context, showSearchField),
      body: CustomScrollView(
        slivers: [
          if (libraryState.errorMessage != null)
            SliverToBoxAdapter(
              child: _ErrorBanner(
                message: libraryState.errorMessage!,
                onRetry: controller.retry,
              ),
            ),
          SliverPersistentHeader(
            pinned: false,
            floating: false,
            delegate: CollapsiblePromoHeader(
              onCreate: () => _createCollection(context, controller),
              micGranted: permissions.microphone,
              storageGranted: permissions.files,
              notifGranted: permissions.notifications,
              onAskMic: () {
                if (!permissions.microphone) {
                  _togglePermission(AppPermission.microphone);
                }
              },
              onAskStorage: () {
                if (!permissions.files) {
                  _togglePermission(AppPermission.files);
                }
              },
              onAskNotif: () {
                if (!permissions.notifications) {
                  _togglePermission(AppPermission.notifications);
                }
              },
              max: width < 600 ? 220 : 260,
              min: 76,
            ),
          ),
          SliverPersistentHeader(
            pinned: true,
            delegate: _PinnedTitleHeader(
              height: 64,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 6, 16, 6),
                child: Row(
                  children: [
                    Text(
                      'Библиотека коллекций',
                      style: Theme.of(context)
                          .textTheme
                          .titleLarge
                          ?.copyWith(
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary),
                    ),
                    const Spacer(),
                    ViewToggle(
                      mode: libraryState.viewMode,
                      onChanged: (mode) => controller.setViewMode(mode),
                    ),
                  ],
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 6, 16, 10),
              child: StatusFilterChips(
                selected: libraryState.statusFilter,
                onChanged: controller.setStatusFilter,
              ),
            ),
          ),
          ..._buildContentSlivers(
            context: context,
            state: libraryState,
            isLoading: storeState.isLoading,
            controller: controller,
            width: width,
          ),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context, bool showSearchField) {
    return AppBar(
      backgroundColor: AppColors.appBarBackground,
      elevation: 0,
      toolbarHeight: 72,
      titleSpacing: 0,
      title: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          children: [
            const Icon(Icons.auto_awesome, color: AppColors.primary, size: 28),
            const SizedBox(width: 8),
            Text(
              'VoxBook Studio',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
            ),
            const Spacer(),
            if (showSearchField)
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 360),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Поиск по коллекциям…',
                    isDense: true,
                    prefixIcon: const Icon(Icons.search, size: 18),
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide:
                          BorderSide(color: Colors.black.withOpacity(0.08)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide:
                          BorderSide(color: Colors.black.withOpacity(0.08)),
                    ),
                  ),
                ),
              )
            else
              IconButton(
                tooltip: 'Поиск',
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Поиск скоро появится.')),
                  );
                },
                icon:
                    const Icon(Icons.search, color: AppColors.textPrimary),
              ),
            const SizedBox(width: 12),
            IconButton(
              tooltip: 'Уведомления',
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                      content: Text('Центр уведомлений появится позднее.')),
                );
              },
              icon: const Icon(Icons.notifications_none,
                  color: AppColors.textPrimary),
            ),
            IconButton(
              tooltip: 'Настройки',
              onPressed: () => context.pushNamed('settings'),
              icon: const Icon(Icons.settings_outlined,
                  color: AppColors.textPrimary),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildContentSlivers({
    required BuildContext context,
    required LibraryState state,
    required bool isLoading,
    required LibraryController controller,
    required double width,
  }) {
    if (isLoading) {
      return [_skeletonSliver(width)];
    }

    if (state.collections.isEmpty) {
      return [
        SliverFillRemaining(
          hasScrollBody: false,
          child: _EmptyState(
            onCreate: () => _createCollection(context, controller),
          ),
        ),
      ];
    }

    if (state.visibleCollections.isEmpty) {
      final query = state.searchQuery;
      return [
        SliverFillRemaining(
          hasScrollBody: false,
          child: _NoResultsMessage(query: query),
        ),
      ];
    }

    if (state.viewMode == LibraryViewMode.list) {
      return [
        _listSliver(
          state.visibleCollections,
          onOpen: (collection) => _openCollection(context, collection.id),
          onRename: (collection) => _renameCollection(context, collection),
          onDuplicate: (collection) => _duplicateCollection(context, collection),
          onExport: (collection) => _exportCollection(context, collection),
          onDelete: (collection) => _deleteCollection(context, collection),
        ),
      ];
    }

    return [
      _gridSliver(
        state.visibleCollections,
        width,
        onOpen: (collection) => _openCollection(context, collection.id),
        onRename: (collection) => _renameCollection(context, collection),
        onDuplicate: (collection) => _duplicateCollection(context, collection),
        onExport: (collection) => _exportCollection(context, collection),
        onDelete: (collection) => _deleteCollection(context, collection),
      ),
    ];
  }

  Widget _gridSliver(
    List<Collection> collections,
    double width, {
    required ValueChanged<Collection> onOpen,
    required ValueChanged<Collection> onRename,
    required ValueChanged<Collection> onDuplicate,
    required ValueChanged<Collection> onExport,
    required ValueChanged<Collection> onDelete,
  }) {
    final columns = _columnsFor(width);
    return SliverPadding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      sliver: SliverGrid.builder(
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: columns,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.8,
        ),
        itemCount: collections.length,
        itemBuilder: (context, index) {
          final collection = collections[index];
          return CollectionCard(
            collection: collection,
            onOpen: () => onOpen(collection),
            onRename: () => onRename(collection),
            onDuplicate: () => onDuplicate(collection),
            onExport: () => onExport(collection),
            onDelete: () => onDelete(collection),
          );
        },
      ),
    );
  }

  Widget _listSliver(
    List<Collection> collections, {
    required ValueChanged<Collection> onOpen,
    required ValueChanged<Collection> onRename,
    required ValueChanged<Collection> onDuplicate,
    required ValueChanged<Collection> onExport,
    required ValueChanged<Collection> onDelete,
  }) {
    return SliverPadding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      sliver: SliverList.separated(
        itemCount: collections.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final collection = collections[index];
          return CollectionListTile(
            collection: collection,
            onOpen: () => onOpen(collection),
            onRename: () => onRename(collection),
            onDuplicate: () => onDuplicate(collection),
            onExport: () => onExport(collection),
            onDelete: () => onDelete(collection),
          );
        },
      ),
    );
  }

  Widget _skeletonSliver(double width) {
    final columns = _columnsFor(width);
    return SliverPadding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      sliver: SliverGrid.builder(
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: columns,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.8,
        ),
        itemCount: columns * 2,
        itemBuilder: (context, index) {
          return Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 2,
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.notebookLine.withOpacity(0.4),
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(12),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          height: 16,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: AppColors.notebookLine.withOpacity(0.7),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Container(
                          height: 10,
                          width: 140,
                          decoration: BoxDecoration(
                            color: AppColors.notebookLine.withOpacity(0.5),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        const Spacer(),
                        Container(
                          height: 26,
                          width: 120,
                          decoration: BoxDecoration(
                            color: AppColors.notebookLine.withOpacity(0.4),
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  int _columnsFor(double width) {
    if (width >= 1200) {
      return 5;
    }
    if (width >= 900) {
      return 4;
    }
    if (width >= 600) {
      return 3;
    }
    return 2;
  }

  Future<void> _createCollection(
      BuildContext context, LibraryController controller) async {
    final collection = await controller.createNewCollection();
    if (collection != null && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Коллекция «${collection.title}» создана.')),
      );
      _openCollection(context, collection.id);
    }
  }

  void _openCollection(BuildContext context, String id) {
    context.pushNamed('book', pathParameters: {'bookId': id});
  }

  Future<void> _renameCollection(
      BuildContext context, Collection collection) async {
    final controller = ref.read(libraryControllerProvider.notifier);
    final textController = TextEditingController(text: collection.title);
    final formKey = GlobalKey<FormState>();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Переименовать коллекцию'),
          content: Form(
            key: formKey,
            child: TextFormField(
              controller: textController,
              autofocus: true,
              maxLength: 60,
              decoration: const InputDecoration(hintText: 'Название коллекции'),
              validator: (value) {
                final trimmed = value?.trim() ?? '';
                if (trimmed.isEmpty) {
                  return 'Введите название (минимум 1 символ).';
                }
                if (trimmed.length > 60) {
                  return 'Название слишком длинное.';
                }
                return null;
              },
            ),
          ),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Отмена')),
            FilledButton(
              onPressed: () {
                if (formKey.currentState?.validate() ?? false) {
                  Navigator.pop(context, true);
                }
              },
              child: const Text('Сохранить'),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      await controller.renameCollection(
          id: collection.id, title: textController.text.trim());
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content:
                  Text('Название обновлено: «${textController.text.trim()}».')),
        );
      }
    }
  }

  Future<void> _duplicateCollection(
      BuildContext context, Collection collection) async {
    final controller = ref.read(libraryControllerProvider.notifier);
    final copy = await controller.duplicateCollection(collection.id);
    if (copy != null && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Создана копия «${copy.title}».')),
      );
    }
  }

  Future<void> _deleteCollection(
      BuildContext context, Collection collection) async {
    final controller = ref.read(libraryControllerProvider.notifier);
    final confirmationController = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Удалить коллекцию?'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                  'Для подтверждения введите первые три символа названия «${collection.title}».'),
              const SizedBox(height: 12),
              TextField(
                controller: confirmationController,
                autofocus: true,
                maxLength: 60,
                decoration:
                    const InputDecoration(hintText: 'Первые три символа'),
              ),
            ],
          ),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Отмена')),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: AppColors.error),
              onPressed: () {
                final trimmed = collection.title.trim();
                final sliceLength = trimmed.length >= 3 ? 3 : trimmed.length;
                final expected = trimmed.substring(0, sliceLength);
                if (expected.isEmpty ||
                    expected.toLowerCase() ==
                        confirmationController.text.trim().toLowerCase()) {
                  Navigator.pop(context, true);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                        content: Text(
                            'Введите «$expected», чтобы подтвердить удаление.')),
                  );
                }
              },
              child: const Text('Удалить'),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      await controller.deleteCollection(collection.id);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Коллекция «${collection.title}» удалена.')),
        );
      }
    }
  }

  Future<void> _exportCollection(
      BuildContext context, Collection collection) async {
    final format = await showModalBottomSheet<String>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const ListTile(title: Text('Экспорт коллекции')),
                ListTile(
                  leading: const Icon(Icons.picture_as_pdf_outlined),
                  title: const Text('PDF'),
                  onTap: () => Navigator.pop(context, 'pdf'),
                ),
                ListTile(
                  leading: const Icon(Icons.book_outlined),
                  title: const Text('EPUB'),
                  onTap: () => Navigator.pop(context, 'epub'),
                ),
                ListTile(
                  leading: const Icon(Icons.data_object),
                  title: const Text('JSON'),
                  onTap: () => Navigator.pop(context, 'json'),
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        );
      },
    );

    if (format != null && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(
                'Экспорт коллекции «${collection.title}» в формате $format скоро будет доступен.')),
      );
    }
  }

  void _togglePermission(AppPermission permission) {
    ref.read(permissionsProvider.notifier).toggle(permission);
  }
}

class _PinnedTitleHeader extends SliverPersistentHeaderDelegate {
  const _PinnedTitleHeader({
    required this.child,
    this.height = 64,
  });

  final Widget child;
  final double height;

  @override
  double get minExtent => height;

  @override
  double get maxExtent => height;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    final shadow = overlapsContent
        ? [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ]
        : null;

    return SizedBox.expand(
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: shadow,
          border: const Border(
            bottom: BorderSide(color: AppColors.border),
          ),
        ),
        child: child,
      ),
    );
  }

  @override
  bool shouldRebuild(covariant _PinnedTitleHeader oldDelegate) {
    return oldDelegate.child != child || oldDelegate.height != height;
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.onCreate});

  final VoidCallback onCreate;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.library_add_outlined,
              size: 68, color: AppColors.primary),
          const SizedBox(height: 12),
          Text(
            'Здесь появятся ваши коллекции',
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            'Можно импортировать заметки или начать голосом',
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: AppColors.textPrimary.withOpacity(0.7)),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: onCreate,
            icon: const Icon(Icons.add),
            label: const Text('Создать первую коллекцию'),
          ),
        ],
      ),
    );
  }
}

class _NoResultsMessage extends StatelessWidget {
  const _NoResultsMessage({required this.query});

  final String query;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.search_off_rounded,
              size: 56, color: AppColors.neutralGrey),
          const SizedBox(height: 12),
          Text(
            'Ничего не найдено для «$query»',
            style: Theme.of(context).textTheme.titleMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 6),
          Text(
            'Попробуйте изменить фильтры или уточнить запрос.',
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: AppColors.textPrimary.withOpacity(0.6)),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: AppColors.error.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.error.withOpacity(0.3)),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              const Icon(Icons.wifi_off, color: AppColors.error),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  message,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
              TextButton(onPressed: onRetry, child: const Text('Повторить')),
            ],
          ),
        ),
      ),
    );
  }
}
