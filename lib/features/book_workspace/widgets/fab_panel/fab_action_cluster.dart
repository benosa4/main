import 'dart:ui';

import 'package:flutter/material.dart';

import 'package:voicebook/shared/tokens/design_tokens.dart';

class FabActionCluster extends StatelessWidget {
  const FabActionCluster({
    super.key,
    required this.onToggleRecording,
    required this.onOpenComposer,
    required this.onPreviewTts,
    required this.isRecording,
    required this.isConnecting,
    this.elapsed,
  });

  final VoidCallback onToggleRecording;
  final VoidCallback onOpenComposer;
  final VoidCallback onPreviewTts;
  final bool isRecording;
  final bool isConnecting;
  final Duration? elapsed;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        _SecondaryGlassFab(
          icon: Icons.auto_fix_high,
          label: 'Сформировать текст',
          onPressed: onOpenComposer,
        ),
        const SizedBox(height: 12),
        _SecondaryGlassFab(
          icon: Icons.record_voice_over,
          label: 'Озвучить',
          onPressed: onPreviewTts,
        ),
        const SizedBox(height: 16),
        _MicFab(
          onPressed: onToggleRecording,
          isRecording: isRecording,
          isConnecting: isConnecting,
          elapsed: elapsed,
        ),
      ],
    );
  }
}

class _SecondaryGlassFab extends StatelessWidget {
  const _SecondaryGlassFab({required this.icon, required this.label, required this.onPressed});

  final IconData icon;
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: ElevatedButton.icon(
          onPressed: onPressed,
          icon: Icon(icon, color: const Color(0xFF0F172A)),
          label: Text(label, style: const TextStyle(color: Color(0xFF0F172A))),
          style: ElevatedButton.styleFrom(
            elevation: 6,
            backgroundColor: Colors.white.withOpacity(0.6),
            shadowColor: Colors.black.withOpacity(0.12),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radiusMedium)),
          ),
        ),
      ),
    );
  }
}

class _MicFab extends StatefulWidget {
  const _MicFab({
    required this.onPressed,
    required this.isRecording,
    required this.isConnecting,
    required this.elapsed,
  });

  final VoidCallback onPressed;
  final bool isRecording;
  final bool isConnecting;
  final Duration? elapsed;

  @override
  State<_MicFab> createState() => _MicFabState();
}

class _MicFabState extends State<_MicFab> with SingleTickerProviderStateMixin {
  late final AnimationController _pulseController =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 900))
        ..addStatusListener((status) {
          if (status == AnimationStatus.completed) {
            _pulseController.reverse();
          } else if (status == AnimationStatus.dismissed) {
            _pulseController.forward();
          }
        });

  @override
  void initState() {
    super.initState();
    if (widget.isRecording || widget.isConnecting) {
      _pulseController.forward();
    }
  }

  @override
  void didUpdateWidget(covariant _MicFab oldWidget) {
    super.didUpdateWidget(oldWidget);
    final shouldAnimate = widget.isRecording || widget.isConnecting;
    if (shouldAnimate && !_pulseController.isAnimating) {
      _pulseController.forward();
    } else if (!shouldAnimate && _pulseController.isAnimating) {
      _pulseController.stop();
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final baseColor = AppColors.error;
    final time = widget.elapsed;
    return SizedBox(
      height: 120,
      width: 120,
      child: Stack(
        alignment: Alignment.center,
        children: [
          AnimatedBuilder(
            animation: _pulseController,
            builder: (context, child) {
              final progress = _pulseController.isAnimating ? _pulseController.value : 0.0;
              final scale = 0.92 + progress * 0.18;
              return Transform.scale(
                scale: scale,
                child: Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: baseColor.withOpacity(widget.isRecording ? 0.38 : 0.22), width: 6),
                  ),
                ),
              );
            },
          ),
          FloatingActionButton.large(
            heroTag: 'workspace-mic',
            backgroundColor: widget.isRecording ? baseColor : baseColor.withOpacity(widget.isConnecting ? 0.8 : 1),
            foregroundColor: Colors.white,
            elevation: 8,
            onPressed: widget.onPressed,
            child: Icon(widget.isRecording ? Icons.stop : Icons.mic, size: 32),
          ),
          if (widget.isRecording && time != null)
            Positioned(
              bottom: 6,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.55),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  _format(time),
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                ),
              ),
            ),
        ],
      ),
    );
  }

  String _format(Duration value) {
    final minutes = value.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = value.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }
}
