import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/models.dart';
import '../../core/providers/app_providers.dart';
import '../../shared/ui/glass_card.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(appSettingsProvider);
    if (settings == null) {
      return const Scaffold(
        appBar: AppBar(title: Text('Настройки')),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Настройки')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const _SectionHeader(title: 'Распознавание речи'),
          _AsrSettings(settings: settings, onChanged: (value) => _update(ref, value)),
          const SizedBox(height: 24),
          const _SectionHeader(title: 'AI Composer'),
          _AiSettings(settings: settings, onChanged: (value) => _update(ref, value)),
          const SizedBox(height: 24),
          const _SectionHeader(title: 'Озвучка'),
          _TtsSettings(settings: settings, onChanged: (value) => _update(ref, value)),
          const SizedBox(height: 24),
          const _SectionHeader(title: 'Синхронизация'),
          _SyncSettings(settings: settings, onChanged: (value) => _update(ref, value)),
          const SizedBox(height: 24),
          const _SectionHeader(title: 'Голосовые команды'),
          _CommandsSettings(settings: settings, onChanged: (value) => _update(ref, value)),
        ],
      ),
    );
  }

  void _update(WidgetRef ref, AppSettings settings) {
    ref.read(voicebookStoreProvider.notifier).updateSettings(settings);
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
  const _AsrSettings({required this.settings, required this.onChanged});

  final AppSettings settings;
  final ValueChanged<AppSettings> onChanged;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Column(
        children: [
          SwitchListTile(
            value: settings.autoPunctuation,
            onChanged: (value) => onChanged(settings.copyWith(autoPunctuation: value)),
            title: const Text('Автопунктуация'),
            subtitle: const Text('Автоматически расставляет точки и запятые'),
          ),
          ListTile(
            title: const Text('Язык по умолчанию'),
            subtitle: Text(settings.defaultLanguage),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Выбор языка появится в следующей версии.')),
              );
            },
          ),
          ListTile(
            title: const Text('Fallback-политика'),
            subtitle: Text(settings.fallbackPolicy),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Настройка fallback скоро станет интерактивной.')),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _AiSettings extends StatelessWidget {
  const _AiSettings({required this.settings, required this.onChanged});

  final AppSettings settings;
  final ValueChanged<AppSettings> onChanged;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Column(
        children: [
          ListTile(
            title: const Text('Провайдер'),
            subtitle: Text(settings.aiProvider),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Добавим выбор провайдера позже.')),
              );
            },
          ),
          ListTile(
            title: const Text('Лимит токенов в день'),
            subtitle: Text('Осталось ${settings.dailyTokenLimit}'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Редактирование лимитов появится позже.')),
              );
            },
          ),
          ListTile(
            title: const Text('Пресет стиля по умолчанию'),
            subtitle: Text(settings.defaultAiPreset),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => onChanged(settings.copyWith(defaultAiPreset: settings.defaultAiPreset)),
          ),
        ],
      ),
    );
  }
}

class _TtsSettings extends StatelessWidget {
  const _TtsSettings({required this.settings, required this.onChanged});

  final AppSettings settings;
  final ValueChanged<AppSettings> onChanged;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Column(
        children: [
          SwitchListTile(
            value: settings.usePersonalVoice,
            onChanged: (value) => onChanged(settings.copyWith(usePersonalVoice: value)),
            title: const Text('Использовать персональный голос'),
            subtitle: const Text('Недоступно без завершения тренировки'),
          ),
          ListTile(
            title: const Text('Голос по умолчанию'),
            subtitle: Text(settings.defaultVoice),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Скоро можно будет выбрать другой голос.')),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _SyncSettings extends StatelessWidget {
  const _SyncSettings({required this.settings, required this.onChanged});

  final AppSettings settings;
  final ValueChanged<AppSettings> onChanged;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Column(
        children: [
          RadioListTile<String>(
            value: 'local',
            groupValue: settings.syncStrategy,
            onChanged: (value) => onChanged(settings.copyWith(syncStrategy: value ?? settings.syncStrategy)),
            title: const Text('Только локально'),
            subtitle: const Text('Данные остаются на устройстве'),
          ),
          RadioListTile<String>(
            value: 'cloud',
            groupValue: settings.syncStrategy,
            onChanged: (value) => onChanged(settings.copyWith(syncStrategy: value ?? settings.syncStrategy)),
            title: const Text('С облачной синхронизацией'),
            subtitle: const Text('Резервное копирование и доступ с других устройств'),
          ),
        ],
      ),
    );
  }
}

class _CommandsSettings extends StatelessWidget {
  const _CommandsSettings({required this.settings, required this.onChanged});

  final AppSettings settings;
  final ValueChanged<AppSettings> onChanged;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SwitchListTile(
            value: settings.voiceCommandsEnabled,
            onChanged: (value) => onChanged(settings.copyWith(voiceCommandsEnabled: value)),
            title: const Text('Включить голосовые команды'),
          ),
          const Divider(),
          ...settings.voiceCommands.map(
            (command) => ListTile(
              leading: const Icon(Icons.record_voice_over),
              title: Text(command),
              trailing: IconButton(
                icon: const Icon(Icons.delete_outline),
                onPressed: () {
                  final updated = List<String>.from(settings.voiceCommands)..remove(command);
                  onChanged(settings.copyWith(voiceCommands: updated));
                },
              ),
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () async {
              final controller = TextEditingController();
              final result = await showDialog<String>(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Новая команда'),
                  content: TextField(
                    controller: controller,
                    autofocus: true,
                    decoration: const InputDecoration(hintText: 'Например: "Добавь сцену"'),
                  ),
                  actions: [
                    TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Отмена')),
                    FilledButton(
                      onPressed: () => Navigator.of(context).pop(controller.text.trim()),
                      child: const Text('Сохранить'),
                    ),
                  ],
                ),
              );
              if (result != null && result.isNotEmpty) {
                final updated = List<String>.from(settings.voiceCommands)..add('"$result"');
                onChanged(settings.copyWith(voiceCommands: updated));
              }
            },
            icon: const Icon(Icons.add),
            label: const Text('Добавить команду'),
          ),
        ],
      ),
    );
  }
}
