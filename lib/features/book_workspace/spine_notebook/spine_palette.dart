import 'package:flutter/material.dart';

const List<Color> kSpinePastelPalette = <Color>[
  Color(0xFFE8E7FE),
  Color(0xFFEDE6FB),
  Color(0xFFE6FAFD),
  Color(0xFFEFFBF2),
  Color(0xFFFFF3E4),
  Color(0xFFFFE9ED),
  Color(0xFFE6F0FF),
  Color(0xFFEAF7FF),
  Color(0xFFF2E7FF),
  Color(0xFFE7FFF6),
];

Color spineAccentFor(String id) {
  if (id.isEmpty) {
    return kSpinePastelPalette.first;
  }
  final int hash = id.codeUnits.fold<int>(0, (acc, unit) => (acc * 31 + unit) & 0x7fffffff);
  return kSpinePastelPalette[hash % kSpinePastelPalette.length];
}
