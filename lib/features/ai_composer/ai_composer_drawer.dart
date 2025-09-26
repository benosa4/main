import 'package:flutter/material.dart';

class AiComposerDrawer extends StatefulWidget {
  const AiComposerDrawer({super.key});

  @override
  State<AiComposerDrawer> createState() => _AiComposerDrawerState();
}

class _AiComposerDrawerState extends State<AiComposerDrawer> {
  double temperature = 0.6;
  double editStrength = 0.5;
  int targetLength = 3;
  String preset = 'Художественный';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final presets = ['Художественный', 'Научно-популярный', 'Эссе', 'Диалог'];

    return Drawer(
      width: 420,
      elevation: 12,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.auto_awesome, color: theme.colorScheme.primary),
                  const SizedBox(width: 12),
                  Text('AI Composer', style: theme.textTheme.headlineMedium),
                ],
              ),
              const SizedBox(height: 16),
              Text('Выберите стилистический пресет', style: theme.textTheme.titleSmall),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: presets
                    .map(
                      (item) => ChoiceChip(
                        label: Text(item),
                        selected: preset == item,
                        onSelected: (_) => setState(() => preset = item),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 24),
              _SliderTile(
                title: 'Температура',
                subtitle: '0.0 — консервативно, 1.0 — творчески',
                value: temperature,
                onChanged: (value) => setState(() => temperature = value),
              ),
              _SliderTile(
                title: 'Сила редактуры',
                subtitle: 'Насколько сильно менять исходный текст',
                value: editStrength,
                onChanged: (value) => setState(() => editStrength = value),
              ),
              _StepperTile(
                title: 'Целевая длина',
                subtitle: 'Количество абзацев в ответе',
                value: targetLength,
                onChanged: (value) => setState(() => targetLength = value),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  FilledButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.description_outlined),
                    label: const Text('Синопсис'),
                  ),
                  FilledButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.auto_stories),
                    label: const Text('План + сцены'),
                  ),
                  FilledButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.merge_type),
                    label: const Text('Мостик'),
                  ),
                  FilledButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.sparkles),
                    label: const Text('Сделать художественнее'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  color: theme.colorScheme.surfaceVariant.withOpacity(0.6),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: theme.colorScheme.primary),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Выделите фрагмент текста в редакторе, чтобы применить дифф.',
                        style: theme.textTheme.bodyMedium,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: GlassPreview(
                  before: '— Он исчез в тумане станции, — прошептала Ина.\n— Мы ещё вернём его голос, ответил оператор.',
                  after:
                      '— Он растаял в свете ночной станции, — тихо произнесла Ина.\n— Мы обязательно вернём его голос, — уверенно ответил оператор, настраивая микшер.',
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  FilledButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.check_circle),
                    label: const Text('Принять всё'),
                  ),
                  const SizedBox(width: 12),
                  OutlinedButton(
                    onPressed: () {},
                    child: const Text('Принять выделенное'),
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: () {},
                    child: const Text('Отменить'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SliderTile extends StatelessWidget {
  const _SliderTile({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  final String title;
  final String subtitle;
  final double value;
  final ValueChanged<double> onChanged;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: theme.textTheme.titleMedium),
        Text(subtitle, style: theme.textTheme.bodySmall),
        Slider(
          value: value,
          onChanged: onChanged,
        ),
      ],
    );
  }
}

class _StepperTile extends StatelessWidget {
  const _StepperTile({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  final String title;
  final String subtitle;
  final int value;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: theme.textTheme.titleMedium),
              Text(subtitle, style: theme.textTheme.bodySmall),
            ],
          ),
        ),
        IconButton(
          onPressed: value > 1 ? () => onChanged(value - 1) : null,
          icon: const Icon(Icons.remove_circle_outline),
        ),
        Text('$value', style: theme.textTheme.titleLarge),
        IconButton(
          onPressed: () => onChanged(value + 1),
          icon: const Icon(Icons.add_circle_outline),
        ),
      ],
    );
  }
}

class GlassPreview extends StatelessWidget {
  const GlassPreview({super.key, required this.before, required this.after});

  final String before;
  final String after;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.colorScheme.outlineVariant),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Diff-превью', style: theme.textTheme.titleMedium),
              const Spacer(),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'inline', label: Text('Inline')),
                  ButtonSegment(value: 'side', label: Text('Side-by-side')),
                ],
                selected: const {'inline'},
                onSelectionChanged: (_) {},
              ),
            ],
          ),
          const Divider(height: 24),
          Expanded(
            child: Row(
              children: [
                Expanded(
                  child: _DiffBlock(
                    title: 'Было',
                    text: before,
                    color: Colors.redAccent.withOpacity(0.1),
                    bullet: '-',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _DiffBlock(
                    title: 'Стало',
                    text: after,
                    color: Colors.greenAccent.withOpacity(0.12),
                    bullet: '+',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DiffBlock extends StatelessWidget {
  const _DiffBlock({
    required this.title,
    required this.text,
    required this.color,
    required this.bullet,
  });

  final String title;
  final String text;
  final Color color;
  final String bullet;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: color,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: theme.textTheme.titleSmall),
          const SizedBox(height: 12),
          Expanded(
            child: ListView(
              children: text
                  .split('\n')
                  .map(
                    (line) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(bullet, style: theme.textTheme.titleSmall),
                          const SizedBox(width: 8),
                          Expanded(child: Text(line, style: theme.textTheme.bodyMedium)),
                        ],
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }
}
