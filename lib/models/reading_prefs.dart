import 'package:flutter/material.dart';
import '../shared/tokens/design_tokens.dart'; // для AppColors.primary

enum ReadingTheme { light, sepia, dark }
enum ReadingFont { sans, serif, mono }

class ReadingPrefs extends ChangeNotifier {
  double fontSize;
  ReadingTheme theme;
  ReadingFont font;

  ReadingPrefs({
    this.fontSize = 16.0,
    this.theme = ReadingTheme.light,
    this.font = ReadingFont.sans,
  });

  void setSize(double value) {
    fontSize = value.clamp(12, 28).toDouble();
    notifyListeners();
  }

  void setTheme(ReadingTheme t) {
    theme = t;
    notifyListeners();
  }

  void setFont(ReadingFont f) {
    font = f;
    notifyListeners();
  }

  void reset() {
    fontSize = 16.0;
    theme = ReadingTheme.light;
    font = ReadingFont.sans;
    notifyListeners();
  }

  Color get bgColor {
    switch (theme) {
      case ReadingTheme.light:
        return Colors.white;
      case ReadingTheme.sepia:
        return const Color(0xFFF8F1E3);
      case ReadingTheme.dark:
        return const Color(0xFF0B0F14);
    }
  }

  Color get textColor {
    switch (theme) {
      case ReadingTheme.light:
        return const Color(0xFF111827);
      case ReadingTheme.sepia:
        return const Color(0xFF2C2A25);
      case ReadingTheme.dark:
        return Colors.white;
    }
  }

  String? get fontFamily {
    switch (font) {
      case ReadingFont.sans:
        return null;
      case ReadingFont.serif:
        return 'Georgia';
      case ReadingFont.mono:
        return 'monospace';
    }
  }

  List<String>? get fontFallback {
    switch (font) {
      case ReadingFont.sans:
        return const ['Roboto', 'SF Pro Text'];
      case ReadingFont.serif:
        return const ['Georgia', 'Times New Roman', 'Noto Serif', 'RobotoSlab'];
      case ReadingFont.mono:
        return const ['Menlo', 'Consolas', 'Roboto Mono'];
    }
  }

  // ====== Chrome (верх/низ панелей) ======
  bool get isDark => theme == ReadingTheme.dark;

  /// База под панели: чуть светлее фон текста
  Color get chromeBase {
    final double k = switch (theme) {
      ReadingTheme.dark => 0.10,
      ReadingTheme.sepia => 0.06,
      ReadingTheme.light => 0.04,
    };
    return Color.lerp(bgColor, Colors.white, k)!;
  }

  /// Контур панелей
  Color get chromeBorder =>
      isDark ? Colors.white.withOpacity(.08) : Colors.black.withOpacity(.06);

  /// Цвет иконок/текстов на AppBar
  Color get chromeForeground =>
      isDark ? Colors.white : const Color(0xFF111827);

  /// Градиент панелей (легкая лавандово-бирюзовая вуаль поверх chromeBase)
  LinearGradient get chromeGradient {
    // Легкая лавандово-бирюзовая вуаль поверх chromeBase
    final c1 = Color.alphaBlend(
      AppColors.primary.withOpacity(0.16),
      chromeBase,
    );
    final c2 = Color.alphaBlend(
      AppColors.accent.withOpacity(0.12),
      chromeBase,
    );
    return LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [c1, c2],
    );
  }
}
