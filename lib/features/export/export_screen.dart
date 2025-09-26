import 'package:flutter/material.dart';

import 'package:voicebook/shared/ui/glass_card.dart';

class ExportScreen extends StatelessWidget {
  const ExportScreen({super.key, required this.bookId});

  final String bookId;

  @override
  Widget build(BuildContext context) {
    final textFormats = ['Markdown', 'DOCX', 'EPUB', 'PDF'];
    final audioFormats = ['MP3', 'M4B'];

    return Scaffold(
      appBar: AppBar(title: const Text('Экспорт')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Row(
          children: [
            Expanded(
              flex: 2,
              child: GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Текстовые форматы', style: Theme.of(context).textTheme.headlineSmall),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 12,
                      children: textFormats
                          .map((format) => ChoiceChip(label: Text(format), selected: format == 'EPUB', onSelected: (_) {}))
                          .toList(),
                    ),
                    const SizedBox(height: 24),
                    Text('Метаданные', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 12),
                    TextField(
                      decoration: InputDecoration(
                        labelText: 'Название книги',
                        filled: true,
                        fillColor: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      maxLines: 3,
                      decoration: InputDecoration(
                        labelText: 'Аннотация',
                        filled: true,
                        fillColor: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      decoration: InputDecoration(
                        labelText: 'Жанры и ключевые слова',
                        filled: true,
                        fillColor: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                      ),
                    ),
                    const SizedBox(height: 20),
                    _TocList(),
                    const SizedBox(height: 20),
                    FilledButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.download),
                      label: const Text('Экспортировать текст'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 24),
            Expanded(
              child: Column(
                children: [
                  Expanded(
                    child: GlassCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Аудио', style: Theme.of(context).textTheme.headlineSmall),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 12,
                            children: audioFormats
                                .map((format) => ChoiceChip(label: Text(format), selected: format == 'M4B', onSelected: (_) {}))
                                .toList(),
                          ),
                          const SizedBox(height: 20),
                          ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: const Text('Голос'),
                            subtitle: const Text('Автор: Night Station'),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () {},
                          ),
                          const SizedBox(height: 12),
                          _SliderTile(
                            label: 'Скорость',
                            value: 1.0,
                            onChanged: (_) {},
                          ),
                          _SliderTile(
                            label: 'Тон',
                            value: 0.5,
                            onChanged: (_) {},
                          ),
                          const SizedBox(height: 20),
                          FilledButton.icon(
                            onPressed: () {},
                            icon: const Icon(Icons.spatial_audio_off),
                            label: const Text('Сгенерировать аудио'),
                          ),
                          const SizedBox(height: 12),
                          const LinearProgressIndicator(value: 0.45),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  GlassCard(
                    child: Row(
                      children: const [
                        Icon(Icons.info_outline),
                        SizedBox(width: 12),
                        Expanded(child: Text('Экспорт EPUB включает оглавление и пометку «Синтетическая озвучка» для аудио.')),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SliderTile extends StatelessWidget {
  const _SliderTile({required this.label, required this.value, required this.onChanged});

  final String label;
  final double value;
  final ValueChanged<double> onChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label),
        Slider(
          value: value,
          onChanged: onChanged,
        ),
      ],
    );
  }
}

class _TocList extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final chapters = List.generate(6, (index) => 'Глава ${index + 1}');
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Оглавление', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          ...chapters.map(
            (title) => CheckboxListTile(
              value: true,
              onChanged: (_) {},
              title: Text(title),
              controlAffinity: ListTileControlAffinity.leading,
            ),
          ),
        ],
      ),
    );
  }
}
