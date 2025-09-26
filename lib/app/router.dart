import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/ai_composer/ai_composer_drawer.dart';
import '../features/book_workspace/book_workspace_screen.dart';
import '../features/export/export_screen.dart';
import '../features/library/library_screen.dart';
import '../features/onboarding/onboarding_screen.dart';
import '../features/settings/settings_screen.dart';
import '../features/structure_mindmap/structure_mindmap_screen.dart';
import '../features/voice_training/voice_training_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  if (kIsWeb) {
    GoRouter.setUrlPathStrategy(UrlPathStrategy.path);
  }

  return GoRouter(
    initialLocation: '/onboarding',
    routes: [
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/library',
        name: 'library',
        builder: (context, state) => const LibraryScreen(),
      ),
      GoRoute(
        path: '/book/:bookId',
        name: 'book',
        builder: (context, state) {
          final bookId = state.pathParameters['bookId']!;
          return BookWorkspaceScreen(bookId: bookId);
        },
        routes: [
          GoRoute(
            path: 'structure',
            name: 'structure',
            builder: (context, state) {
              final nodes = state.extra as List? ?? [];
              return StructureMindmapScreen(nodes: List.from(nodes));
            },
          ),
        ],
      ),
      GoRoute(
        path: '/ai/composer',
        name: 'aiComposer',
        pageBuilder: (context, state) {
          return CustomTransitionPage(
            key: state.pageKey,
            child: const AiComposerDrawer(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return SlideTransition(
                position: Tween<Offset>(begin: const Offset(1, 0), end: Offset.zero).animate(animation),
                child: child,
              );
            },
          );
        },
      ),
      GoRoute(
        path: '/voice/training',
        name: 'voiceTraining',
        builder: (context, state) => const VoiceTrainingScreen(),
      ),
      GoRoute(
        path: '/export',
        name: 'export',
        builder: (context, state) {
          final bookId = state.uri.queryParameters['bookId'] ?? '';
          return ExportScreen(bookId: bookId);
        },
      ),
      GoRoute(
        path: '/settings',
        name: 'settings',
        builder: (context, state) => const SettingsScreen(),
      ),
    ],
  );
});
