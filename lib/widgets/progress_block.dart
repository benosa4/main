import 'package:flutter/material.dart';

class ProgressBlock extends StatelessWidget {
  final int completed; // 10
  final int total; // 12

  const ProgressBlock({super.key, required this.completed, required this.total});

  @override
  Widget build(BuildContext context) {
    final p = total == 0 ? 0.0 : completed / total;
    final percent = (p * 100).round();
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Card(
        elevation: 0.5,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Text('Прогресс написания', style: TextStyle(fontWeight: FontWeight.w700)),
                  const Spacer(),
                  Text('$percent%'),
                ],
              ),
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(999),
                child: LinearProgressIndicator(
                  value: p,
                  minHeight: 8,
                  backgroundColor: Colors.black.withOpacity(.06),
                  valueColor: const AlwaysStoppedAnimation(Color(0xFF7C3AED)),
                ),
              ),
              const SizedBox(height: 8),
              Text('$completed из $total ${_word(total)} завершены',
                  style: TextStyle(color: Colors.black.withOpacity(.55))),
            ],
          ),
        ),
      ),
    );
  }

  static String _word(int n) => n == 1 ? 'раздела' : 'разделов';
}
