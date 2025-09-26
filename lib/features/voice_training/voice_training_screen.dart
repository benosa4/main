import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/ui/glass_card.dart';

class VoiceTrainingScreen extends ConsumerWidget {
  const VoiceTrainingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Тренировка голоса')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Запишите несколько фраз', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 16),
              const Text('Озвучка станет доступна после завершения анализа качества.'),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.mic),
                label: const Text('Записать фразу'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
