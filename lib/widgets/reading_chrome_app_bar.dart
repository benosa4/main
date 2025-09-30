import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../models/reading_prefs.dart';

class ReadingChromeAppBar extends StatelessWidget implements PreferredSizeWidget {
  final ReadingPrefs prefs;
  final VoidCallback? onBack;
  final List<Widget>? actions;
  final Widget? title;

  const ReadingChromeAppBar({
    super.key,
    required this.prefs,
    this.onBack,
    this.actions,
    this.title,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    final fg = prefs.chromeForeground;
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: prefs.isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Container(
        decoration: BoxDecoration(
          gradient: prefs.chromeGradient,
          border: Border(bottom: BorderSide(color: prefs.chromeBorder)),
        ),
        child: SafeArea(
          bottom: false,
          child: SizedBox(
            height: kToolbarHeight,
            child: IconTheme.merge(
              data: IconThemeData(color: fg),
              child: Row(
                children: [
                  IconButton(
                    onPressed: onBack,
                    icon: const Icon(Icons.arrow_back),
                    color: fg,
                    tooltip: 'Назад',
                  ),
                  const SizedBox(width: 4),
                  DefaultTextStyle(
                    style: TextStyle(
                      color: fg,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                    child: title ?? const SizedBox.shrink(),
                  ),
                  const Spacer(),
                  if (actions != null)
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: actions!,
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
