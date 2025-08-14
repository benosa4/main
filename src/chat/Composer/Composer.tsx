import { useRef, useState } from 'react';
import { EmojiPicker, insertEmojiAtCaret, emojiConfig } from '../../emoji';

/**
 * Chat message composer with emoji picker integration. The editor itself is a
 * basic `contentEditable` div. Selected emojis are inserted at the caret
 * position using `insertEmojiAtCaret`.
 */
export function Composer() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  return (
    <div className="composer">
      <div ref={editorRef} className="editor" contentEditable />
      <button
        ref={anchorRef}
        aria-label="Emoji"
        type="button"
        onClick={() => setOpen((v) => !v)}
      >
        😊
      </button>
      <EmojiPicker
        open={open}
        anchorEl={anchorRef.current}
        alignEl={editorRef.current}
        onClose={() => setOpen(false)}
        onPick={({ name, tone }) => {
          if (editorRef.current) {
            insertEmojiAtCaret({ root: editorRef.current, name, tone });
          }
          setOpen(false);
        }}
        defaultTone="default"
        persistToneKey="emoji_last_tone"
        animateInsidePicker={emojiConfig.pickerAnimations}
      />
    </div>
  );
}
