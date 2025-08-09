import React, { useMemo } from 'react';
import { toTwemojiHTML } from './twemojify';

export default function TwemojiText({ text }: { text: string }) {
  const __html = useMemo(() => toTwemojiHTML(text || ''), [text]);
  return <span className="emoji-text" dangerouslySetInnerHTML={{ __html }} />;
}

