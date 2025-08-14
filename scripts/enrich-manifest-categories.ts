import fs from 'node:fs/promises';
import path from 'node:path';

type Icon = { codepoint: string; categories?: string[] };
type ApiJson = { icons?: Icon[] };

type BaseItem = { shortcode: string; file: string; categories?: string[] };
type SpriteItem = BaseItem & { meta?: string };
type Manifest = { lottie?: BaseItem[]; sprite?: SpriteItem[]; svg?: BaseItem[] };

const normCat = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '_');
const baseNoExt = (f: string) => f.replace(/\.[^.]+$/, '').toLowerCase();

async function main() {
  const root = process.cwd();
  const apiPath = process.argv[2] || 'api.json'; // путь к googlefonts noto api.json
  const manPath = path.join(root, 'emoji-manifest.json');

  const apiRaw = await fs.readFile(apiPath, 'utf8');
  const manRaw = await fs.readFile(manPath, 'utf8');

  const api = JSON.parse(apiRaw) as ApiJson;
  const man = JSON.parse(manRaw) as Manifest;

  // codepoint -> [categories]
  const catMap = new Map<string, string[]>();
  for (const it of api.icons ?? []) {
    const cp = (it.codepoint || '').toLowerCase();
    if (!cp) continue;
    const cats = (it.categories ?? []).map(normCat);
    if (cats.length) catMap.set(cp, cats);
  }

  // Помощник: задать/объединить категории
  const setCats = (item: BaseItem | SpriteItem, cats: string[]) => {
    const next = Array.from(new Set([...(item.categories ?? []), ...cats]));
    if (next.length) item.categories = next;
  };

  let patchedLottie = 0, patchedSprite = 0, patchedSvg = 0;

  // 1) Lottie: по имени файла (codepoint.json)
  for (const it of man.lottie ?? []) {
    const cp = baseNoExt(it.file);
    const cats = catMap.get(cp);
    if (cats && cats.length) { setCats(it, cats); patchedLottie++; }
  }

  // Индекс по shortcode из уже обогащённых lottie
  const catsByShort = new Map<string, string[]>();
  for (const it of man.lottie ?? []) {
    if (it.categories?.length) catsByShort.set(it.shortcode, it.categories);
  }

  // 2) Sprite: сначала перенос по shortcode, иначе пробуем по filename (на случай несостыковок)
  for (const it of man.sprite ?? []) {
    const cats = catsByShort.get(it.shortcode) || catMap.get(baseNoExt(it.file));
    if (cats?.length) { setCats(it, cats); patchedSprite++; }
  }

  // 3) SVG: аналогично
  for (const it of man.svg ?? []) {
    const cats = catsByShort.get(it.shortcode) || catMap.get(baseNoExt(it.file));
    if (cats?.length) { setCats(it, cats); patchedSvg++; }
  }

  await fs.writeFile(manPath, JSON.stringify(man, null, 2), 'utf8');

  console.log(`✓ categories added -> lottie: ${patchedLottie}, sprite: ${patchedSprite}, svg: ${patchedSvg}`);
  console.log('→ run: yarn emoji:map   # пересобрать src/emoji/emojiMap.ts (CATEGORY_INDEX и т.п.)');
}

main().catch((e) => { console.error(e); process.exit(1); });
