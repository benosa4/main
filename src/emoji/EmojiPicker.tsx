import { useEffect, useState } from 'react';
import { AnimatedEmoji } from './AnimatedEmoji';
import { CATEGORY_INDEX, Tone } from './emojiMap';
import { TonePalette } from './TonePalette';

export interface EmojiPickerProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onPick: (p: { name: string; tone: Tone }) => void;
  defaultTone?: Tone;
  persistToneKey?: string;
  categoryOrder?: string[];
  gridSize?: number;
  pageSize?: number;
}

/**
 * Simplified emoji picker. It displays category tabs and a grid of emojis for
 * the active category. Animations are disabled inside the picker.
 */
export function EmojiPicker({
  open,
  onClose,
  anchorEl,
  onPick,
  defaultTone = 'default',
  persistToneKey,
  categoryOrder,
  gridSize = 40,
}: EmojiPickerProps) {
  const categories = categoryOrder ?? Object.keys(CATEGORY_INDEX);
  const [category, setCategory] = useState(categories[0]);
  const [tone, setTone] = useState<Tone>(defaultTone);
  const [toneTarget, setToneTarget] = useState<string | null>(null);

  // anchorEl and onClose are part of the public API. They are not used in this
  // simplified implementation but are referenced to avoid lint errors.
  void onClose;
  void anchorEl;

  useEffect(() => {
    if (persistToneKey) {
      const saved = localStorage.getItem(persistToneKey) as Tone | null;
      if (saved) setTone(saved);
    }
  }, [persistToneKey]);

  if (!open) return null;

  const handlePick = (name: string) => {
    onPick({ name, tone });
  };

  return (
    <div role="dialog" className="emoji-picker">
      <div role="tablist" className="emoji-picker__tabs">
        {categories.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div
        role="grid"
        className="emoji-picker__grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, ${gridSize}px)`,
          gap: 4,
        }}
      >
        {CATEGORY_INDEX[category]?.map((name) => (
          <button
            key={name}
            role="gridcell"
            aria-label={name}
            onClick={() => handlePick(name)}
            onContextMenu={(e) => {
              e.preventDefault();
              setToneTarget(name);
            }}
          >
            <AnimatedEmoji
              name={name}
              skinTone={tone}
              size={gridSize}
              animate={false}
            />
          </button>
        ))}
      </div>
      {toneTarget && (
        <TonePalette
          name={toneTarget}
          onSelect={(t) => {
            setTone(t);
            if (persistToneKey) localStorage.setItem(persistToneKey, t);
            setToneTarget(null);
          }}
        />
      )}
    </div>
  );
}
