import 'package:flutter/material.dart';

import '../tokens/design_tokens.dart';

class PrimaryButton extends StatelessWidget {
  const PrimaryButton({super.key, required this.label, required this.onPressed, this.icon});

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radiusLarge)),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      onPressed: onPressed,
      icon: Icon(icon ?? Icons.mic_rounded),
      label: Text(label),
    );
  }
}
