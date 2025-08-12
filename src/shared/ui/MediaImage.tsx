import React, { useEffect, useMemo, useState } from 'react';
import appSettingsStore from '../config/appSettings';

function isGif(url: string, mime?: string): boolean {
  if (mime && mime.toLowerCase().includes('image/gif')) return true;
  if (!url) return false;
  try {
    if (url.startsWith('data:')) {
      return url.startsWith('data:image/gif');
    }
    const u = new URL(url, window.location.origin);
    const path = u.pathname.toLowerCase();
    return path.endsWith('.gif');
  } catch {
    return /\.gif($|\?)/i.test(url);
  }
}

export default function MediaImage({ url, alt, className, mime }: { url: string; alt?: string; className?: string; mime?: string }) {
  const autoplayGif = appSettingsStore.state.animations && appSettingsStore.state.animationPrefs.autoplay.gif;
  const gif = useMemo(() => isGif(url, mime), [url, mime]);
  const [show, setShow] = useState(autoplayGif || !gif);
  const [thumb, setThumb] = useState<string | null>(null);

  // Try to capture the first frame as a poster for GIF when autoplay is off
  useEffect(() => {
    if (!gif || autoplayGif) {
      setThumb(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    // set crossOrigin to try avoid taint for same-origin; if CORS fails, we just fallback
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 1;
        canvas.height = img.naturalHeight || 1;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const data = canvas.toDataURL('image/png');
          if (!cancelled) setThumb(data);
        }
      } catch {
        // canvas may be tainted; ignore and keep placeholder
        if (!cancelled) setThumb(null);
      }
    };
    img.src = url;
    return () => { cancelled = true; };
  }, [gif, autoplayGif, url]);

  if (!gif || autoplayGif || show) {
    return <img src={url} alt={alt || ''} className={className} />;
  }

  // Paused GIF placeholder
  return (
    <button
      type="button"
      onClick={() => setShow(true)}
      className={`relative overflow-hidden bg-black/30 flex items-center justify-center ${className || ''}`}
      style={{ minWidth: 160, minHeight: 120 }}
      aria-label="Play GIF"
    >
      {thumb && <img src={thumb} alt={alt || ''} className="absolute inset-0 w-full h-full object-contain" />}
      {!thumb && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="px-3 py-1 rounded-full bg-black/60 text-white text-xs tracking-wide">GIF</div>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-2xl">►</span>
      </div>
    </button>
  );
}
