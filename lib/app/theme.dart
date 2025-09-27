import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:voicebook/shared/tokens/design_tokens.dart';

final themeModeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.system);

final appThemeProvider = Provider<AppTheme>((ref) => const AppTheme());

class AppTheme {
  const AppTheme();

  ThemeData get lightTheme {
    final base = ThemeData.light(useMaterial3: true);
    return base.copyWith(
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surfaceTint: AppColors.primary,
        error: AppColors.error,
      ),
      scaffoldBackgroundColor: Colors.white,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      textTheme: AppTypography.textTheme.copyWith(
        headlineSmall: AppTypography.textTheme.headlineLarge?.copyWith(fontSize: 26, fontWeight: FontWeight.w600),
        bodyMedium: AppTypography.textTheme.bodyLarge?.copyWith(fontSize: 16, height: 1.6),
        labelLarge: AppTypography.textTheme.labelMedium?.copyWith(fontWeight: FontWeight.w600),
      ),
      cardTheme: CardTheme(
        color: Colors.white.withOpacity(0.65),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
          side: const BorderSide(color: AppColors.border),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 3,
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radiusMedium)),
        ),
      ),
      chipTheme: base.chipTheme.copyWith(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.4),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        shape: StadiumBorder(),
      ),
      shadowColor: Colors.black.withOpacity(0.12),
    );
  }

  ThemeData get darkTheme {
    final base = ThemeData.dark(useMaterial3: true);
    final textTheme = AppTypography.textTheme.apply(bodyColor: Colors.white);
    return base.copyWith(
      colorScheme: ColorScheme.fromSeed(
        brightness: Brightness.dark,
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: AppColors.darkSurface,
        error: AppColors.error,
      ),
      scaffoldBackgroundColor: AppColors.darkSurface,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      textTheme: textTheme.copyWith(
        headlineSmall: textTheme.headlineLarge?.copyWith(fontSize: 26, fontWeight: FontWeight.w600),
        bodyMedium: textTheme.bodyLarge?.copyWith(fontSize: 16, height: 1.6),
        labelLarge: textTheme.labelMedium?.copyWith(fontWeight: FontWeight.w600),
      ),
      chipTheme: base.chipTheme.copyWith(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
          borderSide: const BorderSide(color: AppColors.darkBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.4),
        ),
      ),
    );
  }
}
