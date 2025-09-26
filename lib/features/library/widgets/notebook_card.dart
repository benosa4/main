import 'package:flutter/material.dart';

import '../../../core/models/notebook.dart';
import '../../../shared/tokens/design_tokens.dart';

class NotebookCard extends StatelessWidget {
  const NotebookCard({super.key, required this.notebook});

  final Notebook notebook;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
      onTap: () {
        // TODO: open notebook.
      },
      child: Ink(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
          gradient: const LinearGradient(
            colors: [AppColors.primary, AppColors.secondary],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Align(
                  alignment: Alignment.topRight,
                  child: Text(
                    '${notebook.chapters} глав',
                    style: theme.textTheme.labelMedium!.copyWith(color: Colors.white70),
                  ),
                ),
              ),
              Text(
                notebook.title,
                style: theme.textTheme.titleLarge!.copyWith(color: Colors.white),
                maxLines: 2,
              ),
              const SizedBox(height: 12),
              Text(
                'Обновлено ${notebook.updatedAt}',
                style: theme.textTheme.bodySmall?.copyWith(color: Colors.white70),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
