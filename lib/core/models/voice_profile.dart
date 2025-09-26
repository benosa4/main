import 'package:equatable/equatable.dart';

import 'ids.dart';

enum VoiceProfileStatus { training, ready, failed }

class VoiceProfile extends Equatable {
  const VoiceProfile({
    required this.id,
    required this.name,
    required this.kind,
    required this.locale,
    required this.status,
    this.isConsentGiven = false,
  });

  final ID id;
  final String name;
  final String kind;
  final String locale;
  final VoiceProfileStatus status;
  final bool isConsentGiven;

  VoiceProfile copyWith({
    String? name,
    String? kind,
    String? locale,
    VoiceProfileStatus? status,
    bool? isConsentGiven,
  }) {
    return VoiceProfile(
      id: id,
      name: name ?? this.name,
      kind: kind ?? this.kind,
      locale: locale ?? this.locale,
      status: status ?? this.status,
      isConsentGiven: isConsentGiven ?? this.isConsentGiven,
    );
  }

  @override
  List<Object?> get props => [id, name, kind, locale, status, isConsentGiven];
}
