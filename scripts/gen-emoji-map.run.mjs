import './tsnode-register.mjs';

try {
  await import('./gen-emoji-map.ts');
} catch (e) {
  console.error('gen-emoji-map.ts failed:', e?.stack || e);
  process.exit(1);
}
