import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:voicebook/core/providers/app_providers.dart';
import 'package:voicebook/features/ai_composer/ai_composer_drawer.dart';
import 'package:voicebook/features/book_outline/book_outline_screen.dart';
import 'package:voicebook/features/book_workspace/book_workspace_screen.dart';
import 'package:voicebook/features/export/export_screen.dart';
import 'package:voicebook/features/library/library_screen.dart';
import 'package:voicebook/features/onboarding/onboarding_screen.dart';
import 'package:voicebook/features/settings/settings_screen.dart';
import 'package:voicebook/features/structure_mindmap/structure_mindmap_screen.dart';
import 'package:voicebook/features/voice_training/voice_training_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');

final appRouterProvider = Provider<GoRouter>((ref) {
  final permissions = ref.watch(permissionsProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/onboarding',
    redirect: (context, state) {
      final location = state.matchedLocation;
      final allowed = permissions.allGranted;
      final isOnboarding = location == '/onboarding';

      if (!allowed && !isOnboarding) {
        return '/onboarding';
      }

      if (allowed && isOnboarding) {
        return '/library';
      }

      return null;
    },
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
        redirect: (context, state) {
          final bookId = state.pathParameters['bookId']!;
          final exists = ref.read(bookExistsProvider(bookId));
          return exists ? null : '/library';
        },
        pageBuilder: (context, state) {
          final bookId = state.pathParameters['bookId']!;
          return CustomTransitionPage(
            key: state.pageKey,
            child: BookOutlineScreen(bookId: bookId),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              final tween = Tween<Offset>(begin: const Offset(1, 0), end: Offset.zero)
                  .chain(CurveTween(curve: Curves.easeOutCubic));
              return SlideTransition(position: animation.drive(tween), child: child);
            },
          );
        },
        routes: [
          GoRoute(
            path: 'editor',
            name: 'bookEditor',
            pageBuilder: (context, state) {
              final bookId = state.pathParameters['bookId']!;
              return CustomTransitionPage(
                key: state.pageKey,
                child: BookWorkspaceScreen(bookId: bookId),
                transitionsBuilder: (context, animation, secondaryAnimation, child) {
                  final tween = Tween<Offset>(begin: const Offset(1, 0), end: Offset.zero)
                      .chain(CurveTween(curve: Curves.easeOutCubic));
                  return SlideTransition(position: animation.drive(tween), child: child);
                },
              );
            },
            routes: [
              GoRoute(
                parentNavigatorKey: _rootNavigatorKey,
                path: 'structure',
                name: 'mindmap',
                pageBuilder: (context, state) {
                  final bookId = state.pathParameters['bookId']!;
                  final fallbackChapterId = ref.read(currentChapterIdProvider(bookId));
                  final chapterId = state.uri.queryParameters['chapterId'] ?? fallbackChapterId;
                  return CustomTransitionPage(
                    key: state.pageKey,
                    barrierDismissible: true,
                    barrierColor: Colors.black54,
                    opaque: false,
                    child: StructureMindmapScreen(bookId: bookId, chapterId: chapterId),
                    transitionsBuilder: (context, animation, secondaryAnimation, child) {
                      return FadeTransition(
                        opacity: animation,
                        child: ScaleTransition(scale: Tween(begin: 0.98, end: 1.0).animate(animation), child: child),
                      );
                    },
                  );
                },
              ),
            ],
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
            barrierDismissible: true,
            opaque: false,
            barrierColor: Colors.black38,
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              final tween = Tween<Offset>(begin: const Offset(1, 0), end: Offset.zero)
                  .chain(CurveTween(curve: Curves.easeInOutCubic));
              return SlideTransition(position: animation.drive(tween), child: child);
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
        redirect: (context, state) {
          final bookId = state.uri.queryParameters['bookId'];
          if (bookId == null || bookId.isEmpty) {
            return '/library';
          }
          return ref.read(bookExistsProvider(bookId)) ? null : '/library';
        },
        pageBuilder: (context, state) {
          final bookId = state.uri.queryParameters['bookId']!;
          return CustomTransitionPage(
            key: state.pageKey,
            child: ExportScreen(bookId: bookId),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              final tween = Tween<Offset>(begin: const Offset(0, 1), end: Offset.zero)
                  .chain(CurveTween(curve: Curves.easeOutCubic));
              return SlideTransition(position: animation.drive(tween), child: child);
            },
          );
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
