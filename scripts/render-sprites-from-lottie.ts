// scripts/render-sprites-from-lottie.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// ---------- ARGS ----------
function arg(name: string, def?: string) {
  const hit = process.argv.find(s => s.startsWith(`--${name}=`));
  return hit ? hit.split('=')[1] : def;
}
function argBool(name: string, def: boolean) {
  const v = arg(name);
  if (v == null) return def;
  return ['1','true','yes','on'].includes(v.toLowerCase());
}

const SIZE = parseInt(arg('size','128')!, 10);       // px стороны кадра
const MAX  = parseInt(arg('max','48')!, 10);         // максимум кадров (сэмплирование)
const FPS  = parseInt(arg('fps','24')!, 10);         // для meta.json
const FORMAT = (arg('format','webp') || 'webp').toLowerCase() as 'webp'|'png';
const QUALITY = parseInt(arg('quality','90')!, 10);  // для webp/png
const LOSSLESS = argBool('lossless', false);         // для webp
const TIMEOUT_FILE_MS = parseInt(arg('timeout','30000')!, 10);
const UPDATE_MANIFEST = argBool('update-manifest', true);

// ---------- PATHS ----------
const ROOT = process.cwd();
const LOTTIE_DIR = path.join(ROOT, 'public/emoji/lottie');
const SPRITE_DIR = path.join(ROOT, 'public/emoji/sprite');
const SVG_DIR    = path.join(ROOT, 'public/emoji/svg');
const MANIFEST_PATH = path.join(ROOT, 'emoji-manifest.json');

// ---------- TYPES ----------
type ManLottie = { shortcode: string; file: string; url: string; categories?: string[] };
type ManSprite = { shortcode: string; file: string; meta: string; url: string; metaUrl: string; categories?: string[] };
type ManImg    = { shortcode: string; file: string; url: string; categories?: string[] };
type Manifest  = { lottie?: ManLottie[]; sprite?: ManSprite[]; svg?: ManImg[] };

// ---------- UTILS ----------
const ensureDir = (p: string) => fs.mkdir(p, { recursive: true });
const baseNoExt = (f: string) => f.replace(/\.[^.]+$/, '');
const fileUrl = (p: string) => {
  const full = path.resolve(p).replace(/\\/g, '/');
  return 'file://' + (full.startsWith('/') ? '' : '/') + full;
};
async function readManifest(): Promise<Manifest | null> {
  try { return JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8')) as Manifest; }
  catch { return null; }
}
async function writeManifest(man: Manifest) {
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(man, null, 2), 'utf8');
}
async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let t: any;
  const guard = new Promise<never>((_, rej) => t = setTimeout(() => rej(new Error(`${label} timeout`)), ms));
  try { return await Promise.race([p, guard]); }
  finally { clearTimeout(t); }
}

// ---------- RENDER ----------
async function renderFramesForLottie(jsonPath: string): Promise<Buffer[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 1 });
  
      // 1) Заглушка-страница
      await page.setContent(
        `<!doctype html><html><body style="margin:0;background:transparent">
           <div id="stage" style="width:${SIZE}px;height:${SIZE}px"></div>
         </body></html>`,
        { waitUntil: 'load' }
      );
  
      // 2) Lottie локально
      const lottiePath = require.resolve('lottie-web/build/player/lottie.min.js');
      await page.addScriptTag({ path: lottiePath });
  
      // 3) Инжектим JSON как animationData (без eval функций — чтобы не было __name)
      const jsonText = await fs.readFile(jsonPath, 'utf8');
      await page.addScriptTag({ content: `window.__ANIM_DATA = ${jsonText};` });
  
      // 4) Инжектим простые хелперы в окно
      await page.addScriptTag({
        content: `
          (function(){
            window.__initLottieData = function(size){
              return new Promise(function(res){
                var container = document.getElementById('stage');
                var anim = lottie.loadAnimation({
                  container: container,
                  renderer: 'canvas',
                  loop: false,
                  autoplay: false,
                  animationData: window.__ANIM_DATA,
                  rendererSettings: { clearCanvas: true }
                });
                window.anim = anim;
                container.style.width = size + 'px';
                container.style.height = size + 'px';
                function done(){ try{ anim.removeEventListener('DOMLoaded', done); anim.removeEventListener('data_ready', done);}catch(e){}; res(true); }
                anim.addEventListener('DOMLoaded', done);
                anim.addEventListener('data_ready', done);
                setTimeout(done, 3000);
              });
            };
            window.__getTotalFrames = function(){
              var a = window.anim;
              if (!a) return 1;
              var d = (a.getDuration && a.getDuration(true)) || 0;
              var tf = a.totalFrames || 0;
              return Math.floor(d || tf || 1);
            };
            window.__gotoAndStop = function(fr){
              var a = window.anim;
              if (a) a.goToAndStop(fr, true);
            };
          })();
        `
      });
  
      // 5) Инициализация
      await withTimeout(page.evaluate(`window.__initLottieData(${SIZE})`), 30000, 'init');
  
      // 6) Получаем количество кадров
      const totalFrames: number = await withTimeout(
        page.evaluate('window.__getTotalFrames()') as Promise<number>,
        5000,
        'getDuration'
      );
  
      const capped = Math.max(1, Math.min(totalFrames || 1, 2000));
      const take   = Math.min(MAX, capped);
      const step   = Math.max(1, Math.floor(capped / take));
  
      const idx: number[] = [];
      for (let f = 0; f < capped; f += step) idx.push(f);
      if (idx[idx.length - 1] !== capped - 1) idx.push(capped - 1);
  
      // 7) Снимаем кадры (важно: прозрачный фон)
      const frames: Buffer[] = [];
      for (const f of idx) {
        await withTimeout(page.evaluate(`window.__gotoAndStop(${f})`), 3000, `goToAndStop@${f}`);
        const el = await page.$('#stage');
        if (!el) throw new Error('stage not found');
        const buf = await withTimeout(
          el.screenshot({ type: 'png', omitBackground: true }) as Promise<Buffer>,
          5000,
          `screenshot@${f}`
        );
        frames.push(buf);
      }
      return frames;
    } finally {
      await browser.close();
    }
  }

// ---------- COMPOSE ----------
async function composeSprite(frames: Buffer[]) {
  const n = frames.length;
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const spriteW = cols * SIZE;
  const spriteH = rows * SIZE;

  const composites: sharp.OverlayOptions[] = [];
  for (let i = 0; i < n; i++) {
    const x = (i % cols) * SIZE;
    const y = Math.floor(i / cols) * SIZE;
    composites.push({ input: frames[i], left: x, top: y });
  }

  let img = sharp({
    create: {
      width: spriteW, height: spriteH, channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  }).composite(composites);

  const spriteBuf = FORMAT === 'webp'
    ? await img.webp({ quality: QUALITY, lossless: LOSSLESS }).toBuffer()
    : await img.png({ compressionLevel: 9, quality: QUALITY }).toBuffer();

  // превью первого кадра в выбранном формате
  const firstBuf = FORMAT === 'webp'
    ? await sharp(frames[0]).webp({ quality: QUALITY, lossless: LOSSLESS }).toBuffer()
    : await sharp(frames[0]).png({ compressionLevel: 9, quality: QUALITY }).toBuffer();

  return { spriteBuf, firstBuf, cols, rows, frames: n, w: SIZE, h: SIZE };
}

// ---------- MAIN ----------
async function main() {
  await ensureDir(SPRITE_DIR);
  await ensureDir(SVG_DIR);

  const man = (await readManifest()) || {};
  const lottieMap = new Map((man.lottie ?? []).map(it => [it.file, it] as const));

  const files = (await fs.readdir(LOTTIE_DIR)).filter(f => f.endsWith('.json'));

  for (const f of files) {
    const base = baseNoExt(f);
    const jsonPath = path.join(LOTTIE_DIR, f);
    console.log(`→ Render ${f} (${SIZE}px, max ${MAX} frames, ${FORMAT} q=${QUALITY}${FORMAT==='webp'&&LOSSLESS?' lossless':''})`);
    try {
      const frames = await renderFramesForLottie(jsonPath);
      if (!frames.length) { console.warn(`  × no frames, skip ${f}`); continue; }

      const assembled = await composeSprite(frames);

      const spriteName = `${base}.${FORMAT}`;
      const metaName   = `${base}.json`;
      const previewName = `${base}.${FORMAT}`; // кладем в svg/ как статичный кадр

      await fs.writeFile(path.join(SPRITE_DIR, spriteName), assembled.spriteBuf);
      await fs.writeFile(path.join(SPRITE_DIR, metaName), JSON.stringify({
        w: assembled.w, h: assembled.h, frames: assembled.frames,
        fps: FPS, cols: assembled.cols, rows: assembled.rows
      }, null, 2), 'utf8');

      await fs.writeFile(path.join(SVG_DIR, previewName), assembled.firstBuf);

      console.log(`  ✓ sprite: /emoji/sprite/${spriteName} + ${metaName}`);
      console.log(`  ✓ static: /emoji/svg/${previewName}`);

      if (UPDATE_MANIFEST) {
        man.sprite = man.sprite ?? [];
        man.svg    = man.svg    ?? [];
        const lo = lottieMap.get(f);

        if (lo && !man.sprite.some(s => s.file === spriteName)) {
          man.sprite.push({
            shortcode: lo.shortcode,
            file: spriteName,
            meta: metaName,
            url: `file:///public/emoji/sprite/${spriteName}`,
            metaUrl: `file:///public/emoji/sprite/${metaName}`,
            categories: lo.categories ?? []
          });
        }
        if (lo && !man.svg.some(s => s.file === previewName)) {
          man.svg.push({
            shortcode: lo.shortcode,
            file: previewName,
            url: `file:///public/emoji/svg/${previewName}`,
            categories: lo.categories ?? []
          });
        }
      }
    } catch (e: any) {
      console.warn(`  × skip ${f}: ${e?.message || e}`);
    }
  }

  if (UPDATE_MANIFEST) {
    await writeManifest(man as Manifest);
    console.log('✓ emoji-manifest.json updated (sprite/svg entries)');
  }
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
