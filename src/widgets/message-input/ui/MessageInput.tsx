import { useRef, useState } from 'react';
import { Smile, Paperclip, Send } from 'lucide-react';
import { EmojiPanel } from '../../emoji-panel';
import { AttachMenu } from '../../attach-menu';
import twemoji from 'twemoji';

interface Props {
  onSend?: (text: string) => void;
}

export function MessageInput({ onSend }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const attachBtnRef = useRef<HTMLButtonElement>(null);
  const [value, setValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);

  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const max = window.innerHeight * 0.35;
    el.style.height = Math.min(el.scrollHeight, max) + 'px';
  };

  const handleSend = () => {
    if (!value.trim()) return;
    onSend?.(value);
    window.dispatchEvent(new CustomEvent("new-message", { detail: value }));
    console.log(twemoji.parse(value));
    setValue('');
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
    }
  };

  return (
    <div className="sticky bottom-0 z-10 border-t border-neutral-200 bg-white px-3 py-2">
      <div className="relative mx-auto max-w-[980px] flex items-end gap-2">
        <div className="relative flex-1">
          <button
            ref={emojiBtnRef}
            onClick={() => {
              setShowEmoji((v) => !v);
              setShowAttach(false);
            }}
            className="absolute left-2 bottom-1.5 grid place-items-center w-8 h-8 rounded-full hover:bg-black/5 emoji-ui cursor-pointer"
            aria-label="Emoji"
          >
            <Smile size={20} />
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              autoGrow();
            }}
            className="w-full min-h-11 max-h-[35vh] pl-12 pr-14 py-2 rounded-[22px] bg-neutral-100 focus:outline-none emoji-text resize-none"
            placeholder="Message"
          />

          <button
            ref={attachBtnRef}
            onClick={() => {
              setShowAttach((v) => !v);
              setShowEmoji(false);
            }}
            className="absolute right-12 bottom-1.5 grid place-items-center w-8 h-8 rounded-full hover:bg-black/5 cursor-pointer"
            aria-label="Attach"
          >
            <Paperclip size={20} />
          </button>
        </div>

        <button
          disabled={!value.trim()}
          onClick={handleSend}
          className="grid place-items-center w-11 h-11 rounded-full transition disabled:bg-[#B9D7F6] bg-[#3390EC] shadow-sm text-white cursor-pointer"
          aria-label="Send"
        >
          <Send size={20} />
        </button>
      </div>

      {showEmoji && (
        <EmojiPanel
          anchorRef={emojiBtnRef}
          onSelect={(emoji: { native: string }) => setValue((v) => v + emoji.native)}
          onClose={() => setShowEmoji(false)}
        />
      )}
      {showAttach && (
        <AttachMenu anchorRef={attachBtnRef} onClose={() => setShowAttach(false)} />
      )}
    </div>
  );
}
