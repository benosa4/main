import 'dart:ui' show lerpDouble;

import 'package:flutter/material.dart';

class CollapsiblePromoHeader extends SliverPersistentHeaderDelegate {
  CollapsiblePromoHeader({
    required this.onCreate,
    required this.micGranted,
    required this.storageGranted,
    required this.notifGranted,
    required this.onAskMic,
    required this.onAskStorage,
    required this.onAskNotif,
    this.max = 240,
    this.min = 76,
  });

  final VoidCallback onCreate;
  final bool micGranted, storageGranted, notifGranted;
  final VoidCallback onAskMic, onAskStorage, onAskNotif;
  final double max, min;

  @override
  double get minExtent => min;

  @override
  double get maxExtent => max;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    final t = (1.0 - (shrinkOffset / (maxExtent - minExtent))).clamp(0.0, 1.0);

    final pad = lerpDouble(16, 12, 1 - t)!;
    final radius = lerpDouble(16, 12, 1 - t)!;
    final titleSize = lerpDouble(18, 16, 1 - t)!;
    final subtitleOpacity = t;
    final chipsOpacity = t;
    final bigMicOpacity = t;
    final collapsedOpacity = 1 - t;

    return Container(
      color: Theme.of(context).scaffoldBackgroundColor,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF7C3AED), Color(0xFFA78BFA)],
            ),
          ),
          child: Stack(
            children: [
              Opacity(
                opacity: subtitleOpacity,
                child: Padding(
                  padding: EdgeInsets.all(pad),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: const [
                                Icon(Icons.mic_none, color: Colors.white70),
                                SizedBox(width: 8),
                                Text(
                                  'Начните создавать',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Превратите мысли в структурированную коллекцию с помощью голосовых команд и ИИ.',
                              style: TextStyle(color: Colors.white, height: 1.25),
                            ),
                            const SizedBox(height: 10),
                            Opacity(
                              opacity: chipsOpacity,
                              child: Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: [
                                  _permChip('Микрофон', micGranted, onAskMic),
                                  _permChip('Хранилище', storageGranted, onAskStorage),
                                  _permChip('Уведомления', notifGranted, onAskNotif),
                                ],
                              ),
                            ),
                            const SizedBox(height: 12),
                            _primaryCreateBtn(onCreate),
                          ],
                        ),
                      ),
                      Opacity(
                        opacity: bigMicOpacity,
                        child: Container(
                          margin: const EdgeInsets.only(left: 12),
                          width: 72,
                          height: 96,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.graphic_eq_rounded,
                            color: Colors.white,
                            size: 36,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Opacity(
                opacity: collapsedOpacity,
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: pad, vertical: 12),
                  alignment: Alignment.centerLeft,
                  child: Row(
                    children: [
                      const Icon(Icons.mic_none_rounded, color: Colors.white),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Голос + ИИ для быстрых набросков',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: titleSize,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      _collapsedCreateBtn(onCreate),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  static Widget _primaryCreateBtn(VoidCallback onTap) {
    return ElevatedButton.icon(
      onPressed: onTap,
      style: ElevatedButton.styleFrom(
        foregroundColor: const Color(0xFF7C3AED),
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
      icon: const Icon(Icons.add),
      label: const Text(
        'Создать новую коллекцию',
        style: TextStyle(fontWeight: FontWeight.w700),
      ),
    );
  }

  static Widget _collapsedCreateBtn(VoidCallback onTap) {
    return TextButton.icon(
      onPressed: onTap,
      style: TextButton.styleFrom(
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        backgroundColor: Colors.white.withOpacity(.15),
      ),
      icon: const Icon(Icons.add, size: 18),
      label: const Text('Новая', style: TextStyle(fontWeight: FontWeight.w700)),
    );
  }

  static Widget _permChip(String text, bool granted, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(granted ? .2 : .1),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: Colors.white.withOpacity(granted ? .0 : .35)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              granted ? Icons.check_circle : Icons.lock_outline,
              size: 16,
              color: Colors.white,
            ),
            const SizedBox(width: 6),
            Text(
              text,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  bool shouldRebuild(covariant CollapsiblePromoHeader oldDelegate) {
    return oldDelegate.micGranted != micGranted ||
        oldDelegate.storageGranted != storageGranted ||
        oldDelegate.notifGranted != notifGranted;
  }
}
