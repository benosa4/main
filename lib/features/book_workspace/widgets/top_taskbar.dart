import 'package:flutter/material.dart';

import '../../../core/models/chapter.dart';

class TopTaskbar extends StatelessWidget {
  const TopTaskbar({
    super.key,
    required this.title,
    required this.isListMode,
    required this.activeChapter,
    required this.onBack,
    required this.onShowList,
    required this.onExport,
    required this.onOpenSettings,
  });

  final String title;
  final bool isListMode;
  final Chapter? activeChapter;
  final VoidCallback onBack;
  final VoidCallback onShowList;
  final VoidCallback onExport;
  final VoidCallback onOpenSettings;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final Color baseTextColor = const Color(0xFF0F172A);
    return Material(
      color: const Color(0xFFF1F5F9),
      elevation: 0,
      child: Container(
        decoration: const BoxDecoration(
          color: Color(0xFFF1F5F9),
          boxShadow: [
            BoxShadow(color: Color(0x1A000000), blurRadius: 24, offset: Offset(0, 4)),
          ],
        ),
        child: SafeArea(
          bottom: false,
          child: SizedBox(
            height: 60,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                children: [
                  TextButton.icon(
                    onPressed: onBack,
                    style: TextButton.styleFrom(
                      foregroundColor: const Color(0xFF1E293B),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      backgroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
                    label: const Text('Назад'),
                  ),
                  const SizedBox(width: 24),
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: baseTextColor,
                          ),
                        ),
                        if (!isListMode && activeChapter != null)
                          Text(
                            activeChapter!.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: textTheme.bodyMedium?.copyWith(color: const Color(0xFF475569)),
                          ),
                      ],
                    ),
                  ),
                  if (!isListMode)
                    Padding(
                      padding: const EdgeInsets.only(right: 12),
                      child: OutlinedButton.icon(
                        onPressed: onShowList,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF1D4ED8),
                          side: const BorderSide(color: Color(0xFFBFDBFE)),
                          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        icon: const Icon(Icons.menu_book_outlined),
                        label: const Text('Оглавление'),
                      ),
                    ),
                  IconButton(
                    tooltip: 'Экспорт',
                    onPressed: onExport,
                    icon: const Icon(Icons.ios_share_outlined),
                  ),
                  IconButton(
                    tooltip: 'Настройки',
                    onPressed: onOpenSettings,
                    icon: const Icon(Icons.settings_outlined),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
