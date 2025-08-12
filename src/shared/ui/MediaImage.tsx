import React, { useMemo, useState } from 'react';
import appSettingsStore from '../config/appSettings';

function isGifUrl(url: string): boolean {
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

export default function MediaImage({ url, alt, className }: { url: string; alt?: string; className?: string }) {
  const autoplayGif = appSettingsStore.state.animations && appSettingsStore.state.animationPrefs.autoplay.gif;
  const isGif = useMemo(() => isGifUrl(url), [url]);
  const [show, setShow] = useState(autoplayGif || !isGif);

  if (!isGif || autoplayGif || show) {
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
      <div className="absolute inset-0 grid place-items-center">
        <div className="px-3 py-1 rounded-full bg-black/60 text-white text-xs tracking-wide">GIF</div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-2xl">►</span>
      </div>
    </button>
  );
}

