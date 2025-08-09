import React, { useState, useRef, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import type { Emoji } from '@emoji-mart/data';
import type { DesignTokens } from '../../../shared/config/tokens';

type Props = {
  tokens: DesignTokens;
  onSend?: (text: string) => void;
};

export const MessageInput: React.FC<Props> = ({ tokens, onSend }) => {
  const [value, setValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const attachBtnRef = useRef<HTMLButtonElement>(null);
  const emojiPanelRef = useRef<HTMLDivElement>(null);
  const attachPanelRef = useRef<HTMLDivElement>(null);

  const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.35 : 200;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const next = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${next}px`;
      textareaRef.current.style.overflowY = textareaRef.current.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  };

  const handleSend = () => {
    if (!value.trim()) return;
    onSend?.(value);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleEmojiSelect = (emoji: Emoji & { native?: string }) => {
    setValue((prev) => prev + (emoji.native || ''));
    textareaRef.current?.focus();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowEmoji(false);
        setShowAttach(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        showEmoji &&
        emojiPanelRef.current &&
        !emojiPanelRef.current.contains(e.target as Node) &&
        !emojiBtnRef.current?.contains(e.target as Node)
      ) {
        setShowEmoji(false);
      }
      if (
        showAttach &&
        attachPanelRef.current &&
        !attachPanelRef.current.contains(e.target as Node) &&
        !attachBtnRef.current?.contains(e.target as Node)
      ) {
        setShowAttach(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showEmoji, showAttach]);

  return (
    <div
      className="px-6 pb-5 pt-3 flex justify-center border-t"
      style={{
        background: String(tokens.color['bg.input.container']),
        borderColor: String(tokens.color['bg.panel.border']),
        boxShadow: '0 -1px 2px rgba(17,19,21,0.06)'
      }}
    >
      <div className="flex items-end w-full max-w-2xl gap-2 relative">
        <div
          className="flex items-end flex-1 relative"
          style={{
            background: String(tokens.color['bg.input.field']),
            borderRadius: tokens.radius?.xl ? `${tokens.radius.xl}px` : undefined,
            paddingLeft: tokens.space?.md,
            paddingRight: tokens.space?.md,
            paddingTop: tokens.space?.sm,
            paddingBottom: tokens.space?.sm
          }}
        >
          <button
            ref={emojiBtnRef}
            type="button"
            onClick={() => {
              setShowEmoji((v) => !v);
              setShowAttach(false);
            }}
            className="mr-2 cursor-pointer flex items-center justify-center"
            style={{
              width: 24,
              height: 24,
              color: String(tokens.color['icon.normal']),
              borderRadius: tokens.radius?.pill ? `${tokens.radius.pill}px` : undefined
            }}
          >
            😊
          </button>
          {showEmoji && (
            <div
              ref={emojiPanelRef}
              className="absolute"
              style={{
                bottom: `calc(100% + ${tokens.space?.sm}px)`,
                left: 0,
                zIndex: tokens.z?.panels,
                background: String(tokens.color['bg.panel']),
                border: `1px solid ${tokens.color['bg.panel.border']}`,
                boxShadow: String(tokens.color['shadow.panel']),
                borderRadius: tokens.radius?.lg ? `${tokens.radius.lg}px` : undefined
              }}
            >
              <Picker data={data} onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            placeholder="Message"
            rows={1}
            className="flex-1 bg-transparent focus:outline-none resize-none overflow-hidden"
            style={{
              color: String(tokens.color['text.primary']),
              minHeight: 44,
              maxHeight: maxHeight,
              scrollbarWidth: 'thin'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            ref={attachBtnRef}
            type="button"
            onClick={() => {
              setShowAttach((v) => !v);
              setShowEmoji(false);
            }}
            className="ml-2 cursor-pointer flex items-center justify-center"
            style={{
              width: 24,
              height: 24,
              color: String(tokens.color['icon.accent']),
              borderRadius: tokens.radius?.pill ? `${tokens.radius.pill}px` : undefined
            }}
          >
            📎
          </button>
          {showAttach && (
            <div
              ref={attachPanelRef}
              className="absolute"
              style={{
                bottom: `calc(100% + ${tokens.space?.sm}px)`,
                right: 0,
                zIndex: tokens.z?.panels,
                background: String(tokens.color['bg.panel']),
                border: `1px solid ${tokens.color['bg.panel.border']}`,
                boxShadow: String(tokens.color['shadow.panel']),
                borderRadius: tokens.radius?.lg ? `${tokens.radius.lg}px` : undefined,
                width: 220
              }}
            >
              <ul className="py-2">
                {['Фото или видео', 'Файл', 'Checklist', 'Кошелёк'].map((item) => (
                  <li
                    key={item}
                    className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-black/5"
                    style={{ color: String(tokens.color['text.primary']) }}
                  >
                    <span style={{ color: String(tokens.color['icon.accent']) }}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={!value.trim()}
          className="flex items-center justify-center cursor-pointer flex-shrink-0"
          style={{
            width: 44,
            height: 44,
            borderRadius: tokens.radius?.pill ? `${tokens.radius.pill}px` : undefined,
            background: String(
              value.trim()
                ? tokens.color['bg.send.enabled']
                : tokens.color['bg.send.disabled']
            ),
            opacity: value.trim() ? 1 : 0.6,
            color: '#fff'
          }}
        >
          ✈️
        </button>
      </div>
    </div>
  );
};

export default MessageInput;

