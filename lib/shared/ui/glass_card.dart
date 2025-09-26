import 'dart:ui';

import 'package:flutter/material.dart';

import '../tokens/design_tokens.dart';

class GlassCard extends StatelessWidget {
  const GlassCard({super.key, required this.child, this.padding = const EdgeInsets.all(24)});

  final Widget child;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
            border: Border.all(color: theme.colorScheme.outlineVariant.withOpacity(0.4)),
            color: theme.colorScheme.surface.withOpacity(0.75),
          ),
          padding: padding,
          child: child,
        ),
      ),
    );
  }
}
