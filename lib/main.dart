import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_web_plugins/url_strategy.dart';

import 'app/app.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  if (kIsWeb) {
    setUrlStrategy(PathUrlStrategy());
  }
  runApp(const ProviderScope(child: VoicebookApp()));
}
