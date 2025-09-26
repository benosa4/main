import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../../shared/tokens/design_tokens.dart';

class FabActionCluster extends StatelessWidget {
  const FabActionCluster({
    super.key,
    required this.onStartStop,
    required this.onOpenComposer,
    required this.onPreviewTts,
  });

  final VoidCallback onStartStop;
  final VoidCallback onOpenComposer;
  final VoidCallback onPreviewTts;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        _FloatingActionButton(
          icon: Icons.auto_fix_high,
          label: 'Сформировать текст',
          color: AppColors.secondary,
          onPressed: onOpenComposer,
        ),
        const SizedBox(height: 12),
        _FloatingActionButton(
          icon: Icons.graphic_eq,
          label: 'Озвучить',
          color: AppColors.accent,
          onPressed: onPreviewTts,
        ),
        const SizedBox(height: 16),
        _MicRecordButton(onPressed: onStartStop),
      ],
    );
  }
}

class _FloatingActionButton extends StatelessWidget {
  const _FloatingActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onPressed,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLarge),
        boxShadow: [
          BoxShadow(color: color.withOpacity(0.28), blurRadius: 18, offset: const Offset(0, 8)),
        ],
      ),
      child: FilledButton.icon(
        onPressed: onPressed,
        icon: Icon(icon),
        label: Text(label),
        style: FilledButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radiusLarge)),
        ),
      ),
    );
  }
}

class _MicRecordButton extends StatefulWidget {
  const _MicRecordButton({required this.onPressed});

  final VoidCallback onPressed;

  @override
  State<_MicRecordButton> createState() => _MicRecordButtonState();
}

class _MicRecordButtonState extends State<_MicRecordButton> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat();
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
        final pulse = (math.sin(_controller.value * math.pi * 2) + 1) / 2;
        return Stack(
          alignment: Alignment.center,
          children: [
            Container(
              width: 92 + pulse * 16,
              height: 92 + pulse * 16,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.error.withOpacity(0.45 - pulse * 0.2),
                    AppColors.error.withOpacity(0.1),
                  ],
                ),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                shape: const CircleBorder(),
                padding: const EdgeInsets.all(28),
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
                elevation: 10,
              ),
              onPressed: widget.onPressed,
              child: const Icon(Icons.mic, size: 36),
            ),
            Positioned(
              bottom: -12,
              child: _LevelMeter(level: pulse),
            ),
          ],
        );
      },
    );
  }
}

class _LevelMeter extends StatelessWidget {
  const _LevelMeter({required this.level});

  final double level;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 76,
      height: 18,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white24),
        color: Colors.black.withOpacity(0.24),
      ),
      padding: const EdgeInsets.all(3),
      child: Align(
        alignment: Alignment.centerLeft,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: 70 * level.clamp(0.1, 1.0),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            gradient: const LinearGradient(
              colors: [AppColors.accent, Colors.white],
            ),
          ),
        ),
      ),
    );
  }
}
