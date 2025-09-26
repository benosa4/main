import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class OnboardingScreen extends ConsumerWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      body: Stack(
        fit: StackFit.expand,
        children: [
          const _AnimatedGradientBackground(),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const _BrandHeader(),
                  const SizedBox(height: 24),
                  Expanded(
                    child: Column(
                      children: const [
                        Expanded(child: _HeroCarousel()),
                        SizedBox(height: 24),
                        _PermissionRequestRow(),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  const _LanguageSelector(),
                  const SizedBox(height: 24),
                  _PrimaryCta(
                    onPressed: () {
                      // Permissions and navigation handled in controller.
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BenefitSlide extends StatelessWidget {
  const _BenefitSlide({
    required this.title,
    required this.description,
  });

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GlassContainer(
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(title, style: theme.textTheme.headlineLarge),
                const SizedBox(height: 16),
                Text(
                  description,
                  style: theme.textTheme.bodyLarge,
                ),
              ],
            ),
          ),
          const SizedBox(width: 24),
          Expanded(
            flex: 2,
            child: AspectRatio(
              aspectRatio: 4 / 5,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  gradient: const LinearGradient(
                    colors: [Color(0x336366F1), Color(0x338B5CF6)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Center(
                  child: Icon(
                    Icons.auto_awesome,
                    color: theme.colorScheme.primary,
                    size: 72,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AnimatedGradientBackground extends StatefulWidget {
  const _AnimatedGradientBackground();

  @override
  State<_AnimatedGradientBackground> createState() => _AnimatedGradientBackgroundState();
}

class _AnimatedGradientBackgroundState extends State<_AnimatedGradientBackground>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 12),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final t = Curves.easeInOut.transform(_controller.value);
        return DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color.lerp(const Color(0xFF1F2337), const Color(0xFF0B0D12), t)!,
                Color.lerp(const Color(0xFF1B1F30), const Color(0xFF10142B), 1 - t)!,
              ],
            ),
          ),
        );
      },
    );
  }
}

class _BrandHeader extends StatelessWidget {
  const _BrandHeader();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Voicebook', style: theme.textTheme.headlineMedium?.copyWith(color: Colors.white)),
            const SizedBox(height: 4),
            Text(
              'Голос-первый редактор',
              style: theme.textTheme.bodyMedium?.copyWith(color: Colors.white70),
            ),
          ],
        ),
        const CircleAvatar(
          radius: 24,
          backgroundColor: Color(0x336366F1),
          child: Icon(Icons.menu_rounded, color: Colors.white70),
        ),
      ],
    );
  }
}

class _HeroCarousel extends StatefulWidget {
  const _HeroCarousel();

  @override
  State<_HeroCarousel> createState() => _HeroCarouselState();
}

class _HeroCarouselState extends State<_HeroCarousel> {
  final _controller = PageController();
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final slides = const [
      _BenefitSlide(
        title: 'Диктуйте, редактируйте, экспортируйте',
        description: 'Voicebook объединяет запись, AI-редактуру и озвучку в одном пространстве.',
      ),
      _BenefitSlide(
        title: 'Работает офлайн',
        description: 'Последние главы доступны без сети, а прогресс синхронизируется позже.',
      ),
      _BenefitSlide(
        title: 'Ваша студия звучания',
        description: 'Тренируйте персональный голос и создавайте аудиокниги в один клик.',
      ),
    ];

    return Column(
      children: [
        Expanded(
          child: PageView.builder(
            controller: _controller,
            onPageChanged: (value) => setState(() => _index = value),
            itemCount: slides.length,
            itemBuilder: (context, index) => Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: slides[index],
            ),
          ),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            slides.length,
            (i) => AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              height: 6,
              width: i == _index ? 24 : 8,
              decoration: BoxDecoration(
                color: i == _index ? Colors.white : Colors.white24,
                borderRadius: BorderRadius.circular(999),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _PermissionRequestRow extends StatelessWidget {
  const _PermissionRequestRow();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 720;
        final cards = const [
          _PermissionCard(
            icon: Icons.mic_rounded,
            title: 'Микрофон',
            description: 'Точный захват речи и шумоподавление.',
          ),
          _PermissionCard(
            icon: Icons.notifications_active,
            title: 'Уведомления',
            description: 'Напоминания о записях и экспортных задачах.',
          ),
          _PermissionCard(
            icon: Icons.folder_outlined,
            title: 'Файлы',
            description: 'Хранение черновиков и экспорта офлайн.',
          ),
        ];

        if (isWide) {
          return Row(
            children: cards
                .map((card) => Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        child: card,
                      ),
                    ))
                .toList(),
          );
        }

        return Column(
          children: cards
              .map((card) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: card,
                  ))
              .toList(),
        );
      },
    );
  }
}

class _PermissionCard extends StatelessWidget {
  const _PermissionCard({
    required this.icon,
    required this.title,
    required this.description,
  });

  final IconData icon;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GlassContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: Colors.white12,
            child: Icon(icon, color: Colors.white),
          ),
          const SizedBox(height: 16),
          Text(title, style: theme.textTheme.titleLarge?.copyWith(color: Colors.white)),
          const SizedBox(height: 8),
          Text(
            description,
            style: theme.textTheme.bodyMedium?.copyWith(color: Colors.white70),
          ),
          const SizedBox(height: 16),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.white24),
            onPressed: () {},
            child: const Text('Разрешить'),
          ),
        ],
      ),
    );
  }
}

class _LanguageSelector extends StatelessWidget {
  const _LanguageSelector();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final languages = const ['Русский', 'English', 'Deutsch'];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Язык диктовки по умолчанию', style: theme.textTheme.titleMedium?.copyWith(color: Colors.white)),
        const SizedBox(height: 12),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: languages
              .map(
                (lang) => FilterChip(
                  selected: lang == languages.first,
                  onSelected: (_) {},
                  label: Text(lang),
                  selectedColor: Colors.white24,
                  labelStyle: theme.textTheme.bodyMedium?.copyWith(color: Colors.white),
                  backgroundColor: Colors.white12,
                  side: const BorderSide(color: Colors.white24),
                ),
              )
              .toList(),
        ),
      ],
    );
  }
}

class _PrimaryCta extends StatelessWidget {
  const _PrimaryCta({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return FilledButton.icon(
      style: FilledButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: Theme.of(context).colorScheme.primary,
        padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 24),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      ),
      onPressed: onPressed,
      icon: const Icon(Icons.play_arrow_rounded),
      label: const Text('Начать диктовку'),
    );
  }
}

class GlassContainer extends StatelessWidget {
  const GlassContainer({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withOpacity(0.08),
        border: Border.all(color: Colors.white24),
      ),
      child: child,
    );
  }
}
