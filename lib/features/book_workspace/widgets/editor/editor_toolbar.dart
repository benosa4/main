import 'dart:ui';

import 'package:flutter/material.dart';

import 'package:voicebook/shared/tokens/design_tokens.dart';

enum EditorCommand {
  undo,
  redo,
  heading1,
  heading2,
  bold,
  italic,
  bulletList,
  more,
}

class EditorToolbar extends StatelessWidget {
  const EditorToolbar({super.key, required this.onCommand});

  final ValueChanged<EditorCommand> onCommand;

  @override
  Widget build(BuildContext context) {
    final borderColor = AppColors.border.withOpacity(0.32);
    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.55),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: borderColor),
            boxShadow: const [
              BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4)),
            ],
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _ToolbarIcon(
                icon: Icons.undo,
                tooltip: 'Назад',
                onTap: () => onCommand(EditorCommand.undo),
              ),
              _ToolbarIcon(
                icon: Icons.redo,
                tooltip: 'Вперёд',
                onTap: () => onCommand(EditorCommand.redo),
              ),
              const _ToolbarDivider(),
              _ToolbarIcon(
                icon: Icons.title,
                tooltip: 'Заголовок H1',
                onTap: () => onCommand(EditorCommand.heading1),
              ),
              _ToolbarIcon(
                icon: Icons.subtitles,
                tooltip: 'Заголовок H2',
                onTap: () => onCommand(EditorCommand.heading2),
              ),
              const _ToolbarDivider(),
              _ToolbarIcon(
                icon: Icons.format_bold,
                tooltip: 'Жирный',
                onTap: () => onCommand(EditorCommand.bold),
              ),
              _ToolbarIcon(
                icon: Icons.format_italic,
                tooltip: 'Курсив',
                onTap: () => onCommand(EditorCommand.italic),
              ),
              _ToolbarIcon(
                icon: Icons.format_list_bulleted,
                tooltip: 'Маркированный список',
                onTap: () => onCommand(EditorCommand.bulletList),
              ),
              const _ToolbarDivider(),
              _ToolbarIcon(
                icon: Icons.more_horiz,
                tooltip: 'Больше инструментов',
                onTap: () => onCommand(EditorCommand.more),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ToolbarIcon extends StatefulWidget {
  const _ToolbarIcon({required this.icon, required this.tooltip, required this.onTap});

  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;

  @override
  State<_ToolbarIcon> createState() => _ToolbarIconState();
}

class _ToolbarIconState extends State<_ToolbarIcon> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final hoverColor = AppColors.primary.withOpacity(0.12);
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      cursor: SystemMouseCursors.click,
      child: Tooltip(
        message: widget.tooltip,
        child: GestureDetector(
          onTap: widget.onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 120),
            curve: Curves.easeInOut,
            margin: const EdgeInsets.symmetric(horizontal: 2),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: _hovered ? hoverColor : Colors.transparent,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(widget.icon, size: 20, color: const Color(0xFF0F172A)),
          ),
        ),
      ),
    );
  }
}

class _ToolbarDivider extends StatelessWidget {
  const _ToolbarDivider();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      height: 24,
      margin: const EdgeInsets.symmetric(horizontal: 6),
      color: AppColors.border.withOpacity(0.4),
    );
  }
}
