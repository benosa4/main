import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'events.dart';

final analyticsServiceProvider = Provider<AnalyticsService>((ref) {
  return AnalyticsService();
});

class AnalyticsService {
  Future<void> log(AnalyticsEvent event, [Map<String, Object?>? params]) async {
    // TODO: integrate with analytics backend.
  }
}
