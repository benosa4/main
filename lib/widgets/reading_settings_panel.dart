import 'package:flutter/material.dart';

import '../models/reading_prefs.dart';
import '../shared/tokens/design_tokens.dart';

class ReadingSettingsPanel extends StatelessWidget {
  final ReadingPrefs prefs;

  const ReadingSettingsPanel({super.key, required this.prefs});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      child: Card(
        elevation: 0.5,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    'Настройки чтения',
                    style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700) ??
                        const TextStyle(fontWeight: FontWeight.w700),
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: prefs.reset,
                    child: const Text('Сбросить'),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              _sizeControl(context),
              const SizedBox(height: 12),
              _themeControl(context),
              const SizedBox(height: 12),
              _fontControl(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sizeControl(BuildContext context) {
    final textStyle = Theme.of(context).textTheme.bodyMedium;
    return Row(
      children: [
        _chipLabel(icon: Icons.text_fields, label: 'Размер'),
        Expanded(
          child: Slider(
            min: 12,
            max: 28,
            divisions: 16,
            value: prefs.fontSize,
            label: prefs.fontSize.round().toString(),
            onChanged: prefs.setSize,
          ),
        ),
        Text(prefs.fontSize.round().toString(), style: textStyle),
      ],
    );
  }

  Widget _themeControl(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _chipLabel(icon: Icons.palette_outlined, label: 'Тема'),
        const SizedBox(width: 8),
        Expanded(
          child: Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              _segBtn(context, 'Светлая', prefs.theme == ReadingTheme.light,
                  () => prefs.setTheme(ReadingTheme.light)),
              _segBtn(context, 'Сепия', prefs.theme == ReadingTheme.sepia,
                  () => prefs.setTheme(ReadingTheme.sepia)),
              _segBtn(context, 'Тёмная', prefs.theme == ReadingTheme.dark,
                  () => prefs.setTheme(ReadingTheme.dark)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _fontControl(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _chipLabel(icon: Icons.font_download_outlined, label: 'Шрифт'),
        const SizedBox(width: 8),
        Expanded(
          child: Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              _segBtn(context, 'Sans', prefs.font == ReadingFont.sans,
                  () => prefs.setFont(ReadingFont.sans)),
              _segBtn(context, 'Serif', prefs.font == ReadingFont.serif,
                  () => prefs.setFont(ReadingFont.serif)),
              _segBtn(context, 'Mono', prefs.font == ReadingFont.mono,
                  () => prefs.setFont(ReadingFont.mono)),
            ],
          ),
        ),
      ],
    );
  }

  static Widget _chipLabel({required IconData icon, required String label}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.primary),
          const SizedBox(width: 6),
          Text(label,
              style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary)),
        ],
      ),
    );
  }

  static Widget _segBtn(BuildContext context, String label, bool active, VoidCallback onTap) {
    final theme = Theme.of(context);
    final borderColor = active
        ? AppColors.primary.withOpacity(.3)
        : theme.colorScheme.onSurface.withOpacity(.12);
    final textColor = active ? AppColors.primary : theme.colorScheme.onSurface;
    return InkWell(
      borderRadius: BorderRadius.circular(10),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.primary.withOpacity(.12) : Colors.transparent,
          border: Border.all(color: borderColor),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(label, style: theme.textTheme.bodyMedium?.copyWith(color: textColor)),
      ),
    );
  }
}
