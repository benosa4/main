enum AnalyticsEvent {
  bookCreated('book_created'),
  chapterCreated('chapter_created'),
  asrStarted('asr_started'),
  asrStopped('asr_stopped'),
  aiComposeApplied('ai_compose_applied'),
  ttsPreviewed('tts_previewed'),
  exportDone('export_done');

  const AnalyticsEvent(this.key);

  final String key;
}
