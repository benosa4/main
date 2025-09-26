import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/ui/glass_card.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Настройки')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: const [
          _SectionHeader(title: 'Распознавание речи'),
          _AsrSettings(),
          SizedBox(height: 24),
          _SectionHeader(title: 'AI Composer'),
          _AiSettings(),
          SizedBox(height: 24),
          _SectionHeader(title: 'Озвучка'),
          _TtsSettings(),
          SizedBox(height: 24),
          _SectionHeader(title: 'Синхронизация'),
          _SyncSettings(),
          SizedBox(height: 24),
          _SectionHeader(title: 'Голосовые команды'),
          _CommandsSettings(),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(title, style: Theme.of(context).textTheme.headlineSmall);
  }
}

class _AsrSettings extends StatelessWidget {
  const _AsrSettings();

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Column(
        children: [
          SwitchListTile(
            value: true,
            onChanged: (_) {},
            title: const Text('Автопунктуация'),
            subtitle: const Text('Автоматически расставляет точки и запятые'),
          ),
          ListTile(
            title: const Text('Язык по умолчанию'),
            subtitle: const Text('Русский'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            title: const Text('Fallback-политика'),
            subtitle: const Text('WS → HTTP → Офлайн буфер'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
        ],
      ),
    );
  }
}

class _AiSettings extends StatelessWidget {
  const _AiSettings();

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Column(
        children: [
          ListTile(
            title: const Text('Провайдер'),
            subtitle: const Text('Voicebook AI'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            title: const Text('Лимит токенов в день'),
            subtitle: const Text('Осталось 8 500'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            title: const Text('Пресет стиля по умолчанию'),
            subtitle: const Text('Научно-популярный'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
        ],
      ),
    );
  }
}

class _TtsSettings extends StatelessWidget {
  const _TtsSettings();

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Column(
        children: [
          SwitchListTile(
            value: true,
            onChanged: (_) {},
            title: const Text('Использовать персональный голос'),
            subtitle: const Text('Недоступно без завершения тренировки'),
          ),
          ListTile(
            title: const Text('Голос по умолчанию'),
            subtitle: const Text('Night Station v2'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
        ],
      ),
    );
  }
}

class _SyncSettings extends StatelessWidget {
  const _SyncSettings();

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Column(
        children: [
          RadioListTile<String>(
            value: 'local',
            groupValue: 'cloud',
            onChanged: (_) {},
            title: const Text('Только локально'),
            subtitle: const Text('Данные остаются на устройстве'),
          ),
          RadioListTile<String>(
            value: 'cloud',
            groupValue: 'cloud',
            onChanged: (_) {},
            title: const Text('С облачной синхронизацией'),
            subtitle: const Text('Резервное копирование и доступ с других устройств'),
          ),
        ],
      ),
    );
  }
}

class _CommandsSettings extends StatelessWidget {
  const _CommandsSettings();

  @override
  Widget build(BuildContext context) {
    final commands = ['"Новая глава"', '"Начать запись"', '"Перефразируй абзац"'];
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SwitchListTile(
            value: true,
            onChanged: (_) {},
            title: const Text('Включить голосовые команды'),
          ),
          const Divider(),
          ...commands.map(
            (command) => ListTile(
              leading: const Icon(Icons.record_voice_over),
              title: Text(command),
              trailing: const Icon(Icons.edit_outlined),
              onTap: () {},
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.add),
            label: const Text('Добавить команду'),
          ),
        ],
      ),
    );
  }
}
