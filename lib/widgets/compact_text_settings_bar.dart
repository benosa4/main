import 'dart:ui';

import 'package:flutter/material.dart';

import '../models/reading_prefs.dart';
import '../shared/tokens/design_tokens.dart';

class CompactTextSettingsBar extends StatelessWidget {
  final ReadingPrefs prefs;
  final EdgeInsets padding;

  const CompactTextSettingsBar({
    super.key,
    required this.prefs,
    this.padding = const EdgeInsets.fromLTRB(16, 18, 16, 16),
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final borderColor = isDark
        ? AppColors.darkBorder
        : theme.colorScheme.onSurface.withOpacity(.08);
    final shadowColor = isDark
        ? Colors.black.withOpacity(.4)
        : Colors.black.withOpacity(.08);

    return Container(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: shadowColor,
            blurRadius: 22,
            spreadRadius: 0,
            offset: const Offset(0, -12),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  theme.colorScheme.surface.withOpacity(isDark ? .92 : .86),
                  theme.colorScheme.surfaceVariant
                      .withOpacity(isDark ? .88 : .82),
                ],
              ),
              border: Border(
                top: BorderSide(color: borderColor, width: 1),
              ),
            ),
            child: Padding(
              padding: padding,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _sizeControls(context),
                  const SizedBox(height: 14),
                  _segmentedRow(
                    context: context,
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
                  const SizedBox(height: 14),
                  _segmentedRow(
                    context: context,
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
                      _resetButton(context),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _sizeControls(BuildContext context) {
    final theme = Theme.of(context);
    final sliderTheme = SliderTheme.of(context).copyWith(
      trackHeight: 3,
      activeTrackColor: AppColors.primary,
      inactiveTrackColor: theme.colorScheme.onSurface.withOpacity(.12),
      thumbColor: AppColors.primary,
      overlayShape: SliderComponentShape.noOverlay,
      thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 9),
    );

    return Row(
      children: [
        _chip('Размер', Icons.text_fields),
        const SizedBox(width: 12),
        Expanded(
          child: SliderTheme(
            data: sliderTheme,
            child: Slider(
              min: 12,
              max: 28,
              divisions: 16,
              value: prefs.fontSize,
              onChanged: prefs.setSize,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Text(
          '${prefs.fontSize.round()} pt',
          style: theme.textTheme.labelMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: theme.colorScheme.onSurface.withOpacity(.72),
          ),
        ),
      ],
    );
  }

  static Widget _chip(String text, IconData icon) {
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppColors.border.withOpacity(.7)),
        gradient: const LinearGradient(
          colors: [
            Color(0x266366F1),
            Color(0x268B5CF6),
          ],
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: Row(
          mainAxisSize: MainAxisSize.min,
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
    final activeBg = AppColors.primary.withOpacity(.16);
    final inactiveBg = theme.colorScheme.onSurface.withOpacity(.05);
    final borderColor = active
        ? AppColors.primary.withOpacity(.45)
        : theme.colorScheme.onSurface.withOpacity(.08);
    final textColor = active
        ? AppColors.primary
        : theme.colorScheme.onSurface.withOpacity(.78);

    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          curve: Curves.easeOut,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: active ? activeBg : inactiveBg,
            border: Border.all(color: borderColor),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            label,
            style: theme.textTheme.labelMedium?.copyWith(
              color: textColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }

  Widget _resetButton(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: TextButton(
        onPressed: prefs.reset,
        style: TextButton.styleFrom(
          foregroundColor: Theme.of(context).colorScheme.onSurface.withOpacity(.72),
          textStyle: Theme.of(context)
              .textTheme
              .labelMedium
              ?.copyWith(fontWeight: FontWeight.w600),
        ),
        child: const Text('Сбросить'),
      ),
    );
  }

  static Widget _segmentedRow({
    required BuildContext context,
    required Widget label,
    required List<Widget> children,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        label,
        const SizedBox(width: 14),
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
