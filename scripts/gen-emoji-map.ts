// scripts/gen-emoji-map.ts
import fs from 'node:fs/promises';
import path from 'node:path';

type LottieItem = { shortcode: string; file: string; url: string; categories?: string[] };
type SpriteItem = { shortcode: string; file: string; meta: string; url: string; metaUrl: string; categories?: string[] };
type Manifest = { lottie?: LottieItem[]; sprite?: SpriteItem[]; svg?: LottieItem[] };

type Tone = 'default'|'light'|'medium_light'|'medium'|'medium_dark'|'dark';
const TONE_SUFFIXES: Record<Tone, string> = {
  default: '',
  light: '_light',
  medium_light: '_medium_light',
  medium: '_medium',
  medium_dark: '_medium_dark',
  dark: '_dark',
};
const TONE_FROM_SUFFIX: Record<string, Tone> = {
  '_light': 'light',
  '_medium_light': 'medium_light',
  '_medium': 'medium',
  '_medium_dark': 'medium_dark',
  '_dark': 'dark',
};

function baseShortcode(sc: string): { base: string; tone: Tone } {
  // :nose_medium_dark: -> { base: ":nose:", tone: "medium_dark" }
  const m = sc.match(/^:(.+?):$/);
  if (!m) return { base: sc, tone: 'default' };
  let core = m[1];
  for (const [suffix, tone] of Object.entries(TONE_FROM_SUFFIX)) {
    if (core.endsWith(suffix)) {
      return { base: `:${core.slice(0, -suffix.length)}:`, tone };
    }
  }
  return { base: `:${core}:`, tone: 'default' };
}

function addToCatIndex(catIndex: Record<string,string[]>, categories: string[]|undefined, base: string) {
  const cats = categories?.length ? categories : [];
  for (const c of cats) {
    (catIndex[c] ||= []).push(base);
  }
}

async function main(){
  const root = process.cwd();
  const man = JSON.parse(await fs.readFile(path.join(root, 'emoji-manifest.json'), 'utf8')) as Manifest;

  // Группируем всё под базовым шорткодом
  type Entry = {
    kind: 'lottie'|'sprite'|'svg';
    categories: string[];
    variants: Partial<Record<Tone, { src: string; meta?: string }>>;
  };
  const EMOJI: Record<string, Entry> = {};
  const CAT_INDEX: Record<string, string[]> = {}; // category -> [base shortcode]

  function upsert(
    kind: Entry['kind'],
    sc: string,
    src: string,
    categories?: string[],
    meta?: string
  ) {
    const { base, tone } = baseShortcode(sc);
    const entry = (EMOJI[base] ||= { kind, categories: [], variants: {} });
    entry.kind = kind; // если встретится svg/sprite — можно переопределить приоритетом по желанию
    // категории объединяем (сет)
    const catsSet = new Set([...entry.categories, ...(categories || [])]);
    entry.categories = Array.from(catsSet);
    entry.variants[tone] = meta ? { src, meta } : { src };

    addToCatIndex(CAT_INDEX, categories, base);
  }

  for (const it of man.lottie ?? []) {
    upsert('lottie', it.shortcode, `/emoji/lottie/${it.file}`, it.categories);
  }
  for (const it of man.sprite ?? []) {
    upsert('sprite', it.shortcode, `/emoji/sprite/${it.file}`, it.categories, `/emoji/sprite/${it.meta}`);
  }
  for (const it of (man.svg ?? [])) {
    upsert('svg', it.shortcode, `/emoji/svg/${it.file}`, it.categories);
  }

  // Упорядочим списки в индексах и уберём дубликаты
  for (const k of Object.keys(CAT_INDEX)) {
    CAT_INDEX[k] = Array.from(new Set(CAT_INDEX[k])).sort();
  }

  const out = `// AUTO-GENERATED. Do not edit.
export type Tone = 'default'|'light'|'medium_light'|'medium'|'medium_dark'|'dark';
export type EmojiKind = 'lottie'|'sprite'|'svg';

export type EmojiEntry = {
  kind: EmojiKind;
  categories: readonly string[];
  variants: Partial<Record<Tone, { src: string; meta?: string }>>;
};

export const EMOJI: Record<string, EmojiEntry> = ${JSON.stringify(EMOJI, null, 2)} as const;

export const CATEGORY_INDEX: Record<string, readonly string[]> = ${JSON.stringify(CAT_INDEX, null, 2)} as const;

// Helper: выбрать вариант по тону с фоллбеком
export function resolveEmojiSrc(name: string, tone: Tone = 'default'): { kind: EmojiKind; src: string; meta?: string } | null {
  const e = (EMOJI as any)[name];
  if (!e) return null;
  const byTone = e.variants?.[tone] || e.variants?.default || Object.values(e.variants || {})[0];
  if (!byTone) return null;
  return { kind: e.kind, src: byTone.src, meta: byTone.meta };
}
`;

  await fs.mkdir(path.join(root, 'src/emoji'), { recursive: true });
  await fs.writeFile(path.join(root, 'src/emoji/emojiMap.ts'), out, 'utf8');
  console.log('✓ src/emoji/emojiMap.ts');
}
main().catch(e => { console.error(e); process.exit(1); });
