import React, {
    useEffect, useRef, forwardRef, useImperativeHandle, KeyboardEvent
  } from 'react';
  import { toTwemojiHTML } from './twemojify';
  
  export type TwemojiInputHandle = {
    insert: (text: string) => void;
    focus: () => void;
  };
  
  type Props = {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    className?: string;
    onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
  };
  
  function htmlToPlain(html: string) {
    const div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll('img.twemoji').forEach((img) => {
      const alt = (img as HTMLImageElement).getAttribute('alt') || '';
      img.replaceWith(document.createTextNode(alt));
    });
    div.querySelectorAll('br').forEach((br) => br.replaceWith(document.createTextNode('\n')));
    return div.textContent || '';
  }
  
  function insertAtCaret(el: HTMLElement, text: string) {
    el.focus();
    const sel = window.getSelection();
    if (!sel) return;
    let range = sel.rangeCount ? sel.getRangeAt(0) : null;
    if (!range || !el.contains(range.startContainer)) {
      range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
    }
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }
  
  const TwemojiInput = forwardRef<TwemojiInputHandle, Props>(
    ({ value, onChange, placeholder, className, onKeyDown }, ref) => {
      const divRef = useRef<HTMLDivElement>(null);
  
      // Внешний API
      useImperativeHandle(ref, () => ({
        insert(text: string) {
          if (!divRef.current) return;
          insertAtCaret(divRef.current, text);
          // синхронизируем наружу
          onChange(htmlToPlain(divRef.current.innerHTML));
        },
        focus() {
          divRef.current?.focus();
        },
      }));
  
      // Ререндерим twemoji при изменении value
      useEffect(() => {
        if (!divRef.current) return;
        const html = toTwemojiHTML(value).replace(/\n/g, '<br>');
        if (divRef.current.innerHTML !== html) {
          divRef.current.innerHTML = html;
        }
      }, [value]);
  
      return (
        <div
          ref={divRef}
          contentEditable
          role="textbox"
          aria-multiline="true"
          data-placeholder={placeholder || ''}
          className={`emoji-text whitespace-pre-wrap break-words outline-none w-full ${className || ''}`}
          onInput={() => {
            if (!divRef.current) return;
            onChange(htmlToPlain(divRef.current.innerHTML));
          }}
          onKeyDown={onKeyDown}
        />
      );
    }
  );
  
  export default TwemojiInput;
  