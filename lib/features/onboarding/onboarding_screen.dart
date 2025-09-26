import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/ui/glass_app_bar.dart';
import '../../shared/ui/primary_button.dart';

class OnboardingScreen extends ConsumerWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: const GlassAppBar(title: 'Voicebook'),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: PageView(
                  children: const [
                    _BenefitCard(
                      title: 'Диктуйте, редактируйте, экспортируйте',
                      description:
                          'Voicebook объединяет запись, AI-редактуру и озвучку в одном пространстве.',
                    ),
                    _BenefitCard(
                      title: 'Работает офлайн',
                      description:
                          'Последние главы доступны без сети, а прогресс синхронизируется позже.',
                    ),
                    _BenefitCard(
                      title: 'Ваша студия звучания',
                      description:
                          'Тренируйте персональный голос и создавайте аудиокниги в один клик.',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              PrimaryButton(
                label: 'Начать диктовку',
                onPressed: () {
                  // Permissions and navigation handled in controller.
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BenefitCard extends StatelessWidget {
  const _BenefitCard({required this.title, required this.description});

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(title, style: theme.textTheme.headlineLarge),
            const SizedBox(height: 16),
            Text(description, style: theme.textTheme.bodyLarge),
          ],
        ),
      ),
    );
  }
}
