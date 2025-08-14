import { createRoot } from 'react-dom/client';
import { AnimatedEmoji } from './AnimatedEmoji';
import { Tone } from './emojiMap';

interface Options {
  root: HTMLElement;
  name: string;
  tone?: Tone;
  size?: number;
}

/**
 * Inserts an emoji at the current caret position inside a `contentEditable`
 * element. The emoji is wrapped in a non-editable span with metadata so it can
 * later be parsed back to a shortcode.
 */
export function insertEmojiAtCaret({
  root,
  name,
  tone = 'default',
  size = 20,
}: Options) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  if (!range) return;

  const span = document.createElement('span');
  span.className = 'emoji';
  span.setAttribute('data-name', name);
  span.setAttribute('data-tone', tone);
  span.contentEditable = 'false';

  const rootNode = createRoot(span);
  rootNode.render(
    <AnimatedEmoji name={name} skinTone={tone} size={size} animate={false} />
  );

  // Insert the emoji and a hair space after it to move the caret.
  range.deleteContents();
  range.insertNode(span);
  const space = document.createTextNode('\u200A');
  span.after(space);

  // Place caret after the inserted space.
  range.setStartAfter(space);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);

  // Ensure root keeps focus after insertion.
  root.focus();
}
