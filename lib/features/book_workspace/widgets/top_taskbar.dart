import 'package:flutter/material.dart';

class TopTaskbar extends StatelessWidget {
  const TopTaskbar({super.key, required this.onBack, this.actions = const []});

  final VoidCallback onBack;
  final List<Widget> actions;

  static const Color _background = Color(0xFFF1F5F9);
  static const Color _accent = Color(0xFF6366F1);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final iconTheme = theme.iconTheme.copyWith(color: const Color(0xFF334155));
    return Material(
      color: Colors.transparent,
      child: Container(
        height: 60,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: const BoxDecoration(
          color: _background,
          boxShadow: [
            BoxShadow(
              color: Color(0x140F172A),
              blurRadius: 10,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            IconButton(
              onPressed: onBack,
              icon: const Icon(Icons.arrow_back),
              color: _accent,
            ),
            const Spacer(),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: actions
                  .map(
                    (action) => Padding(
                      padding: const EdgeInsets.only(left: 8),
                      child: IconTheme.merge(
                        data: iconTheme.copyWith(color: _accent),
                        child: action,
                      ),
                    ),
                  )
                  .toList(),
            ),
          ],
        ),
      ),
    );
  }
}
