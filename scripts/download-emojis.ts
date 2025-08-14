import fs from 'node:fs/promises';
import path from 'node:path';

type LottieItem = { shortcode: string; file: string; url: string };
type SpriteItem = { shortcode: string; file: string; meta: string; url: string; metaUrl: string };
type Manifest = { lottie: LottieItem[]; sprite: SpriteItem[]; svg?: LottieItem[] };

async function ensureDir(p: string){ await fs.mkdir(p, { recursive: true }); }

async function dl(url: string, outPath: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(outPath, buf);
  console.log('✓', outPath);
}

async function main(){
  const root = process.cwd();
  const manPath = path.join(root, 'emoji-manifest.json');
  const json = JSON.parse(await fs.readFile(manPath, 'utf8')) as Manifest;

  await ensureDir(path.join(root, 'public/emoji/lottie'));
  await ensureDir(path.join(root, 'public/emoji/sprite'));
  await ensureDir(path.join(root, 'public/emoji/svg'));

  const errors: string[] = [];

  async function safeDl(url: string, out: string) {
    try {
      await dl(url, out);
    } catch (e: any) {
      console.warn('×', out, '-', e.message);
      errors.push(`${out}: ${e.message}`);
    }
  }

  for (const it of json.lottie) {
    await safeDl(it.url, path.join(root, 'public/emoji/lottie', it.file));
  }
  for (const it of json.sprite) {
    await safeDl(it.url,     path.join(root, 'public/emoji/sprite', it.file));
    await safeDl(it.metaUrl, path.join(root, 'public/emoji/sprite', it.meta));
  }
  for (const it of (json.svg ?? [])) {
    await safeDl(it.url, path.join(root, 'public/emoji/svg', it.file));
  }

  if (errors.length) {
    console.warn(`\nГотово с пропусками (${errors.length} ошибок).`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
