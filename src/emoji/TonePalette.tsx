import { Tone } from './emojiMap';
import { AnimatedEmoji } from './AnimatedEmoji';

const TONES: Tone[] = [
  'default',
  'light',
  'medium_light',
  'medium',
  'medium_dark',
  'dark',
];

export interface TonePaletteProps {
  name: string;
  onSelect: (tone: Tone) => void;
}

/**
 * Minimal tone selection popover. It simply renders buttons with different
 * skin tone variants of the provided emoji and calls `onSelect` when a tone is
 * picked. Full popover positioning and keyboard handling are omitted for
 * brevity.
 */
export function TonePalette({ name, onSelect }: TonePaletteProps) {
  return (
    <div role="dialog" className="tone-palette">
      {TONES.map((tone) => (
        <button
          key={tone}
          type="button"
          aria-label={tone}
          onClick={() => onSelect(tone)}
        >
          <AnimatedEmoji name={name} skinTone={tone} size={24} animate={false} />
        </button>
      ))}
    </div>
  );
}
