import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:async/async.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:stream_channel/stream_channel.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

final dictationGatewayProvider = Provider<DictationGateway>((ref) {
  return MockDictationGateway();
});

abstract class DictationGateway {
  Future<DictationSession> openSession();
}

class DictationSession {
  DictationSession(this.channel, this._cleanup);

  final WebSocketChannel channel;
  final Future<void> Function() _cleanup;

  Future<void> dispose() => _cleanup();
}

class DictationFrame {
  const DictationFrame({
    required this.id,
    required this.text,
    required this.status,
  });

  final String id;
  final String text;
  final DictationFrameStatus status;
}

enum DictationFrameStatus { stream, commit, finalised }

class MockDictationGateway implements DictationGateway {
  MockDictationGateway({this.latency = const Duration(milliseconds: 160)})
      : _random = Random.secure();

  final Duration latency;
  final Random _random;

  @override
  Future<DictationSession> openSession() async {
    final controller = StreamChannelController<dynamic>(allowForeignErrors: false, sync: true);
    final timers = <Timer>[];
    final channel = _MockWebSocketChannel(controller);

    void cancelTimers() {
      for (final timer in timers) {
        if (timer.isActive) {
          timer.cancel();
        }
      }
      timers.clear();
    }

    controller.local.stream.listen((message) {
      if (message is! String) {
        return;
      }
      try {
        final data = jsonDecode(message) as Map<String, dynamic>;
        if (data['type'] == 'start') {
          cancelTimers();
          _announce(controller.local.sink, 'connecting');
          timers.add(Timer(latency, () {
            _announce(controller.local.sink, 'listening');
            _scheduleScript(controller.local.sink, timers);
          }));
        } else if (data['type'] == 'audio') {
          _scheduleAdditionalPhrase(controller.local.sink, timers);
        } else if (data['type'] == 'stop') {
          cancelTimers();
          _announce(controller.local.sink, 'stopped');
        }
      } catch (error, stackTrace) {
        if (kDebugMode) {
          // ignore: avoid_print
          print('MockDictationGateway decode error: $error\n$stackTrace');
        }
      }
    });

    Future<void> cleanup() async {
      cancelTimers();
      await controller.local.sink.close();
    }

    return DictationSession(channel, cleanup);
  }

  void _announce(StreamSink<dynamic> sink, String state) {
    sink.add(jsonEncode({'type': 'state', 'state': state}));
  }

  void _scheduleScript(StreamSink<dynamic> sink, List<Timer> timers) {
    const baseScripts = [
      [
        _ScriptFrame(duration: Duration(milliseconds: 420), status: DictationFrameStatus.stream,
            text: 'Вчера вечером мы собрали черновики сессии.'),
        _ScriptFrame(duration: Duration(milliseconds: 520), status: DictationFrameStatus.stream,
            text: 'Вчера вечером мы собрали черновики сессии и нашли сильные цитаты.'),
        _ScriptFrame(duration: Duration(milliseconds: 560), status: DictationFrameStatus.commit,
            text: 'Вчера вечером мы собрали черновики сессии и нашли сильные цитаты из интервью.'),
        _ScriptFrame(duration: Duration(milliseconds: 720), status: DictationFrameStatus.finalised,
            text: 'Вчера вечером мы собрали черновики сессии и нашли сильные цитаты из интервью.'),
      ],
      [
        _ScriptFrame(duration: Duration(milliseconds: 400), status: DictationFrameStatus.stream,
            text: 'Теперь добавим переход к следующей сцене.'),
        _ScriptFrame(duration: Duration(milliseconds: 480), status: DictationFrameStatus.commit,
            text: 'Теперь добавим переход к следующей сцене с упоминанием ведущей.'),
        _ScriptFrame(duration: Duration(milliseconds: 660), status: DictationFrameStatus.finalised,
            text: 'Теперь добавим переход к следующей сцене с упоминанием ведущей и атмосферного шума станции.'),
      ],
    ];

    var accumulatedDelay = Duration.zero;
    var phraseIndex = 0;
    for (final phrase in baseScripts) {
      phraseIndex += 1;
      var phraseDelay = Duration.zero;
      for (final frame in phrase) {
        phraseDelay += frame.duration;
        final scheduledAt = accumulatedDelay + phraseDelay;
        final frameId = 'phrase-$phraseIndex';
        timers.add(Timer(scheduledAt, () {
          sink.add(
            jsonEncode({
              'type': 'frame',
              'id': frameId,
              'status': frame.status.name,
              'text': frame.text,
            }),
          );
          if (frame.status == DictationFrameStatus.finalised) {
            sink.add(jsonEncode({'type': 'commit', 'id': frameId}));
          }
        }));
      }
      accumulatedDelay += phraseDelay + const Duration(milliseconds: 520);
    }

    timers.add(Timer(accumulatedDelay + const Duration(milliseconds: 320), () {
      _announce(sink, 'completed');
    }));
  }

  void _scheduleAdditionalPhrase(StreamSink<dynamic> sink, List<Timer> timers) {
    final frameId = 'phrase-${_random.nextInt(9999)}';
    const frames = [
      _ScriptFrame(duration: Duration(milliseconds: 360), status: DictationFrameStatus.stream,
          text: 'Также отмечаем эмоции собеседников.'),
      _ScriptFrame(duration: Duration(milliseconds: 540), status: DictationFrameStatus.finalised,
          text: 'Также отмечаем эмоции собеседников и их реакцию на туман станции.'),
    ];
    var accumulated = Duration.zero;
    for (final frame in frames) {
      accumulated += frame.duration;
      timers.add(Timer(accumulated, () {
        sink.add(
          jsonEncode({
            'type': 'frame',
            'id': frameId,
            'status': frame.status.name,
            'text': frame.text,
          }),
        );
        if (frame.status == DictationFrameStatus.finalised) {
          sink.add(jsonEncode({'type': 'commit', 'id': frameId}));
        }
      }));
    }
  }
}

class _MockWebSocketChannel implements WebSocketChannel {
  _MockWebSocketChannel(this._controller);

  final StreamChannelController<dynamic> _controller;
  WebSocketSink? _sink;

  StreamChannel<dynamic> get _channel => _controller.foreign;

  @override
  Stream<dynamic> get stream => _channel.stream;

  @override
  WebSocketSink get sink => _sink ??= _MockWebSocketSink(_channel.sink);

  @override
  Future<void> get ready => Future<void>.value();

  @override
  String? get protocol => null;

  @override
  StreamChannel<S> cast<S>() => _channel.cast<S>();

  @override
  StreamChannel<dynamic> changeSink(
    StreamSink<dynamic> Function(StreamSink<dynamic>) change,
  ) =>
      _channel.changeSink(change);

  @override
  StreamChannel<dynamic> changeStream(
    Stream<dynamic> Function(Stream<dynamic>) change,
  ) =>
      _channel.changeStream(change);

  @override
  void pipe(StreamChannel<dynamic> other) => _channel.pipe(other);

  @override
  StreamChannel<S> transform<S>(StreamChannelTransformer<S, dynamic> transformer) =>
      _channel.transform(transformer);

  @override
  StreamChannel<dynamic> transformSink(
    StreamSinkTransformer<dynamic, dynamic> transformer,
  ) =>
      _channel.transformSink(transformer);

  @override
  StreamChannel<dynamic> transformStream(
    StreamTransformer<dynamic, dynamic> transformer,
  ) =>
      _channel.transformStream(transformer);

  @override
  int? get closeCode => null;

  @override
  String? get closeReason => null;
}

class _MockWebSocketSink implements WebSocketSink {
  _MockWebSocketSink(this._inner);

  final StreamSink<dynamic> _inner;

  @override
  void add(dynamic data) => _inner.add(data);

  @override
  void addError(Object error, [StackTrace? stackTrace]) => _inner.addError(error, stackTrace);

  @override
  Future<void> addStream(Stream<dynamic> stream) => _inner.addStream(stream);

  @override
  Future<void> close([int? closeCode, String? closeReason]) => _inner.close();

  @override
  Future<void> get done => _inner.done;
}

class _ScriptFrame {
  const _ScriptFrame({required this.duration, required this.status, required this.text});

  final Duration duration;
  final DictationFrameStatus status;
  final String text;
}
