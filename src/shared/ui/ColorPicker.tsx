import React, { useMemo, useRef, useState } from 'react';

type Props = {
  hex: string; // #RRGGBB
  onChange: (hex: string) => void;
};

// Utility conversions
function componentToHex(c: number) {
  const v = Math.max(0, Math.min(255, Math.round(c)));
  return v.toString(16).padStart(2, '0');
}
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [37, 99, 235];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, v]; // h in [0,1]
}
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export const ColorPicker: React.FC<Props> = ({ hex, onChange }) => {
  const [r, g, b] = useMemo(() => hexToRgb(hex), [hex]);
  const [h, s, v] = useMemo(() => rgbToHsv(r, g, b), [r, g, b]);

  const panelRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const handlePointer = (clientX: number, clientY: number) => {
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let x = (clientX - rect.left) / rect.width; // 0..1
    let y = (clientY - rect.top) / rect.height; // 0..1
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));
    const s2 = x;
    const v2 = 1 - y;
    const [rr, gg, bb] = hsvToRgb(h, s2, v2);
    onChange(rgbToHex(rr, gg, bb));
  };

  const hueColor = useMemo(() => {
    const [hr, hg, hb] = hsvToRgb(h, 1, 1);
    return `rgb(${hr}, ${hg}, ${hb})`;
  }, [h]);

  const selectorStyle = useMemo(() => {
    return {
      left: `${s * 100}%`,
      top: `${(1 - v) * 100}%`,
    } as React.CSSProperties;
  }, [s, v]);

  return (
    <div className="w-full">
      <div
        ref={panelRef}
        className="relative w-full h-40 rounded-md cursor-crosshair select-none"
        style={{
          backgroundImage: `linear-gradient(to top, black, transparent), linear-gradient(to right, white, ${hueColor})`,
        }}
        onMouseDown={(e) => { setDragging(true); handlePointer(e.clientX, e.clientY); }}
        onMouseMove={(e) => { if (dragging) handlePointer(e.clientX, e.clientY); }}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        onTouchStart={(e) => { const t = e.touches[0]; handlePointer(t.clientX, t.clientY); }}
        onTouchMove={(e) => { const t = e.touches[0]; handlePointer(t.clientX, t.clientY); }}
      >
        <div
          className="absolute w-3 h-3 rounded-full border border-white shadow"
          style={{ transform: 'translate(-50%, -50%)', ...selectorStyle }}
        />
      </div>
    </div>
  );
};

export default ColorPicker;

