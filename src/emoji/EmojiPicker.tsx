import { useEffect, useRef, useState, forwardRef, useLayoutEffect, useMemo } from 'react';
import { GroupedVirtuoso, GroupedVirtuosoHandle } from 'react-virtuoso';
import { AnimatedEmoji } from './AnimatedEmoji';
import { CATEGORY_INDEX, Tone } from './emojiMap';
import { TonePalette } from './TonePalette';
import { useEmojiUsage } from './useEmojiUsage';
import { toRows } from './virtualization';
import { categoryIconShortcodes } from './categoryIcons';

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

// утилита: уникализация с сохранением первого вхождения
const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

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
 * Виртуализованный emoji-picker с «Недавними», табами и скинтонами.
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
  animateInsidePicker = true,
  maxRecents = 36,
  overscan = 300,
}: EmojiPickerProps) {
  const virtuosoRef = useRef<GroupedVirtuosoHandle>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { recents, bump } = useEmojiUsage(maxRecents);

  const categories = categoryOrder ?? Object.keys(CATEGORY_INDEX);

  // «Недавние» → только уникальные имена, в уже отсортированном порядке
  const recentNames = useMemo(() => uniq(recents.map((r) => r.name)), [recents]);

  const groups = useMemo(
    () => (recentNames.length > 0 ? ['recent', ...categories] : categories),
    [recentNames.length, categories]
  );

  const [tone, setTone] = useState<Tone>(defaultTone);
  const [toneTarget, setToneTarget] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [cols, setCols] = useState(1);

  // Колонки считаем от ширины поповера
  useLayoutEffect(() => {
    if (!popoverRef.current) return;

    const GAP = 8;
    const compute = () => {
      const el = popoverRef.current!;
      const cs = getComputedStyle(el);
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const innerWidth = el.clientWidth - padX;
      const next = Math.max(1, Math.floor((innerWidth + GAP) / (gridCellSize + GAP)));
      setCols(next);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(popoverRef.current);
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [gridCellSize, open]);

  // Позиционирование относительно кнопки в композере
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
  }, [open, anchorEl, alignEl, cols]);

  // Esc для закрытия
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Восстановление выбранного тона
  useEffect(() => {
    if (!persistToneKey) return;
    const saved = localStorage.getItem(persistToneKey) as Tone | null;
    if (saved) setTone(saved);
  }, [persistToneKey]);

  const handlePick = (name: string) => {
    const usedTone = tone;
    onPick({ name, tone: usedTone });
    bump(name, usedTone);
  };

  // Подготовка виртуализованных рядов
  const groupRows = useMemo(
    () =>
      groups.map((g) =>
        toRows(
          g === 'recent'
            ? recentNames
            : uniq([...(CATEGORY_INDEX[g] || [])]),
          cols
        )
      ),
    [groups, cols, recentNames]
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
      style={{
        top: position.top,
        left: position.left,
        ['--emoji-gap' as any]: '8px',
      }}
    >
      {/* Tabs */}
      <div role="tablist" className="emoji-picker__tabs">
        {groups.map((g, i) => (
          <button
            key={g}
            role="tab"
            aria-selected={activeTab === i}
            className={`emoji-picker__tab ${activeTab === i ? 'is-active' : ''}`}
            onClick={() => {
              setActiveTab(i);
              virtuosoRef.current?.scrollToIndex({ groupIndex: i });
            }}
            title={SECTION_LABELS[g]}
          >
            <AnimatedEmoji name={categoryIconShortcodes[g] ?? ':smile:'} size={18} animate={false} />
          </button>
        ))}
      </div>

      {/* Grid */}
      <GroupedVirtuoso
        key={cols}
        ref={virtuosoRef}
        overscan={overscan}
        groupCounts={groupCounts}
        rangeChanged={({ startIndex }) =>
          setActiveTab(groupIndexFromItem(startIndex, groupCounts))
        }
        style={{ height: 300 }}
        groupContent={(index) => (
          <div
            role="group"
            id={`group-${groups[index]}`}
            aria-label={SECTION_LABELS[groups[index]]}
            className="emoji-picker__section"
          >
            {SECTION_LABELS[groups[index]]}
          </div>
        )}
        components={{
          List: forwardRef<HTMLDivElement>((props, ref) => (
            <div {...props} ref={ref} role="grid" className="emoji-picker__list" />
          )),
        }}
        itemContent={(rowIndex) => {
          const row = flatRows[rowIndex];
          return (
            <div role="row" className="emoji-picker__row">
              {row.map((name, i) => (
                <button
                  key={`${name}-${rowIndex}-${i}`} // гарантированно уникально
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
