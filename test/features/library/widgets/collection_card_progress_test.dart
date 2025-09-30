import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:voicebook/features/library/widgets/collection_card.dart';
import 'package:voicebook/shared/tokens/design_tokens.dart';

void main() {
  group('ProgressPill.paletteFor', () {
    test('returns neutral palette for <30%', () {
      final palette = ProgressPill.paletteFor(15);
      expect(palette.foreground, AppColors.neutralGrey);
      expect(palette.background,
          AppColors.neutralGrey.withOpacity(0.14));
    });

    test('returns accent palette for 30-69%', () {
      final palette = ProgressPill.paletteFor(55);
      expect(palette.foreground, AppColors.accent);
      expect(palette.background, AppColors.accent.withOpacity(0.15));
    });

    test('returns primary palette for 70-99%', () {
      final palette = ProgressPill.paletteFor(80);
      expect(palette.foreground, AppColors.primary);
      expect(palette.background, AppColors.primary.withOpacity(0.15));
    });

    test('returns success palette for 100%', () {
      final palette = ProgressPill.paletteFor(100);
      expect(palette.foreground, AppColors.success);
      expect(palette.background, AppColors.success.withOpacity(0.16));
    });
  });

  testWidgets('ProgressPill renders with tooltip and styles', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Center(
            child: ProgressPill(progress: 72),
          ),
        ),
      ),
    );

    final tooltip = tester.widget<Tooltip>(find.byType(Tooltip));
    expect(tooltip.message,
        'Прогресс рассчитывается по заполненности разделов (ИИ и ручной ввод)');

    expect(find.text('72% готово'), findsOneWidget);

    final containerFinder = find.descendant(
      of: find.byType(ProgressPill),
      matching: find.byWidgetPredicate((widget) =>
          widget is Container && widget.decoration is BoxDecoration),
    );
    final container = tester.widget<Container>(containerFinder.first);
    final decoration = container.decoration! as BoxDecoration;

    final palette = ProgressPill.paletteFor(72);
    expect(decoration.color, palette.background);
    expect((decoration.border as Border).top.color,
        palette.foreground.withOpacity(0.3));
  });
}
