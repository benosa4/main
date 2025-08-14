// scripts/build-manifest-from-noto.ts
import fs from 'node:fs/promises';
import path from 'node:path';

type Icon = {
  name: string;
  codepoint: string;          // напр. "1f600"
  popularity?: number;
  categories?: string[];
  tags?: string[];            // напр. [":smile:"]
};
type ApiJson = {
  host?: string;              // напр. "https://fonts.gstatic.com"
  asset_url_pattern?: string; // напр. "/s/e/notoemoji/latest/{codepoint}/lottie.json"
  families?: string[];
  icons: Icon[];
};

function toShortcode(tags?: string[], codepoint?: string) {
  const t = tags?.[0]?.trim();
  if (t && /^:.*:$/.test(t)) return t;
  return codepoint ? `:u${codepoint}:` : ':emoji:';
}

function buildUrl(host: string, pattern: string, codepoint: string) {
  const safeHost = host?.replace(/\/+$/, '') || 'https://fonts.gstatic.com';
  let patt = pattern || '/s/e/notoemoji/latest/{codepoint}/lottie.json';
  patt = patt.replace('{codepoint}', codepoint.toLowerCase());
  if (!/^https?:\/\//i.test(patt)) patt = safeHost + (patt.startsWith('/') ? patt : '/' + patt);
  return patt;
}

async function main() {
  const apiPath = process.argv[2] || 'api.json'; // путь к скачанному api.json
  const outPath = 'emoji-manifest.json';
  const limit = Number(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || 0);

  const raw = await fs.readFile(apiPath, 'utf8');
  const api = JSON.parse(raw) as ApiJson;

  const host = api.host || 'https://fonts.gstatic.com';
  const pattern = api.asset_url_pattern || '/s/e/notoemoji/latest/{codepoint}/lottie.json';

  // Берём только валидные иконки с codepoint; при желании — сортируем по популярности
  let icons = (api.icons || []).filter(i => !!i.codepoint);
  icons.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  if (limit > 0) icons = icons.slice(0, limit);

  const lottie = icons.map((it) => {
    const cp = it.codepoint.toLowerCase();
    const shortcode = toShortcode(it.tags, cp);
    return {
      shortcode,
      file: `${cp}.json`,
      url: buildUrl(host, pattern, cp),
    };
  });

  const manifest = { lottie, sprite: [], svg: [] as any[] };
  await fs.writeFile(outPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`✓ ${outPath} — ${lottie.length} items`);
  console.log(`Example: ${lottie.slice(0, 3).map(e => `${e.shortcode} -> ${e.url}`).join(' | ')}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
