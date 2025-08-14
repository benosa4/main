import './tsnode-register.mjs';

try {
  await import('./download-emojis.ts');
} catch (e) {
  console.error('download-emojis.ts failed:', e?.stack || e);
  process.exit(1);
}
