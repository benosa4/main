import 'package:equatable/equatable.dart';

class AppSettings extends Equatable {
  const AppSettings({
    required this.autoPunctuation,
    required this.defaultLanguage,
    required this.fallbackPolicy,
    required this.aiProvider,
    required this.dailyTokenLimit,
    required this.defaultAiPreset,
    required this.usePersonalVoice,
    required this.defaultVoice,
    required this.syncStrategy,
    required this.voiceCommandsEnabled,
    required this.voiceCommands,
  });

  final bool autoPunctuation;
  final String defaultLanguage;
  final String fallbackPolicy;
  final String aiProvider;
  final int dailyTokenLimit;
  final String defaultAiPreset;
  final bool usePersonalVoice;
  final String defaultVoice;
  final String syncStrategy;
  final bool voiceCommandsEnabled;
  final List<String> voiceCommands;

  AppSettings copyWith({
    bool? autoPunctuation,
    String? defaultLanguage,
    String? fallbackPolicy,
    String? aiProvider,
    int? dailyTokenLimit,
    String? defaultAiPreset,
    bool? usePersonalVoice,
    String? defaultVoice,
    String? syncStrategy,
    bool? voiceCommandsEnabled,
    List<String>? voiceCommands,
  }) {
    return AppSettings(
      autoPunctuation: autoPunctuation ?? this.autoPunctuation,
      defaultLanguage: defaultLanguage ?? this.defaultLanguage,
      fallbackPolicy: fallbackPolicy ?? this.fallbackPolicy,
      aiProvider: aiProvider ?? this.aiProvider,
      dailyTokenLimit: dailyTokenLimit ?? this.dailyTokenLimit,
      defaultAiPreset: defaultAiPreset ?? this.defaultAiPreset,
      usePersonalVoice: usePersonalVoice ?? this.usePersonalVoice,
      defaultVoice: defaultVoice ?? this.defaultVoice,
      syncStrategy: syncStrategy ?? this.syncStrategy,
      voiceCommandsEnabled: voiceCommandsEnabled ?? this.voiceCommandsEnabled,
      voiceCommands: voiceCommands ?? this.voiceCommands,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'autoPunctuation': autoPunctuation,
      'defaultLanguage': defaultLanguage,
      'fallbackPolicy': fallbackPolicy,
      'aiProvider': aiProvider,
      'dailyTokenLimit': dailyTokenLimit,
      'defaultAiPreset': defaultAiPreset,
      'usePersonalVoice': usePersonalVoice,
      'defaultVoice': defaultVoice,
      'syncStrategy': syncStrategy,
      'voiceCommandsEnabled': voiceCommandsEnabled,
      'voiceCommands': voiceCommands,
    };
  }

  factory AppSettings.fromJson(Map<String, dynamic> json) {
    return AppSettings(
      autoPunctuation: json['autoPunctuation'] as bool? ?? true,
      defaultLanguage: json['defaultLanguage'] as String? ?? 'ru-RU',
      fallbackPolicy: json['fallbackPolicy'] as String? ?? 'WS→HTTP→OFFLINE',
      aiProvider: json['aiProvider'] as String? ?? 'Voicebook AI',
      dailyTokenLimit: json['dailyTokenLimit'] as int? ?? 0,
      defaultAiPreset: json['defaultAiPreset'] as String? ?? 'Художественный',
      usePersonalVoice: json['usePersonalVoice'] as bool? ?? false,
      defaultVoice: json['defaultVoice'] as String? ?? 'Night Station v2',
      syncStrategy: json['syncStrategy'] as String? ?? 'cloud',
      voiceCommandsEnabled: json['voiceCommandsEnabled'] as bool? ?? true,
      voiceCommands: [
        for (final value in (json['voiceCommands'] as List<dynamic>? ?? const []))
          value as String,
      ],
    );
  }

  @override
  List<Object?> get props => [
        autoPunctuation,
        defaultLanguage,
        fallbackPolicy,
        aiProvider,
        dailyTokenLimit,
        defaultAiPreset,
        usePersonalVoice,
        defaultVoice,
        syncStrategy,
        voiceCommandsEnabled,
        voiceCommands,
      ];
}
