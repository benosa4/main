import 'package:flutter/material.dart';
import '../models/chapter.dart';

class ChapterCard extends StatelessWidget {
  final Chapter ch;
  final VoidCallback onRead;
  final VoidCallback onEditOrContinue;
  final VoidCallback onVoice;
  final VoidCallback? onOpen;

  const ChapterCard({
    super.key,
    required this.ch,
    required this.onRead,
    required this.onEditOrContinue,
    required this.onVoice,
    this.onOpen,
  });

  @override
  Widget build(BuildContext context) {
    final gray = Colors.black.withOpacity(.55);
    final (badgeBg, badgeIcon, badgeText) = _badge(ch.status);
    final cardBg = ch.status == ChapterStatus.inProgress
        ? const Color(0xFFFFF8E1) // мягкий жёлтый для «в работе»
        : null;

    return Card(
      color: cardBg,
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onOpen,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 12, 8, 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _statusBadge(badgeBg, badgeIcon),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _titleRow(ch),
                    const SizedBox(height: 4),
                    Text('${_fmt(ch.words)} слов • ${_statusText(ch.status)}',
                        style: TextStyle(color: gray)),
                    const SizedBox(height: 8),
                    Text(ch.excerpt, maxLines: 2, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _pillBtn(context, Icons.menu_book_outlined, 'Читать', onRead),
                        _pillBtn(
                          context,
                          ch.status == ChapterStatus.done ? Icons.edit_outlined : Icons.play_arrow_rounded,
                          ch.status == ChapterStatus.done ? 'Редактировать' : 'Продолжить',
                          onEditOrContinue,
                        ),
                        _pillOutlineBtn(
                          context,
                          Icons.graphic_eq_rounded,
                          ch.status == ChapterStatus.done ? 'Озвучить' : 'Диктовать',
                          onVoice,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 4),
              const Icon(Icons.chevron_right_rounded, color: Colors.black26),
            ],
          ),
        ),
      ),
    );
  }

  static Widget _titleRow(Chapter ch) {
    return Row(
      children: [
        Flexible(
          child: Text(
            ch.title,
            style: const TextStyle(fontWeight: FontWeight.w800),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  static Widget _statusBadge(Color bg, IconData icon) {
    return Container(
      width: 28,
      height: 28,
      decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
      child: Icon(icon, size: 18, color: Colors.white),
    );
  }

  static (Color, IconData, String) _badge(ChapterStatus s) {
    switch (s) {
      case ChapterStatus.done:
        return (const Color(0xFF10B981), Icons.check_rounded, 'Завершена');
      case ChapterStatus.inProgress:
        return (const Color(0xFFF59E0B), Icons.push_pin, 'В работе');
      case ChapterStatus.todo:
        return (const Color(0xFF9CA3AF), Icons.circle_outlined, 'К началу');
    }
  }

  static String _statusText(ChapterStatus s) {
    switch (s) {
      case ChapterStatus.done:
        return 'Завершена';
      case ChapterStatus.inProgress:
        return 'В работе';
      case ChapterStatus.todo:
        return 'Черновик';
    }
  }

  static Widget _pillBtn(BuildContext ctx, IconData ic, String label, VoidCallback onTap) {
    return ElevatedButton.icon(
      onPressed: onTap,
      icon: Icon(ic, size: 18),
      label: Text(label),
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      ),
    );
  }

  static Widget _pillOutlineBtn(BuildContext ctx, IconData ic, String label, VoidCallback onTap) {
    return OutlinedButton.icon(
      onPressed: onTap,
      icon: Icon(ic, size: 18),
      label: Text(label),
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      ),
    );
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
