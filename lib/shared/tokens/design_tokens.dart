import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  /// Primary lavender accent used across CTAs and highlights.
  static const primary = Color(0xFF7C3AED);

  /// Secondary tint that complements the primary gradient.
  static const secondary = Color(0xFFA78BFA);

  /// Informational turquoise accent (for progress in 30–69% range).
  static const accent = Color(0xFF06B6D4);

  static const error = Color(0xFFEF4444);
  static const warning = Color(0xFFF59E0B);
  static const success = Color(0xFF10B981);

  static const neutralGrey = Color(0xFF9CA3AF);

  static const textPrimary = Color(0xFF111827);
  static const textOnDark = Color(0xFFFFFFFF);

  static const notebookLine = Color(0xFFE0E6ED);
  static const appBarBackground = Color(0xFFF3F4F6);

  static const border = Color(0xFFE3E6EA);

  static const darkSurface = Color(0xFF0B0D12);
  static const darkBorder = Color(0x22FFFFFF);
}

class AppSpacing {
  AppSpacing._();

  static const outer = 20.0;
  static const gutter = 16.0;
  static const radiusSmall = 6.0;
  static const radiusMedium = 16.0;
  static const radiusLarge = 24.0;
}

class AppTypography {
  AppTypography._();

  static const fontFamily = 'Inter';

  static TextTheme textTheme = const TextTheme(
    displayMedium: TextStyle(
      fontFamily: fontFamily,
      fontWeight: FontWeight.w500,
      fontSize: 32,
    ),
    headlineLarge: TextStyle(
      fontFamily: fontFamily,
      fontWeight: FontWeight.w500,
      fontSize: 28,
    ),
    headlineMedium: TextStyle(
      fontFamily: fontFamily,
      fontWeight: FontWeight.w500,
      fontSize: 24,
    ),
    headlineSmall: TextStyle(
      fontFamily: fontFamily,
      fontWeight: FontWeight.w500,
      fontSize: 20,
    ),
    titleLarge: TextStyle(
      fontFamily: fontFamily,
      fontWeight: FontWeight.w500,
      fontSize: 18,
    ),
    bodyLarge: TextStyle(
      fontFamily: fontFamily,
      fontWeight: FontWeight.w400,
      fontSize: 16,
    ),
    bodyMedium: TextStyle(
      fontFamily: fontFamily,
      fontWeight: FontWeight.w400,
      fontSize: 14,
    ),
    labelMedium: TextStyle(
      fontFamily: fontFamily,
      fontWeight: FontWeight.w500,
      fontSize: 13,
    ),
  );
}
