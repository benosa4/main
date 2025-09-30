import 'package:flutter/material.dart';

import '../models/reading_prefs.dart';
import '../shared/tokens/design_tokens.dart';

class CompactTextSettingsBar extends StatelessWidget {
  final ReadingPrefs prefs;
  final EdgeInsets padding;

  const CompactTextSettingsBar({
    super.key,
    required this.prefs,
    this.padding = const EdgeInsets.fromLTRB(12, 8, 12, 8),
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: theme.cardColor,
      elevation: 2,
      borderRadius: const BorderRadius.only(
        topLeft: Radius.circular(12),
        topRight: Radius.circular(12),
      ),
      child: Padding(
        padding: padding,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                _chip('Размер', Icons.text_fields),
                const SizedBox(width: 8),
                Expanded(
                  child: SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      trackHeight: 2.5,
                      thumbShape: const RoundSliderThumbShape(
                        enabledThumbRadius: 8,
                      ),
                    ),
                    child: Slider(
                      min: 12,
                      max: 28,
                      divisions: 16,
                      value: prefs.fontSize,
                      onChanged: prefs.setSize,
                    ),
                  ),
                ),
                SizedBox(
                  width: 32,
                  child: Text(
                    prefs.fontSize.round().toString(),
                    textAlign: TextAlign.right,
                    style: theme.textTheme.labelMedium,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            _hScrollRow(
              label: _chip('Тема', Icons.palette_outlined),
              children: [
                _segBtn(
                  context,
                  'Светлая',
                  prefs.theme == ReadingTheme.light,
                  () => prefs.setTheme(ReadingTheme.light),
                ),
                _segBtn(
                  context,
                  'Сепия',
                  prefs.theme == ReadingTheme.sepia,
                  () => prefs.setTheme(ReadingTheme.sepia),
                ),
                _segBtn(
                  context,
                  'Тёмная',
                  prefs.theme == ReadingTheme.dark,
                  () => prefs.setTheme(ReadingTheme.dark),
                ),
              ],
            ),
            const SizedBox(height: 6),
            _hScrollRow(
              label: _chip('Шрифт', Icons.font_download_outlined),
              children: [
                _segBtn(
                  context,
                  'Sans',
                  prefs.font == ReadingFont.sans,
                  () => prefs.setFont(ReadingFont.sans),
                ),
                _segBtn(
                  context,
                  'Serif',
                  prefs.font == ReadingFont.serif,
                  () => prefs.setFont(ReadingFont.serif),
                ),
                _segBtn(
                  context,
                  'Mono',
                  prefs.font == ReadingFont.mono,
                  () => prefs.setFont(ReadingFont.mono),
                ),
                TextButton(
                  onPressed: prefs.reset,
                  child: const Text('Сбросить'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  static Widget _chip(String text, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        children: [
          Icon(icon, size: 14, color: AppColors.primary),
          const SizedBox(width: 6),
          Text(
            text,
            style: const TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.w700,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  static Widget _segBtn(
    BuildContext context,
    String label,
    bool active,
    VoidCallback onTap,
  ) {
    final theme = Theme.of(context);
    final textColor = active
        ? AppColors.primary
        : theme.textTheme.bodyMedium?.color ?? theme.colorScheme.onSurface;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: InkWell(
        borderRadius: BorderRadius.circular(9),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: active ? AppColors.primary.withOpacity(.12) : Colors.transparent,
            border: Border.all(
              color: active
                  ? AppColors.primary.withOpacity(.3)
                  : theme.colorScheme.onSurface.withOpacity(.1),
            ),
            borderRadius: BorderRadius.circular(9),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ),
      ),
    );
  }

  static Widget _hScrollRow({
    required Widget label,
    required List<Widget> children,
  }) {
    return Row(
      children: [
        label,
        const SizedBox(width: 8),
        Expanded(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(children: children),
          ),
        ),
      ],
    );
  }
}
