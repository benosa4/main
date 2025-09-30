import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:voicebook/core/providers/app_providers.dart';
import 'package:voicebook/features/library/controllers/library_controller.dart';
import 'package:voicebook/features/library/models/collection.dart';
import 'package:voicebook/features/library/widgets/collection_card.dart';
import 'package:voicebook/features/library/widgets/promo_create_panel.dart';
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

    final body = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (libraryState.errorMessage != null)
          _ErrorBanner(
            message: libraryState.errorMessage!,
            onRetry: controller.retry,
          ),
        PromoCreatePanel(
          onCreate: () => _createCollection(context, controller),
          onRequestMicrophone: () =>
              _togglePermission(AppPermission.microphone),
          onRequestStorage: () => _togglePermission(AppPermission.files),
          onRequestNotifications: () =>
              _togglePermission(AppPermission.notifications),
          microphoneGranted: permissions.microphone,
          storageGranted: permissions.files,
          notificationsGranted: permissions.notifications,
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
          child: Row(
            children: [
              Text(
                'Библиотека коллекций',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
              ),
              const Spacer(),
              ViewToggle(
                mode: libraryState.viewMode,
                onChanged: (mode) => controller.setViewMode(mode),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: StatusFilterChips(
            selected: libraryState.statusFilter,
            onChanged: controller.setStatusFilter,
          ),
        ),
        const SizedBox(height: 8),
        Expanded(
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            child: _buildContent(
                context, libraryState, storeState.isLoading, controller),
          ),
        ),
      ],
    );

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: _buildAppBar(context),
      body: body,
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
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

  Widget _buildContent(
    BuildContext context,
    LibraryState libraryState,
    bool isLoading,
    LibraryController controller,
  ) {
    if (isLoading) {
      return const _SkeletonGrid();
    }

    if (libraryState.collections.isEmpty) {
      return _EmptyState(
          onCreate: () => _createCollection(context, controller));
    }

    if (libraryState.visibleCollections.isEmpty) {
      final query = libraryState.searchQuery;
      return _NoResultsMessage(query: query);
    }

    if (libraryState.viewMode == LibraryViewMode.list) {
      return _ListView(
        collections: libraryState.visibleCollections,
        onOpen: (collection) => _openCollection(context, collection.id),
        onRename: (collection) => _renameCollection(context, collection),
        onDuplicate: (collection) => _duplicateCollection(context, collection),
        onExport: (collection) => _exportCollection(context, collection),
        onDelete: (collection) => _deleteCollection(context, collection),
      );
    }

    return _GridView(
      collections: libraryState.visibleCollections,
      onOpen: (collection) => _openCollection(context, collection.id),
      onRename: (collection) => _renameCollection(context, collection),
      onDuplicate: (collection) => _duplicateCollection(context, collection),
      onExport: (collection) => _exportCollection(context, collection),
      onDelete: (collection) => _deleteCollection(context, collection),
    );
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

class _GridView extends StatelessWidget {
  const _GridView({
    required this.collections,
    required this.onOpen,
    required this.onRename,
    required this.onDuplicate,
    required this.onExport,
    required this.onDelete,
  });

  final List<Collection> collections;
  final ValueChanged<Collection> onOpen;
  final ValueChanged<Collection> onRename;
  final ValueChanged<Collection> onDuplicate;
  final ValueChanged<Collection> onExport;
  final ValueChanged<Collection> onDelete;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 320,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
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
    );
  }
}

class _ListView extends StatelessWidget {
  const _ListView({
    required this.collections,
    required this.onOpen,
    required this.onRename,
    required this.onDuplicate,
    required this.onExport,
    required this.onDelete,
  });

  final List<Collection> collections;
  final ValueChanged<Collection> onOpen;
  final ValueChanged<Collection> onRename;
  final ValueChanged<Collection> onDuplicate;
  final ValueChanged<Collection> onExport;
  final ValueChanged<Collection> onDelete;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
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
    );
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

class _SkeletonGrid extends StatelessWidget {
  const _SkeletonGrid();

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
      itemCount: 4,
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 320,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.8,
      ),
      itemBuilder: (context, index) {
        return Card(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 2,
                child:
                    Container(color: AppColors.notebookLine.withOpacity(0.4)),
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
