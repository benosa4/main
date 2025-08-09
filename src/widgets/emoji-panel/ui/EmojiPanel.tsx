// src/widgets/emoji-panel/ui/EmojiPanel.tsx
import React, {
  JSX,
  useMemo,
  useState,
  useCallback,
  memo,
} from 'react';
import rawData from '@emoji-mart/data';
import {
  emojiToSvgUrl,
  emojiToPngUrl,
} from '../../../shared/emoji/twemojify';
import {
  Smile,
  Clock3,
  PawPrint,
  Utensils,
  Car,
  Volleyball,
  Flag,
  CaseSensitive,
} from 'lucide-react';
import { FixedSizeGrid, GridChildComponentProps } from 'react-window';

// 👇 TS-воркараунд: приводим FixedSizeGrid к совместимому типу,
// чтобы избежать ошибки "cannot be used as a JSX component".
const Grid = FixedSizeGrid as unknown as React.ComponentType<any>;

type Data = typeof rawData & {
  categories: { id: string; emojis: string[] }[];
  emojis: Record<
    string,
    {
      id: string;
      name?: string;
      keywords?: string[];
      skins?: { native: string }[];
      native?: string;
    }
  >;
};

const data: Data = rawData as any;

const CATEGORY_ICONS: Record<string, JSX.Element> = {
  frequent: <Clock3 size={18} />,
  people: <Smile size={18} />,
  smileys: <Smile size={18} />,
  nature: <PawPrint size={18} />,
  animals: <PawPrint size={18} />,
  foods: <Utensils size={18} />,
  food: <Utensils size={18} />,
  places: <Car size={18} />,
  travel: <Car size={18} />,
  activity: <Volleyball size={18} />,
  activities: <Volleyball size={18} />,
  objects: <CaseSensitive size={18} />,
  symbols: <CaseSensitive size={18} />,
  flags: <Flag size={18} />,
};

// ---- локальный кэш URL, чтобы не пересчитывать на каждом рендере
const svgCache = new Map<string, string>();
const pngCache = new Map<string, string>();
function svgUrl(native: string) {
  let url = svgCache.get(native);
  if (!url) {
    url = emojiToSvgUrl(native);
    svgCache.set(native, url);
  }
  return url;
}
function pngUrl(native: string) {
  let url = pngCache.get(native);
  if (!url) {
    url = emojiToPngUrl(native);
    pngCache.set(native, url);
  }
  return url;
}

export interface EmojiPanelProps {
  onEmojiSelect: (native: string) => void;
}

type FlatEmoji = { id: string; native: string; name?: string };

const CELL = 48; // размер ячейки
const COLS = 8;
const PANEL_HEIGHT = 300;

export default function EmojiPanel({ onEmojiSelect }: EmojiPanelProps) {
  const [activeCat, setActiveCat] = useState<string>(data.categories[0]?.id);
  const [query, setQuery] = useState('');
  const [skinTone, setSkinTone] = useState(0); // 0..5
  const [hovered, setHovered] = useState<FlatEmoji | null>(null);

  // Плоский список эмодзи под поиск/категорию с учётом выбранного тона
  const flatEmojis = useMemo<FlatEmoji[]>(() => {
    const pickNative = (e: Data['emojis'][string]) =>
      e.skins?.[skinTone]?.native || e.native || '';

    if (query.trim()) {
      const q = query.toLowerCase();
      return Object.values(data.emojis)
        .filter((e) => {
          const hay = `${e.name || ''} ${(e.keywords || []).join(' ')}`.toLowerCase();
          return hay.includes(q);
        })
        .map((e) => ({ id: e.id, name: e.name, native: pickNative(e) }))
        .filter((e) => e.native);
    }

    const ids = data.categories.find((c) => c.id === activeCat)?.emojis || [];
    return ids
      .map((id) => data.emojis[id])
      .map((e) => ({ id: e.id, name: e.name, native: pickNative(e) }))
      .filter((e) => e.native);
  }, [activeCat, query, skinTone]);

  const rowCount = Math.ceil(flatEmojis.length / COLS);

  // Ячейка грида (виртуализирована + кэш URL)
  const Cell = useCallback(
    memo(function CellMemo({ columnIndex, rowIndex, style }: GridChildComponentProps) {
      const idx = rowIndex * COLS + columnIndex;
      if (idx >= flatEmojis.length) return null;

      const item = flatEmojis[idx];
      const src = svgUrl(item.native);

      return (
        <div
          style={style}
          className="flex items-center justify-center"
        >
          <button
            type="button"
            className="w-9 h-9 rounded hover:bg-gray-100 focus:bg-gray-200"
            onClick={() => onEmojiSelect(item.native)}
            onMouseEnter={() => setHovered(item)}
            onMouseLeave={() => setHovered(null)}
            aria-label={item.name || item.id}
          >
            <img
              src={src}
              alt={item.name || item.id}
              className="w-8 h-8"
              loading="lazy"
              onError={(ev) => {
                (ev.currentTarget as HTMLImageElement).src = pngUrl(item.native);
              }}
            />
          </button>
        </div>
      );
    }),
    [flatEmojis, onEmojiSelect],
  );

  // Превью внизу
  const preview = hovered ? (
    <>
      <img
        src={svgUrl(hovered.native)}
        className="w-8 h-8"
        alt={hovered.name || hovered.id}
        onError={(ev) => {
          (ev.currentTarget as HTMLImageElement).src = pngUrl(hovered.native);
        }}
      />
      <span className="truncate">{hovered.name || hovered.id}</span>
    </>
  ) : (
    <span className="text-gray-500">Hover an emoji to preview</span>
  );

  return (
    <div
      role="dialog"
      aria-label="Emoji picker"
      className="w-[384px] bg-white text-black rounded-lg shadow-lg border border-gray-200 flex flex-col"
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 border-b border-gray-200">
        {data.categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveCat(c.id)}
            aria-label={c.id}
            className={`w-8 h-8 rounded-md flex items-center justify-center ${
              activeCat === c.id ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            <span className="text-neutral-700">
              {CATEGORY_ICONS[c.id] ?? <Smile size={18} />}
            </span>
          </button>
        ))}
      </div>

      {/* Search + skin tones */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-200">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="flex-1 px-2 py-1 rounded bg-gray-100 focus:outline-none"
        />
        <div className="flex items-center gap-1" aria-label="Skin tones">
          {['👍','👍🏻','👍🏼','👍🏽','👍🏾','👍🏿'].map((native, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSkinTone(i)}
              className={`w-5 h-5 rounded-full border grid place-items-center ${
                skinTone === i ? 'border-blue-500' : 'border-transparent'
              }`}
              title={`Skin tone ${i + 1}`}
              aria-label={`Skin tone ${i + 1}`}
            >
              <img
                src={emojiToSvgUrl(native)}
                alt=""
                className="w-4 h-4"
                loading="lazy"
                onError={(ev) => {
                  (ev.currentTarget as HTMLImageElement).src = emojiToPngUrl(native);
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Grid (виртуализирован) */}
      <div className="overflow-hidden">
        <Grid
          columnCount={COLS}
          columnWidth={CELL}
          height={PANEL_HEIGHT}
          rowCount={rowCount}
          rowHeight={CELL}
          width={COLS * CELL}
        >
          {Cell as any}
        </Grid>
      </div>

      {/* Preview */}
      <div className="h-12 border-t border-gray-200 px-3 flex items-center gap-3 text-sm">
        {preview}
      </div>
    </div>
  );
}
