import { Fragment } from 'react';
import { AnimatedEmoji } from '../../emoji';
import { SingleEmoji } from './SingleEmoji';

const EMOJI_RE = /:[a-zA-Z0-9_+-]+:/g;

function isEmoji(token: string) {
  return /^:[a-zA-Z0-9_+-]+:$/.test(token);
}

export interface MessageRendererProps {
  message: string;
}

/**
 * Very small message renderer that understands emoji shortcodes. If a message
 * consists of a single shortcode it renders a large animated emoji via
 * `SingleEmoji`. Otherwise shortcodes are replaced with inline static emojis.
 */
export function MessageRenderer({ message }: MessageRendererProps) {
  const parts: string[] = [];
  let last = 0;
  message.replace(EMOJI_RE, (m, offset) => {
    parts.push(message.slice(last, offset));
    parts.push(m);
    last = offset + m.length;
    return m;
  });
  parts.push(message.slice(last));

  const emojis = parts.filter(isEmoji);
  if (emojis.length === 1 && parts.length === 1) {
    return <SingleEmoji name={emojis[0]} />;
  }

  return (
    <span>
      {parts.map((part, i) => (
        isEmoji(part) ? (
          <AnimatedEmoji key={i} name={part} animate={false} />
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      ))}
    </span>
  );
}
