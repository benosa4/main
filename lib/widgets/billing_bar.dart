import 'package:flutter/material.dart';

class BillingBar extends StatelessWidget {
  final int credits; // 2450
  final Duration micTime; // 45 минут
  final int requests; // 120

  const BillingBar({
    super.key,
    required this.credits,
    required this.micTime,
    required this.requests,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF7C3AED), Color(0xFFA78BFA)],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
      ),
      child: Wrap(
        spacing: 20,
        runSpacing: 8,
        children: [
          _pill(context, Icons.payments_rounded, 'Кредиты: ${_fmt(credits)}'),
          _pill(context, Icons.mic_none_rounded, ' ${_fmtMinutes(micTime)} мин'),
          _pill(context, Icons.smart_toy_outlined, ' ${_fmt(requests)} запросов'),
        ],
      ),
    );
  }

  static Widget _pill(BuildContext ctx, IconData ic, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(ic, size: 16, color: Colors.white),
        const SizedBox(width: 6),
        Text(text, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
      ],
    );
  }

  static String _fmt(int n) {
    // простое разделение тысяч
    final s = n.toString();
    final buf = StringBuffer();
    for (int i = 0; i < s.length; i++) {
      final p = s.length - i;
      buf.write(s[i]);
      if (p > 1 && p % 3 == 1) buf.write(' ');
    }
    return buf.toString();
  }

  static String _fmtMinutes(Duration d) => d.inMinutes.toString();
}
