import 'package:flutter/material.dart';

import 'package:voicebook/features/library/controllers/library_controller.dart';
import 'package:voicebook/shared/tokens/design_tokens.dart';

class ViewToggle extends StatelessWidget {
  const ViewToggle({
    super.key,
    required this.mode,
    required this.onChanged,
  });

  final LibraryViewMode mode;
  final ValueChanged<LibraryViewMode> onChanged;

  @override
  Widget build(BuildContext context) {
    final isGrid = mode == LibraryViewMode.grid;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _toggleButton(
            context,
            icon: Icons.grid_view_rounded,
            active: isGrid,
            onTap: () => onChanged(LibraryViewMode.grid),
          ),
          _toggleButton(
            context,
            icon: Icons.view_list_rounded,
            active: !isGrid,
            onTap: () => onChanged(LibraryViewMode.list),
          ),
        ],
      ),
    );
  }

  Widget _toggleButton(
    BuildContext context, {
    required IconData icon,
    required bool active,
    required VoidCallback onTap,
  }) {
    final color =
        active ? AppColors.primary : AppColors.textPrimary.withOpacity(0.8);
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color:
              active ? AppColors.primary.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Icon(icon, size: 20, color: color),
      ),
    );
  }
}
