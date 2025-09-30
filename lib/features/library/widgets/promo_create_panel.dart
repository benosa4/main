import 'package:flutter/material.dart';

import 'package:voicebook/shared/tokens/design_tokens.dart';

class PromoCreatePanel extends StatelessWidget {
  const PromoCreatePanel({
    super.key,
    required this.onCreate,
    required this.micGranted,
    required this.storageGranted,
    required this.notifGranted,
    required this.onAskMic,
    required this.onAskStorage,
    required this.onAskNotif,
    this.compact = false,
  });

  final VoidCallback onCreate;
  final bool micGranted;
  final bool storageGranted;
  final bool notifGranted;
  final VoidCallback onAskMic;
  final VoidCallback onAskStorage;
  final VoidCallback onAskNotif;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final padding = compact ? const EdgeInsets.all(12) : const EdgeInsets.all(16);
    final titleSize = compact ? 16.0 : 18.0;

    return Card(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 0,
      child: Container(
        padding: padding,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [AppColors.primary, AppColors.secondary],
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.mic_none, color: Colors.white70),
                      const SizedBox(width: 8),
                      Text(
                        'Начните создавать',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: titleSize,
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
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _PermissionChip('Микрофон', micGranted, onAskMic),
                      _PermissionChip('Хранилище', storageGranted, onAskStorage),
                      _PermissionChip('Уведомления', notifGranted, onAskNotif),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      backgroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                    onPressed: onCreate,
                    icon: const Icon(Icons.add),
                    label: const Text(
                      'Создать новую коллекцию',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                  ),
                ],
              ),
            ),
            if (!compact) ...[
              const SizedBox(width: 12),
              Container(
                width: 72,
                height: 96,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.graphic_eq_rounded, color: Colors.white, size: 36),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _PermissionChip extends StatelessWidget {
  const _PermissionChip(this.label, this.granted, this.onTap);

  final String label;
  final bool granted;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final background =
        granted ? Colors.white.withOpacity(0.22) : Colors.white.withOpacity(0.08);
    final borderColor =
        granted ? Colors.white.withOpacity(0.0) : Colors.white.withOpacity(0.4);
    final icon = granted ? Icons.check_circle : Icons.lock_outline;

    return InkWell(
      borderRadius: BorderRadius.circular(999),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: background,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: borderColor),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 18, color: Colors.white),
            const SizedBox(width: 6),
            Text(
              label,
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
}

