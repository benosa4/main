import 'package:flutter/material.dart';

import '../models/chapter.dart';
import '../models/reading_prefs.dart';
import '../shared/tokens/design_tokens.dart';

const _kAnimationDuration = Duration(milliseconds: 220);
const _kAudienceOptions = ['6+', '12+', '16+', '18+'];
const _kDefaultGenreSuggestions = [
  'Sci-fi',
  'Фэнтези',
  'Детектив',
  'Мистика',
  'Роман',
  'Non-fiction',
];

class ChapterMetaBar extends StatefulWidget {
  final ReadingPrefs prefs;
  final String title;
  final int words;
  final ChapterStatus status;
  final String? subtitle;
  final List<String> genres;
  final String? audience;
  final List<String> tags;
  final DateTime? lastSavedAt;
  final bool initiallyExpanded;
  final Future<void> Function(ChapterMetaResult result)? onSave;
  final VoidCallback? onMore;
  final PopupMenuItemBuilder<String>? menuBuilder;
  final ValueChanged<String>? onMenuSelected;
  final String? menuTooltip;
  final List<String> genreSuggestions;

  const ChapterMetaBar({
    super.key,
    required this.prefs,
    required this.title,
    required this.words,
    required this.status,
    this.subtitle,
    this.genres = const [],
    this.audience,
    this.tags = const [],
    this.lastSavedAt,
    this.initiallyExpanded = false,
    this.onSave,
    this.onMore,
    this.menuBuilder,
    this.onMenuSelected,
    this.menuTooltip,
    this.genreSuggestions = _kDefaultGenreSuggestions,
  });

  @override
  State<ChapterMetaBar> createState() => _ChapterMetaBarState();
}

class _ChapterMetaBarState extends State<ChapterMetaBar> {
  late bool _expanded;
  late bool _saving;
  late TextEditingController _titleController;
  late List<String> _genres;
  late String _audience;
  late List<String> _tags;
  late ChapterStatus _status;
  DateTime? _lastSaved;

  late String _baselineTitle;
  late List<String> _baselineGenres;
  late String _baselineAudience;
  late List<String> _baselineTags;
  late ChapterStatus _baselineStatus;

  @override
  void initState() {
    super.initState();
    _expanded = widget.initiallyExpanded;
    _saving = false;
    _titleController = TextEditingController(text: widget.title);
    _genres = [...widget.genres];
    _audience = widget.audience ?? _kAudienceOptions[2];
    _tags = [...widget.tags];
    _status = widget.status;
    _lastSaved = widget.lastSavedAt;
    _baselineTitle = widget.title;
    _baselineGenres = [...widget.genres];
    _baselineAudience = widget.audience ?? _kAudienceOptions[2];
    _baselineTags = [...widget.tags];
    _baselineStatus = widget.status;
  }

  @override
  void didUpdateWidget(covariant ChapterMetaBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.title != widget.title && !_expanded && !_saving) {
      _titleController.text = widget.title;
      _baselineTitle = widget.title;
    }
    if (!_listEquals(oldWidget.genres, widget.genres) && !_expanded && !_saving) {
      _genres = [...widget.genres];
      _baselineGenres = [...widget.genres];
    }
    if (oldWidget.audience != widget.audience && !_expanded && !_saving) {
      _audience = widget.audience ?? _kAudienceOptions[2];
      _baselineAudience = widget.audience ?? _kAudienceOptions[2];
    }
    if (!_listEquals(oldWidget.tags, widget.tags) && !_expanded && !_saving) {
      _tags = [...widget.tags];
      _baselineTags = [...widget.tags];
    }
    if (oldWidget.status != widget.status && !_expanded && !_saving) {
      _status = widget.status;
      _baselineStatus = widget.status;
    }
    if (oldWidget.lastSavedAt != widget.lastSavedAt && !_saving) {
      _lastSaved = widget.lastSavedAt;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  void _toggleExpanded() {
    setState(() => _expanded = !_expanded);
  }

  Future<void> _handleSave() async {
    FocusScope.of(context).unfocus();
    final result = ChapterMetaResult(
      title: _titleController.text.trim().isEmpty
          ? _baselineTitle
          : _titleController.text.trim(),
      genres: List.unmodifiable(_genres),
      audience: _audience,
      tags: List.unmodifiable(_tags),
      status: _status,
    );

    setState(() => _saving = true);

    try {
      if (widget.onSave != null) {
        await widget.onSave!(result);
      }
      if (!mounted) return;
      final now = DateTime.now();
      setState(() {
        _saving = false;
        _expanded = false;
        _lastSaved = now;
        _baselineTitle = result.title;
        _baselineGenres = [...result.genres];
        _baselineAudience = result.audience;
        _baselineTags = [...result.tags];
        _baselineStatus = result.status;
        _titleController.text = result.title;
        _genres = [...result.genres];
        _audience = result.audience;
        _tags = [...result.tags];
        _status = result.status;
      });
      final messenger = ScaffoldMessenger.maybeOf(context);
      messenger?.hideCurrentSnackBar();
      messenger?.showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          content: Text('Сохранено · ${_formatTime(now)}'),
        ),
      );
    } catch (error) {
      if (!mounted) return;
      setState(() => _saving = false);
      final messenger = ScaffoldMessenger.maybeOf(context);
      messenger?.hideCurrentSnackBar();
      messenger?.showSnackBar(
        SnackBar(
          backgroundColor: AppColors.error,
          content: const Text('Не удалось сохранить изменения'),
        ),
      );
    }
  }

  void _handleCancel() {
    FocusScope.of(context).unfocus();
    setState(() {
      _expanded = false;
      _titleController.text = _baselineTitle;
      _genres = [..._baselineGenres];
      _audience = _baselineAudience;
      _tags = [..._baselineTags];
      _status = _baselineStatus;
    });
  }

  @override
  Widget build(BuildContext context) {
    final fg = widget.prefs.chromeForeground;
    return Material(
      color: Colors.transparent,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: widget.prefs.chromeGradient,
          border: Border(bottom: BorderSide(color: widget.prefs.chromeBorder)),
        ),
        child: SafeArea(
          bottom: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: AnimatedSize(
              duration: _kAnimationDuration,
              curve: Curves.easeOut,
              alignment: Alignment.topCenter,
              child: AnimatedCrossFade(
                firstChild: SizedBox(
                  width: double.infinity,
                  child: _CollapsedMeta(
                    title: _titleController.text,
                    subtitle: widget.subtitle,
                    fg: fg,
                    words: widget.words,
                    lastSaved: _lastSaved,
                    onTap: _toggleExpanded,
                    onMore: widget.onMore,
                    menuBuilder: widget.menuBuilder,
                    onMenuSelected: widget.onMenuSelected,
                    menuTooltip: widget.menuTooltip,
                  ),
                ),
                secondChild: SizedBox(
                  width: double.infinity,
                  child: _ExpandedMeta(
                    fg: fg,
                    prefs: widget.prefs,
                    titleController: _titleController,
                    saving: _saving,
                    genres: _genres,
                    audience: _audience,
                    tags: _tags,
                    status: _status,
                    onToggle: _toggleExpanded,
                    onGenresChanged: (value) => setState(() => _genres = value),
                    onAudienceChanged: (value) => setState(() => _audience = value),
                    onTagsChanged: (value) => setState(() => _tags = value),
                    onStatusChanged: (value) => setState(() => _status = value),
                    onCancel: _handleCancel,
                    onSave: _handleSave,
                    genreSuggestions: widget.genreSuggestions,
                  ),
                ),
                crossFadeState: _expanded
                    ? CrossFadeState.showSecond
                    : CrossFadeState.showFirst,
                duration: _kAnimationDuration,
                sizeCurve: Curves.easeOut,
              ),
            ),
          ),
        ),
      ),
    );
  }

  bool _listEquals(List<Object?> a, List<Object?> b) {
    if (identical(a, b)) return true;
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (a[i] != b[i]) return false;
    }
    return true;
  }

  String _formatTime(DateTime time) {
    final materialLocalizations = MaterialLocalizations.of(context);
    return materialLocalizations.formatTimeOfDay(TimeOfDay.fromDateTime(time));
  }
}

class _CollapsedMeta extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Color fg;
  final int words;
  final DateTime? lastSaved;
  final VoidCallback onTap;
  final VoidCallback? onMore;
  final PopupMenuItemBuilder<String>? menuBuilder;
  final ValueChanged<String>? onMenuSelected;
  final String? menuTooltip;

  const _CollapsedMeta({
    required this.title,
    required this.subtitle,
    required this.fg,
    required this.words,
    required this.lastSaved,
    required this.onTap,
    required this.onMore,
    required this.menuBuilder,
    required this.onMenuSelected,
    required this.menuTooltip,
  });

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: onTap,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title.isEmpty ? 'Без названия' : title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: fg,
                    ),
                  ),
                  if (subtitle != null && subtitle!.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      subtitle!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: textTheme.bodySmall?.copyWith(
                        color: fg.withOpacity(.75),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Wrap(
          spacing: 8,
          runSpacing: 4,
          children: [
            _MetaChip(
              icon: lastSaved != null
                  ? Icons.check_circle_rounded
                  : Icons.schedule_rounded,
              label: lastSaved != null
                  ? 'Сохранено · ${MaterialLocalizations.of(context).formatTimeOfDay(TimeOfDay.fromDateTime(lastSaved!))}'
                  : 'Черновик',
              fg: fg,
            ),
            _MetaChip(
              icon: Icons.description_outlined,
              label: '${_formatWords(words)} слов',
              fg: fg,
            ),
          ],
        ),
        const SizedBox(width: 4),
        if (menuBuilder != null)
          Padding(
            padding: const EdgeInsets.only(right: 4),
            child: PopupMenuButton<String>(
              tooltip: menuTooltip ?? 'Дополнительно',
              icon: Icon(Icons.more_vert_rounded, color: fg),
              onSelected: onMenuSelected,
              itemBuilder: menuBuilder!,
            ),
          )
        else
          IconButton(
            onPressed: onMore ?? onTap,
            tooltip: menuTooltip ?? 'Дополнительно',
            icon: const Icon(Icons.more_horiz_rounded),
            color: fg,
          ),
        IconButton(
          onPressed: onTap,
          tooltip: 'Развернуть',
          icon: const Icon(Icons.keyboard_arrow_down_rounded),
          color: fg,
        ),
      ],
    );
  }

  static String _formatWords(int value) {
    final raw = value.toString();
    final buffer = StringBuffer();
    for (var i = 0; i < raw.length; i++) {
      final remaining = raw.length - i;
      buffer.write(raw[i]);
      if (remaining > 1 && remaining % 3 == 1) {
        buffer.write(' ');
      }
    }
    return buffer.toString();
  }
}

class _ExpandedMeta extends StatelessWidget {
  final Color fg;
  final ReadingPrefs prefs;
  final TextEditingController titleController;
  final bool saving;
  final List<String> genres;
  final String audience;
  final List<String> tags;
  final ChapterStatus status;
  final VoidCallback onToggle;
  final ValueChanged<List<String>> onGenresChanged;
  final ValueChanged<String> onAudienceChanged;
  final ValueChanged<List<String>> onTagsChanged;
  final ValueChanged<ChapterStatus> onStatusChanged;
  final VoidCallback onCancel;
  final Future<void> Function() onSave;
  final List<String> genreSuggestions;

  const _ExpandedMeta({
    required this.fg,
    required this.prefs,
    required this.titleController,
    required this.saving,
    required this.genres,
    required this.audience,
    required this.tags,
    required this.status,
    required this.onToggle,
    required this.onGenresChanged,
    required this.onAudienceChanged,
    required this.onTagsChanged,
    required this.onStatusChanged,
    required this.onCancel,
    required this.onSave,
    required this.genreSuggestions,
  });

  @override
  Widget build(BuildContext context) {
    final cardGradient = LinearGradient(
      colors: [
        Color.alphaBlend(AppColors.primary.withOpacity(0.08), prefs.chromeBase),
        Color.alphaBlend(AppColors.accent.withOpacity(0.06), prefs.chromeBase),
      ],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );

    return Container(
      decoration: BoxDecoration(
        gradient: cardGradient,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: prefs.chromeBorder),
      ),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: TextField(
                  controller: titleController,
                  textInputAction: TextInputAction.done,
                  decoration: InputDecoration(
                    labelText: 'Заголовок главы',
                    labelStyle: TextStyle(color: fg.withOpacity(.8)),
                    filled: true,
                    fillColor: prefs.isDark
                        ? Colors.black.withOpacity(0.25)
                        : Colors.white.withOpacity(0.7),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    isDense: true,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                onPressed: onToggle,
                tooltip: 'Свернуть',
                icon: const Icon(Icons.keyboard_arrow_up_rounded),
                color: fg,
              ),
            ],
          ),
          const SizedBox(height: 14),
          _Section(
            label: 'Жанры',
            fg: fg,
            child: Wrap(
              spacing: 8,
              runSpacing: -6,
              children: [
                for (final genre in genreSuggestions)
                  FilterChip(
                    label: Text(genre),
                    selected: genres.contains(genre),
                    onSelected: (selected) {
                      final next = [...genres];
                      if (selected) {
                        next.add(genre);
                      } else {
                        next.remove(genre);
                      }
                      onGenresChanged(next.toSet().toList());
                    },
                  ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          _Section(
            label: 'Целевая аудитория',
            fg: fg,
            child: Wrap(
              spacing: 8,
              children: [
                for (final option in _kAudienceOptions)
                  ChoiceChip(
                    label: Text(option),
                    selected: audience == option,
                    onSelected: (_) => onAudienceChanged(option),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          _Section(
            label: 'Статус',
            fg: fg,
            child: Wrap(
              spacing: 8,
              children: [
                ChoiceChip(
                  label: const Text('В работе'),
                  selected: status == ChapterStatus.inProgress,
                  onSelected: (_) => onStatusChanged(ChapterStatus.inProgress),
                ),
                ChoiceChip(
                  label: const Text('Готово'),
                  selected: status == ChapterStatus.done,
                  onSelected: (_) => onStatusChanged(ChapterStatus.done),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          _Section(
            label: 'Теги',
            fg: fg,
            child: Wrap(
              spacing: 8,
              runSpacing: -6,
              children: [
                for (final tag in tags)
                  InputChip(
                    label: Text(tag),
                    onDeleted: () {
                      final next = [...tags]..remove(tag);
                      onTagsChanged(next);
                    },
                  ),
                ActionChip(
                  label: const Text('Добавить'),
                  avatar: const Icon(Icons.add, size: 18),
                  onPressed: () async {
                    final newTag = await _showTagDialog(context);
                    if (newTag == null || newTag.trim().isEmpty) {
                      return;
                    }
                    final clean = newTag.trim();
                    final next = [...tags];
                    if (!next.contains(clean)) {
                      next.add(clean);
                      onTagsChanged(next);
                    }
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: saving ? null : onCancel,
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Отмена'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: saving ? null : onSave,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  icon: saving
                      ? SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white.withOpacity(.9)),
                          ),
                        )
                      : const Icon(Icons.save_outlined),
                  label: Text(saving ? 'Сохранение…' : 'Сохранить'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<String?> _showTagDialog(BuildContext context) {
    final controller = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Новый тег'),
          content: TextField(
            controller: controller,
            autofocus: true,
            decoration: const InputDecoration(hintText: 'Например, «станция»'),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Отмена'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(controller.text),
              child: const Text('Добавить'),
            ),
          ],
        );
      },
    );
  }
}

class _Section extends StatelessWidget {
  final String label;
  final Color fg;
  final Widget child;

  const _Section({
    required this.label,
    required this.fg,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w700,
            color: fg,
          ),
        ),
        const SizedBox(height: 8),
        child,
      ],
    );
  }
}

class _MetaChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color fg;

  const _MetaChip({
    required this.icon,
    required this.label,
    required this.fg,
  });

  @override
  Widget build(BuildContext context) {
    final background = Color.alphaBlend(
      fg.withOpacity(.08),
      Theme.of(context).colorScheme.surface.withOpacity(.7),
    );
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: fg.withOpacity(.12)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: fg.withOpacity(.85)),
          const SizedBox(width: 6),
          Text(
            label,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: fg,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );
  }
}

class ChapterMetaResult {
  final String title;
  final List<String> genres;
  final String audience;
  final List<String> tags;
  final ChapterStatus status;

  const ChapterMetaResult({
    required this.title,
    required this.genres,
    required this.audience,
    required this.tags,
    required this.status,
  });
}
