import 'package:flutter/material.dart';

import 'package:voicebook/core/models/notebook.dart';
import 'package:voicebook/shared/tokens/design_tokens.dart';

enum CollectionStatus { inProgress, completed, draft }

enum GradientPreset { bluePurple, purpleLavender, green, red }

class Collection {
  const Collection({
    required this.id,
    required this.title,
    required this.category,
    required this.sectionsCount,
    required this.progress,
    required this.status,
    required this.cover,
    required this.icon,
    required this.updatedAt,
    this.tags = const <String>[],
  });

  final String id;
  final String title;
  final String category;
  final int sectionsCount;
  final int progress;
  final CollectionStatus status;
  final GradientPreset cover;
  final IconData icon;
  final DateTime updatedAt;
  final List<String> tags;

  Collection copyWith({
    String? title,
    String? category,
    int? sectionsCount,
    int? progress,
    CollectionStatus? status,
    GradientPreset? cover,
    IconData? icon,
    DateTime? updatedAt,
    List<String>? tags,
  }) {
    return Collection(
      id: id,
      title: title ?? this.title,
      category: category ?? this.category,
      sectionsCount: sectionsCount ?? this.sectionsCount,
      progress: progress ?? this.progress,
      status: status ?? this.status,
      cover: cover ?? this.cover,
      icon: icon ?? this.icon,
      updatedAt: updatedAt ?? this.updatedAt,
      tags: tags ?? this.tags,
    );
  }

  static Collection fromNotebook(Notebook notebook) {
    final status = _statusFromTags(notebook.tags);
    final category = _resolveCategory(notebook.tags);
    final preset = _presetFromCategory(category);
    final icon = _iconFromCategory(category);
    final progress = _progressFrom(status, notebook);
    final sections = notebook.chapters.clamp(0, 999);
    return Collection(
      id: notebook.id,
      title: notebook.title,
      category: category,
      sectionsCount: sections,
      progress: progress,
      status: status,
      cover: preset,
      icon: icon,
      updatedAt: notebook.updatedAt,
      tags: List<String>.from(notebook.tags),
    );
  }

  static CollectionStatus _statusFromTags(List<String> tags) {
    final normalized = tags.map((tag) => tag.toLowerCase()).toList();
    if (normalized
        .any((tag) => tag.contains('audio') || tag.contains('ready'))) {
      return CollectionStatus.completed;
    }
    if (normalized
        .any((tag) => tag.contains('draft') || tag.contains('чернов'))) {
      return CollectionStatus.draft;
    }
    return CollectionStatus.inProgress;
  }

  static String _resolveCategory(List<String> tags) {
    for (final tag in tags) {
      final lower = tag.toLowerCase();
      if (lower.contains('draft') ||
          lower.contains('ready') ||
          lower.contains('audio')) {
        continue;
      }
      return tag;
    }
    return 'Общие заметки';
  }

  static GradientPreset _presetFromCategory(String category) {
    final lower = category.toLowerCase();
    if (lower.contains('роман') || lower.contains('любов')) {
      return GradientPreset.purpleLavender;
    }
    if (lower.contains('фэнт') || lower.contains('фантаст')) {
      return GradientPreset.bluePurple;
    }
    if (lower.contains('эссе') ||
        lower.contains('науч') ||
        lower.contains('эколог') ||
        lower.contains('non')) {
      return GradientPreset.green;
    }
    if (lower.contains('детект') ||
        lower.contains('трил') ||
        lower.contains('мист')) {
      return GradientPreset.red;
    }
    return GradientPreset.bluePurple;
  }

  static IconData _iconFromCategory(String category) {
    final lower = category.toLowerCase();
    if (lower.contains('роман') || lower.contains('любов')) {
      return Icons.favorite;
    }
    if (lower.contains('фэнт') || lower.contains('фантаст')) {
      return Icons.auto_stories;
    }
    if (lower.contains('эссе') ||
        lower.contains('науч') ||
        lower.contains('эколог') ||
        lower.contains('non')) {
      return Icons.eco_outlined;
    }
    if (lower.contains('детект') ||
        lower.contains('трил') ||
        lower.contains('мист')) {
      return Icons.visibility_outlined;
    }
    return Icons.note_alt_outlined;
  }

  static int _progressFrom(CollectionStatus status, Notebook notebook) {
    if (status == CollectionStatus.completed) {
      return 100;
    }
    if (status == CollectionStatus.draft) {
      return 20;
    }
    if (notebook.words <= 0) {
      return 35;
    }
    final normalized = (notebook.words / 800).clamp(0, 100).round();
    if (normalized >= 95) {
      return 95;
    }
    return normalized.clamp(40, 90);
  }
}

Gradient buildPresetGradient(GradientPreset preset) {
  switch (preset) {
    case GradientPreset.bluePurple:
      return const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFF60A5FA), AppColors.primary],
      );
    case GradientPreset.purpleLavender:
      return const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [AppColors.primary, AppColors.secondary],
      );
    case GradientPreset.green:
      return const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFF34D399), AppColors.success],
      );
    case GradientPreset.red:
      return const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [AppColors.error, Color(0xFFDC2626)],
      );
  }
}
