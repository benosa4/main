import 'package:flutter/material.dart';
import '../models/work.dart';

class WorkMetaHeader extends StatelessWidget {
  final Work work;

  // Кнопки для book
  final VoidCallback onDictate;
  final VoidCallback onEdit;

  // Кнопки для mindmap
  final VoidCallback? onOpenMap;
  final VoidCallback? onAddNode;

  final VoidCallback? onMore;

  const WorkMetaHeader({
    super.key,
    required this.work,
    required this.onDictate,
    required this.onEdit,
    this.onOpenMap,
    this.onAddNode,
    this.onMore,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isCompact = constraints.maxWidth < 520;
          final actionButtons = Wrap(
            spacing: 8,
            runSpacing: 8,
            alignment: isCompact ? WrapAlignment.start : WrapAlignment.end,
            children: work.isMindmap
                ? [
                    // mindmap actions
                    ElevatedButton.icon(
                      onPressed: onOpenMap,
                      icon: const Icon(Icons.account_tree_rounded),
                      label: const Text('Открыть карту'),
                    ),
                    OutlinedButton.icon(
                      onPressed: onAddNode,
                      icon: const Icon(Icons.add_circle_outline),
                      label: const Text('Добавить узел'),
                    ),
                  ]
                : [
                    // book actions
                    ElevatedButton.icon(
                      onPressed: onDictate,
                      icon: const Icon(Icons.mic_none_rounded),
                      label: const Text('Диктовать'),
                    ),
                    OutlinedButton.icon(
                      onPressed: onEdit,
                      icon: const Icon(Icons.edit_outlined),
                      label: const Text('Редактировать'),
                    ),
                  ],
          );

          if (isCompact) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: _TitleAndTags(work: work)),
                    PopupMenuButton<String>(
                      tooltip: 'Ещё',
                      onSelected: (_) => onMore?.call(),
                      itemBuilder: (_) => const [
                        PopupMenuItem(value: 'rename', child: Text('Переименовать')),
                        PopupMenuItem(value: 'share', child: Text('Поделиться')),
                        PopupMenuItem(value: 'export', child: Text('Экспорт')),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _StatsRow(work: work),
                const SizedBox(height: 12),
                actionButtons,
              ],
            );
          }

          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: _TitleAndTags(work: work)),
              const SizedBox(width: 12),
              Flexible(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    _StatsRow(work: work),
                    const SizedBox(height: 12),
                    actionButtons,
                  ],
                ),
              ),
              const SizedBox(width: 8),
              PopupMenuButton<String>(
                tooltip: 'Ещё',
                onSelected: (_) => onMore?.call(),
                itemBuilder: (_) => const [
                  PopupMenuItem(value: 'rename', child: Text('Переименовать')),
                  PopupMenuItem(value: 'share', child: Text('Поделиться')),
                  PopupMenuItem(value: 'export', child: Text('Экспорт')),
                ],
              ),
            ],
          );
        },
      ),
    );
  }
}

class _TitleAndTags extends StatelessWidget {
  final Work work;
  const _TitleAndTags({required this.work});

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Заголовок + бейдж «Майндмап» при необходимости
        Row(
          children: [
            Expanded(
              child: Text(
                work.title,
                style: t.textTheme.titleLarge!.copyWith(fontWeight: FontWeight.w800),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (work.isMindmap) ...[
              const SizedBox(width: 8),
              _mmBadge(),
            ],
          ],
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: work.tags.map((tg) => _tag(tg)).toList(),
        ),
      ],
    );
  }

  static Widget _mmBadge() {
    // Бейдж «Майндмап» — бирюзовый контур с мягкой подложкой
    const c = Color(0xFF06B6D4);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: c.withOpacity(.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: c.withOpacity(.35)),
      ),
      child: const Text('Майндмап', style: TextStyle(color: c, fontWeight: FontWeight.w700)),
    );
  }

  static Widget _tag(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: text.hashCode.isEven
            ? const Color(0xFF7C3AED).withOpacity(.12)
            : const Color(0xFF06B6D4).withOpacity(.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: text.hashCode.isEven ? const Color(0xFF7C3AED) : const Color(0xFF06B6D4),
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  final Work work;
  const _StatsRow({required this.work});

  @override
  Widget build(BuildContext context) {
    final gray = Colors.black.withOpacity(.55);
    final statsText = StringBuffer()
      ..write('${_fmt(work.words)} ${work.wordsLabel}')
      ..write(' • ${work.sections} ${work.kindLabel}')
      ..write(' • Обновлено ${_updatedAgo(work.updatedAt)}');
    return Text(
      statsText.toString(),
      style: TextStyle(color: gray),
    );
  }

  static String _updatedAgo(DateTime ts) {
    final d = DateTime.now().difference(ts);
    if (d.inMinutes < 60) return '${d.inMinutes} мин назад';
    if (d.inHours < 24) return '${d.inHours} ч назад';
    return '${d.inDays} дн назад';
  }

  static String _fmt(int n) {
    final s = n.toString();
    final buf = StringBuffer();
    for (int i = 0; i < s.length; i++) {
      final p = s.length - i;
      buf.write(s[i]);
      if (p > 1 && p % 3 == 1) buf.write(' ');
    }
    return buf.toString();
  }
}
