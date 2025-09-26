import 'package:flutter/material.dart';

class AiComposerDrawer extends StatelessWidget {
  const AiComposerDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('AI Composer', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 16),
              const Text('Выберите действие, чтобы улучшить текст.'),
              const SizedBox(height: 24),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  _PresetChip(label: 'Художественный'),
                  _PresetChip(label: 'Научно-популярный'),
                  _PresetChip(label: 'Эссе'),
                  _PresetChip(label: 'Диалог'),
                ],
              ),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.auto_awesome),
                label: const Text('Расширить'),
              ),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.swap_calls),
                label: const Text('Перефразировать'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PresetChip extends StatelessWidget {
  const _PresetChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return FilterChip(label: Text(label), selected: true, onSelected: (_) {});
  }
}
