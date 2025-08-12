import React, { useMemo } from 'react';
import appSettingsStore from '../config/appSettings';

const VIDEO_EXTS = ['.mp4', '.webm', '.ogg', '.mov'];
function isVideoUrl(url: string, mime?: string): boolean {
  if (mime && mime.toLowerCase().startsWith('video/')) return true;
  try {
    if (url.startsWith('data:video/')) return true;
    const u = new URL(url, window.location.origin);
    const path = u.pathname.toLowerCase();
    return VIDEO_EXTS.some((ext) => path.endsWith(ext));
  } catch {
    return VIDEO_EXTS.some((ext) => url.toLowerCase().includes(ext));
  }
}

export function isVideoLike(url: string, mime?: string): boolean {
  return isVideoUrl(url, mime);
}

export default function MediaVideo({ url, className, mime }: { url: string; className?: string; mime?: string }) {
  const autoplay = appSettingsStore.state.animations && appSettingsStore.state.animationPrefs.autoplay.video;
  const isVideo = useMemo(() => isVideoUrl(url, mime), [url, mime]);
  if (!isVideo) return (
    <a href={url} target="_blank" rel="noreferrer" className="underline">{url}</a>
  );
  return (
    <video
      src={url}
      className={className}
      controls={!autoplay}
      autoPlay={autoplay}
      muted={autoplay}
      loop={autoplay}
      playsInline
      preload={autoplay ? 'auto' : 'metadata'}
    />
  );
}
