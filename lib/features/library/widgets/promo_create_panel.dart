import 'package:flutter/material.dart';

import 'package:voicebook/shared/tokens/design_tokens.dart';

class PromoCreatePanel extends StatelessWidget {
  const PromoCreatePanel({
    super.key,
    required this.onCreate,
    required this.onRequestMicrophone,
    required this.onRequestStorage,
    required this.onRequestNotifications,
    required this.microphoneGranted,
    required this.storageGranted,
    required this.notificationsGranted,
  });

  final VoidCallback onCreate;
  final VoidCallback onRequestMicrophone;
  final VoidCallback onRequestStorage;
  final VoidCallback onRequestNotifications;
  final bool microphoneGranted;
  final bool storageGranted;
  final bool notificationsGranted;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [AppColors.primary, AppColors.secondary],
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.18),
              blurRadius: 26,
              offset: const Offset(0, 16),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth > 640;
              final content = <Widget>[
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: const [
                              Icon(Icons.mic, color: Colors.white70),
                              SizedBox(width: 8),
                              Text(
                                'Начните создавать',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 20,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'Превратите мысли в структурированную коллекцию с помощью голосовых команд и ИИ.',
                            style: TextStyle(
                              color: Colors.white,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 14),
                          Wrap(
                            spacing: 10,
                            runSpacing: 10,
                            children: [
                              _PermissionChip(
                                label: 'Микрофон',
                                granted: microphoneGranted,
                                onTap: onRequestMicrophone,
                              ),
                              _PermissionChip(
                                label: 'Хранилище',
                                granted: storageGranted,
                                onTap: onRequestStorage,
                              ),
                              _PermissionChip(
                                label: 'Уведомления',
                                granted: notificationsGranted,
                                onTap: onRequestNotifications,
                              ),
                            ],
                          ),
                          const SizedBox(height: 18),
                          SizedBox(
                            height: 46,
                            child: ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: AppColors.primary,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 18),
                              ),
                              onPressed: onCreate,
                              icon: const Icon(Icons.add),
                              label: const Text(
                                'Создать новую коллекцию',
                                style: TextStyle(fontWeight: FontWeight.w700),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (isWide) ...[
                      const SizedBox(width: 24),
                      const _MicIllustration(),
                    ],
                  ],
                ),
                if (!isWide) ...[
                  const SizedBox(height: 20),
                  const _MicIllustration(),
                ],
              ];

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: content,
              );
            },
          ),
        ),
      ),
    );
  }
}

class _PermissionChip extends StatelessWidget {
  const _PermissionChip({
    required this.label,
    required this.granted,
    required this.onTap,
  });

  final String label;
  final bool granted;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final background = granted
        ? Colors.white.withOpacity(0.22)
        : Colors.white.withOpacity(0.08);
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

class _MicIllustration extends StatelessWidget {
  const _MicIllustration();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.18),
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Icon(Icons.mic_none, color: Colors.white, size: 64),
    );
  }
}
