import 'package:flutter/material.dart';

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
}
