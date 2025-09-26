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
        _ActionButton(
          icon: Icons.auto_fix_high,
          label: 'Сформировать текст',
          onPressed: onOpenComposer,
        ),
        const SizedBox(height: 12),
        _ActionButton(
          icon: Icons.spatial_audio,
          label: 'Озвучить',
          onPressed: onPreviewTts,
        ),
        const SizedBox(height: 16),
        MicRecordButton(onPressed: onStartStop),
      ],
    );
  }
}

class MicRecordButton extends StatelessWidget {
  const MicRecordButton({super.key, required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        shape: const CircleBorder(),
        padding: const EdgeInsets.all(20),
        backgroundColor: AppColors.error,
        foregroundColor: Colors.white,
        elevation: 6,
      ),
      onPressed: onPressed,
      child: const Icon(Icons.mic, size: 32),
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({required this.icon, required this.label, required this.onPressed});

  final IconData icon;
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return FilledButton.icon(
      onPressed: onPressed,
      icon: Icon(icon),
      label: Text(label),
    );
  }
}
