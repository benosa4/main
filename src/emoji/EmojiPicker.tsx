import { useEffect, useRef, useState, forwardRef } from 'react';
import { GroupedVirtuoso, GroupedVirtuosoHandle } from 'react-virtuoso';
import { AnimatedEmoji } from './AnimatedEmoji';
import { CATEGORY_INDEX, Tone } from './emojiMap';
import { TonePalette } from './TonePalette';
import { useEmojiUsage } from './useEmojiUsage';
import { toRows, useGridColumns } from './virtualization';
import { categoryIcons } from './categoryIcons';

export interface EmojiPickerProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onPick: (p: { name: string; tone: Tone }) => void;

  defaultTone?: Tone;
  persistToneKey?: string;
  categoryOrder?: string[];
  gridCellSize?: number;
  animateInsidePicker?: boolean;
  maxRecents?: number;
  overscan?: number;
}

/**
 * Virtualized emoji picker with recent section and tone palette.
 */
export function EmojiPicker({
  open,
  anchorEl,
  onClose,
  onPick,
  defaultTone = 'default',
  persistToneKey,
  categoryOrder,
  gridCellSize = 40,
  animateInsidePicker = false,
  maxRecents = 36,
  overscan = 300,
}: EmojiPickerProps) {
  const { recents, bump } = useEmojiUsage(maxRecents);
  const categories = categoryOrder ?? Object.keys(CATEGORY_INDEX);
  const groups = recents.length > 0 ? ['recent', ...categories] : categories;

  const [tone, setTone] = useState<Tone>(defaultTone);
  const [toneTarget, setToneTarget] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const virtuosoRef = useRef<GroupedVirtuosoHandle>(null);
  const { ref: containerRef, cols } = useGridColumns(gridCellSize);

  void anchorEl;
  void onClose;

  useEffect(() => {
    if (persistToneKey) {
      const saved = localStorage.getItem(persistToneKey) as Tone | null;
      if (saved) setTone(saved);
    }
  }, [persistToneKey]);

  const handlePick = (name: string) => {
    onPick({ name, tone });
    bump(name, tone);
  };

  if (!open) return null;

  const getNames = (g: string) => (g === 'recent' ? recents.map((r) => r.name) : CATEGORY_INDEX[g] || []);
  const groupRows = groups.map((g) => toRows(getNames(g), cols));
  const groupCounts = groupRows.map((r) => r.length);
  const flatRows = groupRows.flat();

  return (
    <div role="dialog" className="emoji-picker" ref={containerRef}>
      <div role="tablist" className="emoji-picker__tabs">
        {groups.map((g, i) => (
          <button
            key={g}
            role="tab"
            aria-selected={activeTab === i}
            onClick={() => {
              setActiveTab(i);
              virtuosoRef.current?.scrollToIndex({ groupIndex: i });
            }}
          >
            {categoryIcons[g] || g}
          </button>
        ))}
      </div>
      <GroupedVirtuoso
        ref={virtuosoRef}
        style={{ height: 300 }}
        overscan={overscan}
        groupCounts={groupCounts}
        components={{
          List: forwardRef<HTMLDivElement>((props, ref) => (
            <div {...props} ref={ref} role="grid" />
          )),
        }}
        groupContent={(index) => (
          <div role="group" id={`group-${groups[index]}`} aria-label={groups[index]}>
            {groups[index]}
          </div>
        )}
        itemContent={(index) => {
          const row = flatRows[index];
          return (
            <div role="row" style={{ display: 'flex' }}>
              {row.map((name) => (
                <button
                  key={name}
                  type="button"
                  role="gridcell"
                  aria-label={name}
                  style={{ width: gridCellSize, height: gridCellSize }}
                  onClick={() => handlePick(name)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setToneTarget(name);
                  }}
                >
                  <AnimatedEmoji
                    name={name}
                    skinTone={tone}
                    size={gridCellSize}
                    animate={animateInsidePicker}
                  />
                </button>
              ))}
            </div>
          );
        }}
      />
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
