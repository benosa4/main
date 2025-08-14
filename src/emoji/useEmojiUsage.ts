import { useEffect, useState } from 'react';
import { Tone } from './emojiMap';
import { bumpUsage, getTopRecents, UsageRow } from './emojiDb';

export function useEmojiUsage(maxRecents = 36) {
  const [recents, setRecents] = useState<UsageRow[]>([]);

  const load = async () => {
    const rows = await getTopRecents(maxRecents);
    setRecents(rows);
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
