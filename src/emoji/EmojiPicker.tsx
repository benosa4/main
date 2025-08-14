import { useEffect, useRef, useState, forwardRef, useLayoutEffect } from 'react';
import { GroupedVirtuoso, GroupedVirtuosoHandle } from 'react-virtuoso';
import { AnimatedEmoji } from './AnimatedEmoji';
import { CATEGORY_INDEX, Tone } from './emojiMap';
import { TonePalette } from './TonePalette';
import { useEmojiUsage } from './useEmojiUsage';
import { toRows, useGridColumns } from './virtualization';
import { categoryIcons } from './categoryIcons';

const SECTION_LABELS: Record<string, string> = {
  recent: 'Недавние',
  smileys_and_emotions: 'Смайлы и люди',
  people: 'Люди',
  animals_and_nature: 'Животные и природа',
  food_and_drink: 'Еда и напитки',
  travel_and_places: 'Путешествия и места',
  activities_and_events: 'Активности и события',
  objects: 'Объекты',
  symbols: 'Символы',
  flags: 'Флаги',
};

export interface EmojiPickerProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  alignEl?: HTMLElement | null;
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
  alignEl,
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
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (open && anchorEl && containerRef.current) {
      const anchorRect = anchorEl.getBoundingClientRect();
      const alignRect = alignEl?.getBoundingClientRect();
      const height = containerRef.current.offsetHeight;
      setPosition({
        top: anchorRect.top - height,
        left: alignRect ? alignRect.left : anchorRect.left,
      });
    }
  }, [open, anchorEl, alignEl, containerRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (persistToneKey) {
      const saved = localStorage.getItem(persistToneKey) as Tone | null;
      if (saved) setTone(saved);
    }
  }, [persistToneKey]);

  const handlePick = (name: string, t?: Tone) => {
    const usedTone = t || tone;
    onPick({ name, tone: usedTone });
    bump(name, usedTone);
  };

  if (!open) return null;

  const getTokens = (g: string) =>
    g === 'recent' ? recents.map((r) => `${r.name}|${r.tone}`) : CATEGORY_INDEX[g] || [];
  const groupRows = groups.map((g) => toRows(getTokens(g), cols));
  const groupCounts = groupRows.map((r) => r.length);
  const flatRows = groupRows.flat();
  const prefix: number[] = [];
  groupCounts.reduce((acc, n) => {
    prefix.push(acc);
    return acc + n;
  }, 0);

  const groupIndexFromItem = (i: number) => {
    let idx = 0;
    while (idx < prefix.length && prefix[idx] + groupCounts[idx] <= i) idx++;
    return Math.min(idx, groupCounts.length - 1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="emoji-picker emoji-picker--open"
      ref={containerRef}
      style={{ top: position.top, left: position.left }}
    >
      <div role="tablist" className="emoji-picker__tabs">
        {groups.map((g, i) => (
          <button
            key={g}
            role="tab"
            aria-selected={activeTab === i}
            className={activeTab === i ? 'emoji-picker__tab--active' : ''}
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
        rangeChanged={({ startIndex }) => setActiveTab(groupIndexFromItem(startIndex))}
        components={{
          List: forwardRef<HTMLDivElement>((props, ref) => (
            <div {...props} ref={ref} role="grid" />
          )),
        }}
        groupContent={(index) => (
          <div role="group" id={`group-${groups[index]}`} aria-label={SECTION_LABELS[groups[index]]}>
            {SECTION_LABELS[groups[index]]}
          </div>
        )}
        itemContent={(index) => {
          const row = flatRows[index];
          return (
            <div role="row" style={{ display: 'flex' }}>
              {row.map((token) => {
                const [name, toneToken] = token.split('|') as [string, Tone?];
                return (
                  <button
                    key={token}
                    type="button"
                    role="gridcell"
                    aria-label={name}
                    style={{ width: gridCellSize, height: gridCellSize }}
                    onClick={() => handlePick(name, toneToken as Tone)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setToneTarget(name);
                    }}
                  >
                    <AnimatedEmoji
                      name={name}
                      skinTone={(toneToken as Tone) || tone}
                      size={gridCellSize}
                      animate={animateInsidePicker}
                    />
                  </button>
                );
              })}
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
      <div className="emoji-picker__footer">
        <button onClick={() => setToneTarget(':thumbs-up:')}>🙂</button>
        <button disabled>🧠</button>
        <button disabled>⚙️</button>
        <button onClick={onClose}>✖</button>
      </div>
    </div>
  );
}
