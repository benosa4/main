import 'package:flutter/material.dart';

enum WorkType { book, mindmap }

class Work {
  final String id;
  final String title;
  final WorkType type; // book | mindmap
  final List<String> tags; // «Детектив», «Мистика»...
  final int words; // суммарно слов
  final int sections; // главы или узлы
  final DateTime updatedAt;
  final IconData icon; // для обложки/заглушек

  const Work({
    required this.id,
    required this.title,
    required this.type,
    required this.tags,
    required this.words,
    required this.sections,
    required this.updatedAt,
    this.icon = Icons.menu_book_outlined,
  });

  bool get isMindmap => type == WorkType.mindmap;
  String get kindLabel => isMindmap ? 'узлов' : 'глав';
  String get contentTitle => isMindmap ? 'Содержимое майндмапа' : 'Оглавление';
  String get wordsLabel => 'слова';
}
