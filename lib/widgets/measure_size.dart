import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

typedef OnWidgetSizeChange = void Function(Size size);

/// Оборачивает любой виджет и сообщает его фактический размер через [onChange].
/// Без лейаут-артефактов, выстреливает при каждом изменении.
class MeasureSize extends SingleChildRenderObjectWidget {
  final OnWidgetSizeChange onChange;

  const MeasureSize({super.key, required this.onChange, required Widget child})
      : super(child: child);

  @override
  RenderObject createRenderObject(BuildContext context) =>
      _RenderMeasureSize(onChange);
}

class _RenderMeasureSize extends RenderProxyBox {
  _RenderMeasureSize(this.onChange);

  final OnWidgetSizeChange onChange;
  Size? _oldSize;

  @override
  void performLayout() {
    super.performLayout();
    final newSize = child?.size;
    if (newSize == null) return;
    if (_oldSize == newSize) return;
    _oldSize = newSize;
    WidgetsBinding.instance.addPostFrameCallback((_) => onChange(newSize));
  }
}
