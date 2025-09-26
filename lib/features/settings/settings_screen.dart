import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Настройки')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Text('Распознавание речи', style: Theme.of(context).textTheme.titleLarge),
          SwitchListTile(
            value: true,
            onChanged: (_) {},
            title: const Text('Автопунктуация'),
          ),
          const SizedBox(height: 24),
          Text('AI Composer', style: Theme.of(context).textTheme.titleLarge),
          ListTile(
            title: const Text('Провайдер'),
            subtitle: const Text('Default'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          const SizedBox(height: 24),
          Text('Озвучка', style: Theme.of(context).textTheme.titleLarge),
          ListTile(
            title: const Text('Голос по умолчанию'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
        ],
      ),
    );
  }
}
