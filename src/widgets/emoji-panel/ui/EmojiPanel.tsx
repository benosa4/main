import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useEffect, useRef } from 'react';
import { RefObject } from 'react';
import { useAnchoredPanel } from '../../../shared/utils';

interface Props {
  anchorRef: RefObject<HTMLElement | null>;
  onSelect: (emoji: { native: string }) => void;
  onClose: () => void;
}

export function EmojiPanel({ anchorRef, onSelect, onClose }: Props) {
  const style = useAnchoredPanel(anchorRef);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      style={style}
      className="emoji-ui emoji-text w-[360px] h-[320px] bg-white/95 rounded-2xl border border-neutral-200 shadow-xl p-2"
    >
      <Picker
        data={data}
        skinTonePosition="none"
        navPosition="top"
        previewPosition="bottom"
        perLine={8}
        onEmojiSelect={onSelect}
      />
    </div>
  );
}
