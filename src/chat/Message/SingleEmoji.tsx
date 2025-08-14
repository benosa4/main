import { AnimatedEmoji } from '../../emoji';
import { Tone } from '../../emoji/emojiMap';

export interface SingleEmojiProps {
  name: string;
  tone?: Tone;
  size?: number;
}

/**
 * Renders a single large emoji with animation enabled.
 */
export function SingleEmoji({ name, tone = 'default', size = 72 }: SingleEmojiProps) {
  return <AnimatedEmoji name={name} skinTone={tone} size={size} animate />;
}
