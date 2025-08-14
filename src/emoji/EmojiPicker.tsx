import { useEffect, useRef, useState, forwardRef, useLayoutEffect, useMemo } from 'react';
import type { MutableRefObject } from 'react';
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
  const groups = useMemo(
    () => (recents.length > 0 ? ['recent', ...categories] : categories),
    [recents, categories]
  );

  const [tone, setTone] = useState<Tone>(defaultTone);
  const [toneTarget, setToneTarget] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const virtuosoRef = useRef<GroupedVirtuosoHandle>(null);
  const { ref: containerRef, cols } = useGridColumns(gridCellSize);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (open && anchorEl && popoverRef.current) {
      const anchorRect = anchorEl.getBoundingClientRect();
      const alignRect = alignEl?.getBoundingClientRect();
      const height = popoverRef.current.offsetHeight;
      setPosition({
        top: anchorRect.top - height,
        left: alignRect ? alignRect.left : anchorRect.left,
      });
    }
  }, [open, anchorEl, alignEl, popoverRef, cols]);

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

  const handlePick = (name: string) => {
    const usedTone = tone;
    onPick({ name, tone: usedTone });
    bump(name, usedTone);
  };

  const groupRows = useMemo(
    () =>
      groups.map((g) =>
        toRows(
          g === 'recent' ? recents.map((r) => r.name) : CATEGORY_INDEX[g] || [],
          cols
        )
      ),
    [groups, cols, recents]
  );
  const groupCounts = useMemo(() => groupRows.map((r) => r.length), [groupRows]);
  const flatRows = useMemo(() => groupRows.flat(), [groupRows]);

  const groupIndexFromItem = (i: number, counts: number[]) => {
    let acc = 0;
    for (let idx = 0; idx < counts.length; idx++) {
      acc += counts[idx];
      if (i < acc) return idx;
    }
    return counts.length - 1;
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="emoji-picker emoji-picker--open"
      ref={popoverRef}
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
            title={SECTION_LABELS[g]}
          >
            {categoryIcons[g] ?? '❓'}
          </button>
        ))}
      </div>
      <GroupedVirtuoso
        key={cols}
        ref={virtuosoRef}
        style={{ height: 300 }}
        overscan={overscan}
        groupCounts={groupCounts}
        rangeChanged={({ startIndex }) =>
          setActiveTab(groupIndexFromItem(startIndex, groupCounts))
        }
        components={{
          List: forwardRef<HTMLDivElement>((props, listRef) => (
            <div
              {...props}
              ref={(node) => {
                if (typeof listRef === 'function') listRef(node);
                else if (listRef)
                  (listRef as MutableRefObject<HTMLDivElement | null>).current = node;
                (containerRef as MutableRefObject<HTMLDivElement | null>).current = node;
              }}
              role="grid"
              className="emoji-picker__list"
            />
          )),
        }}
        groupContent={(index) => (
          <div role="group" id={`group-${groups[index]}`} aria-label={SECTION_LABELS[groups[index]]}>
            {SECTION_LABELS[groups[index]]}
          </div>
        )}
        itemContent={(rowIndex) => {
          const row = flatRows[rowIndex];
          return (
            <div role="row" className="emoji-picker__row">
              {row.map((name) => (
                <button
                  key={name}
                  role="gridcell"
                  className="emoji-picker__cell"
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
      <div className="emoji-picker__footer">
        <button onClick={() => setToneTarget(':thumbs-up:')}>🙂</button>
        <button disabled>🧠</button>
        <button disabled>⚙️</button>
        <button onClick={onClose}>✖</button>
      </div>
    </div>
  );
}
