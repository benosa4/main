import React, { useEffect, useMemo, useState } from 'react';
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

export default function MediaVideo({ url, className, mime, autoDownload = true }: { url: string; className?: string; mime?: string; autoDownload?: boolean }) {
  const autoplay = appSettingsStore.state.animations && appSettingsStore.state.animationPrefs.autoplay.video;
  const isVideo = useMemo(() => isVideoUrl(url, mime), [url, mime]);
  const [poster, setPoster] = useState<string | null>(null);
  const [show, setShow] = useState<boolean>(autoDownload ? autoplay : false);
  const [durationLabel, setDurationLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!isVideo || autoplay) {
      setPoster(null);
      return;
    }
    let cancelled = false;
    try {
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.muted = true;
      vid.preload = 'auto';
      vid.src = url;
      const handleLoaded = () => {
        try {
          const w = vid.videoWidth || 320;
          const h = vid.videoHeight || 180;
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(vid, 0, 0, w, h);
            const data = canvas.toDataURL('image/png');
            if (!cancelled) setPoster(data);
          }
          const dur = Number.isFinite(vid.duration) ? Math.max(0, Math.floor(vid.duration)) : null;
          if (!cancelled && dur != null) {
            const mm = Math.floor(dur / 60).toString();
            const ss = (dur % 60).toString().padStart(2, '0');
            setDurationLabel(`${mm}:${ss}`);
          }
        } catch {
          if (!cancelled) setPoster(null);
        }
        vid.remove();
      };
      vid.addEventListener('loadeddata', handleLoaded, { once: true });
      // Trigger load
      vid.load();
      return () => { cancelled = true; try { vid.remove(); } catch {} };
    } catch {
      setPoster(null);
    }
  }, [url, isVideo, autoplay]);

  if (!isVideo) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="underline">{url}</a>
    );
  }

  if (!show) {
    return (
      <button
        type="button"
        onClick={() => setShow(true)}
        className={`relative overflow-hidden bg-black/30 flex items-center justify-center ${className || ''}`}
        style={{ minWidth: 200, minHeight: 140 }}
        aria-label="Play video"
      >
        {poster && (
          <img src={poster} alt="video poster" className="absolute inset-0 w-full h-full object-contain" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-3xl">►</span>
        </div>
        {durationLabel && (
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] leading-none">
            {durationLabel}
          </div>
        )}
      </button>
    );
  }

  return (
    <video
      src={url}
      className={className}
      controls={!autoplay}
      autoPlay={true}
      muted={true}
      loop={autoplay}
      playsInline
      preload={autoplay ? 'auto' : 'metadata'}
    />
  );
}
