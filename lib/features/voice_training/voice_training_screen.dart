import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:voicebook/shared/ui/glass_card.dart';

class VoiceTrainingScreen extends ConsumerWidget {
  const VoiceTrainingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final phrases = List.generate(5, (index) => 'Фраза ${index + 1}: Голос ночной станции слышен каждому.');

    return Scaffold(
      appBar: AppBar(title: const Text('Тренировка голоса')),
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
                    Text('Запишите 5 коротких фраз', style: Theme.of(context).textTheme.headlineSmall),
                    const SizedBox(height: 12),
                    const Text('Каждая фраза должна быть озвучена в тихом помещении. Мы проанализируем качество и сообщим результат.'),
                    const SizedBox(height: 24),
                    Expanded(
                      child: ListView.separated(
                        itemCount: phrases.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final completed = index < 2;
                          return _PhraseTile(
                            text: phrases[index],
                            completed: completed,
                            snr: completed ? 23 + index * 2 : null,
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: const [
                        Icon(Icons.info_outline, color: Colors.white70),
                        SizedBox(width: 8),
                        Expanded(child: Text('Качественные сэмплы ускоряют генерацию персонального голоса.')),
                      ],
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
                          Text('Запись', style: Theme.of(context).textTheme.headlineSmall),
                          const SizedBox(height: 12),
                          const Text('Нажмите и удерживайте кнопку, проговорите фразу медленно и чётко.'),
                          const SizedBox(height: 24),
                          const _RecordingPanel(),
                          const SizedBox(height: 24),
                          _QualityMeter(value: 0.72),
                          const SizedBox(height: 24),
                          Row(
                            children: [
                              Checkbox(value: true, onChanged: (_) {}),
                              const Expanded(child: Text('Я соглашаюсь использовать свой голос для синтеза и маркировки «Синтетическая озвучка».')),
                            ],
                          ),
                          const SizedBox(height: 12),
                          FilledButton.icon(
                            onPressed: () {},
                            icon: const Icon(Icons.school_outlined),
                            label: const Text('Отправить на анализ'),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  GlassCard(
                    child: Row(
                      children: const [
                        Icon(Icons.shield_outlined),
                        SizedBox(width: 12),
                        Expanded(
                          child: Text('Статус профиля: training → ожидает проверки. Получите уведомление, когда голос будет готов.'),
                        ),
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

class _PhraseTile extends StatelessWidget {
  const _PhraseTile({required this.text, required this.completed, this.snr});

  final String text;
  final bool completed;
  final int? snr;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ListTile(
      tileColor: theme.colorScheme.surfaceVariant.withOpacity(0.3),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      leading: Icon(completed ? Icons.check_circle : Icons.radio_button_unchecked,
          color: completed ? Colors.greenAccent : theme.colorScheme.primary),
      title: Text(text),
      subtitle: completed && snr != null ? Text('SNR: $snr дБ — отлично') : const Text('Ожидает записи'),
      trailing: FilledButton.tonalIcon(
        onPressed: () {},
        icon: const Icon(Icons.mic),
        label: const Text('Записать'),
      ),
    );
  }
}

class _RecordingPanel extends StatefulWidget {
  const _RecordingPanel();

  @override
  State<_RecordingPanel> createState() => _RecordingPanelState();
}

class _RecordingPanelState extends State<_RecordingPanel> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500))..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final level = (math.sin(_controller.value * math.pi * 2) + 1) / 2;
        return Column(
          children: [
            Container(
              height: 120,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                gradient: LinearGradient(
                  colors: [Colors.pinkAccent.withOpacity(0.4), Colors.deepPurpleAccent.withOpacity(0.2)],
                ),
              ),
              child: CustomPaint(
                painter: _WavePainter(level: level),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.mic),
              label: const Text('Запись идёт... 00:32'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.pinkAccent,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _WavePainter extends CustomPainter {
  const _WavePainter({required this.level});

  final double level;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    final path = Path();
    for (double x = 0; x <= size.width; x += 12) {
      final y = size.height / 2 + math.sin((x / size.width * 2 * math.pi) + level * math.pi) * 28 * (0.4 + level * 0.6);
      if (x == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _WavePainter oldDelegate) => oldDelegate.level != level;
}

class _QualityMeter extends StatelessWidget {
  const _QualityMeter({required this.value});

  final double value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Качество записи', style: theme.textTheme.titleMedium),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: LinearProgressIndicator(
            value: value,
            minHeight: 12,
            backgroundColor: theme.colorScheme.surfaceVariant,
            valueColor: const AlwaysStoppedAnimation(Colors.greenAccent),
          ),
        ),
        const SizedBox(height: 8),
        Text('SNR 22 дБ · Шумы 8%', style: theme.textTheme.bodySmall),
      ],
    );
  }
}
