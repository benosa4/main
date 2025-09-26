import 'package:equatable/equatable.dart';

import 'ids.dart';

enum AsrMode { live, batch }

class AsrSession extends Equatable {
  const AsrSession({
    required this.id,
    required this.lang,
    required this.mode,
    required this.startedAt,
  });

  final ID id;
  final String lang;
  final AsrMode mode;
  final DateTime startedAt;

  @override
  List<Object?> get props => [id, lang, mode, startedAt];
}
