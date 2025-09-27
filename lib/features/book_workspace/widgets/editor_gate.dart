import 'package:flutter/material.dart';

class EditorGate extends StatefulWidget {
  const EditorGate({
    super.key,
    required this.isOpenInitially,
    required this.placeholder,
    required this.editor,
    required this.onOpen,
    this.controller,
  });

  final bool isOpenInitially;
  final Widget placeholder;
  final Widget editor;
  final VoidCallback onOpen;
  final EditorGateController? controller;

  @override
  State<EditorGate> createState() => _EditorGateState();
}

class _EditorGateState extends State<EditorGate> with SingleTickerProviderStateMixin {
  static const _animationDuration = Duration(milliseconds: 220);

  late bool _open;

  @override
  void initState() {
    super.initState();
    _open = widget.isOpenInitially;
    widget.controller?._attach(this);
  }

  @override
  void didUpdateWidget(covariant EditorGate oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.isOpenInitially != widget.isOpenInitially && !_open) {
      _open = widget.isOpenInitially;
    }
    if (oldWidget.controller != widget.controller) {
      oldWidget.controller?._detach(this);
      widget.controller?._attach(this);
    }
  }

  void open() {
    if (_open) {
      return;
    }
    setState(() => _open = true);
    widget.onOpen();
  }

  @override
  void dispose() {
    widget.controller?._detach(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedSize(
      duration: _animationDuration,
      curve: Curves.easeOutCubic,
      alignment: Alignment.topCenter,
      child: AnimatedSwitcher(
        duration: _animationDuration,
        switchInCurve: Curves.easeOutCubic,
        switchOutCurve: Curves.easeInOutCubic,
        layoutBuilder: (currentChild, previousChildren) {
          return Stack(
            alignment: Alignment.topCenter,
            children: [
              ...previousChildren,
              if (currentChild != null) currentChild,
            ],
          );
        },
        child: _open
            ? KeyedSubtree(key: const ValueKey('editor'), child: widget.editor)
            : KeyedSubtree(key: const ValueKey('placeholder'), child: widget.placeholder),
      ),
    );
  }
}

class EditorGateController {
  _EditorGateState? _state;

  void open() {
    _state?.open();
  }

  void _attach(_EditorGateState state) {
    _state = state;
  }

  void _detach(_EditorGateState state) {
    if (identical(_state, state)) {
      _state = null;
    }
  }
}
