import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const primary = Color(0xFF6366F1);
  static const secondary = Color(0xFF8B5CF6);
  static const accent = Color(0xFF06B6D4);
  static const error = Color(0xFFDF3F40);
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
