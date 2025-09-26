import 'package:flutter/material.dart';

import '../../shared/ui/glass_card.dart';

class ExportScreen extends StatelessWidget {
  const ExportScreen({super.key, required this.bookId});

  final String bookId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Экспорт')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Экспорт книги', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 16),
              const Text('Выберите формат для текста и аудио.'),
              const SizedBox(height: 24),
              Wrap(
                spacing: 12,
                children: const [
                  ChoiceChip(label: Text('Markdown'), selected: true),
                  ChoiceChip(label: Text('DOCX'), selected: false),
                  ChoiceChip(label: Text('EPUB'), selected: false),
                ],
              ),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.download),
                label: const Text('Экспортировать'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
