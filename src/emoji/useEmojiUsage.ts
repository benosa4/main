import { useEffect, useState } from 'react';
import { Tone } from './emojiMap';
import { bumpUsage, getTopRecents, UsageRow } from './emojiDb';

// оставить только первое вхождение по name, порядок сохраняем
function dedupByName(rows: UsageRow[]): UsageRow[] {
  const seen = new Set<string>();
  const out: UsageRow[] = [];
  for (const r of rows) {
    if (seen.has(r.name)) continue;
    seen.add(r.name);
    out.push(r);
  }
  return out;
}

export function useEmojiUsage(maxRecents = 36) {
  const [recents, setRecents] = useState<UsageRow[]>([]);

  const load = async () => {
    const rows = await getTopRecents(maxRecents);
    setRecents(dedupByName(rows)); // 🔧 убираем дубли по имени
  };

  useEffect(() => {
    load();
  }, [maxRecents]);

  const bump = async (name: string, tone: Tone) => {
    await bumpUsage(name, tone);
    await load();
  };

  return { recents, bump };
}

export type { UsageRow } from './emojiDb';
