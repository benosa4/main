import 'package:flutter/material.dart';

import 'package:voicebook/features/library/models/collection.dart';
import 'package:voicebook/shared/tokens/design_tokens.dart';

class StatusFilterChips extends StatelessWidget {
  const StatusFilterChips({
    super.key,
    required this.selected,
    required this.onChanged,
  });

  final CollectionStatus? selected;
  final ValueChanged<CollectionStatus?> onChanged;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        _buildChip(context,
            label: 'Все',
            active: selected == null,
            onTap: () => onChanged(null)),
        _buildChip(
          context,
          label: 'В работе',
          active: selected == CollectionStatus.inProgress,
          onTap: () => onChanged(CollectionStatus.inProgress),
        ),
        _buildChip(
          context,
          label: 'Завершённые',
          active: selected == CollectionStatus.completed,
          onTap: () => onChanged(CollectionStatus.completed),
        ),
        _buildChip(
          context,
          label: 'Черновики',
          active: selected == CollectionStatus.draft,
          onTap: () => onChanged(CollectionStatus.draft),
        ),
      ],
    );
  }

  Widget _buildChip(
    BuildContext context, {
    required String label,
    required bool active,
    required VoidCallback onTap,
  }) {
    final background =
        active ? AppColors.primary.withOpacity(0.12) : Colors.transparent;
    final borderColor =
        active ? AppColors.primary.withOpacity(0.45) : AppColors.border;
    final textColor = active
        ? AppColors.primary
        : Theme.of(context).textTheme.bodyMedium?.color;

    return Material(
      color: background,
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        borderRadius: BorderRadius.circular(999),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: borderColor),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ),
      ),
    );
  }
}
