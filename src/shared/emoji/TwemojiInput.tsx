import React, {
    useEffect,
    useRef,
    forwardRef,
    useImperativeHandle,
    KeyboardEvent,
  } from 'react';
  import { toTwemojiHTML } from './twemojify';
  
  export type TwemojiInputHandle = {
    insert: (text: string) => void;
    focus: () => void;
    getElement: () => HTMLDivElement | null;
  };
  
  type Props = {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
  };
  
  // Превращаем HTML (с <img class="twemoji"> и <br>) в «плоский» текст: 😃 и \n
  function htmlToPlain(html: string) {
    const div = document.createElement('div');
    div.innerHTML = html;
    // заменить twemoji <img> на их alt (юникод-эмодзи)
    div.querySelectorAll('img.twemoji').forEach((img) => {
      const alt = (img as HTMLImageElement).getAttribute('alt') || '';
      img.replaceWith(document.createTextNode(alt));
    });
    // <br> → \n
    div.querySelectorAll('br').forEach((br) => {
      br.replaceWith(document.createTextNode('\n'));
    });
    // innerText корректно учитывает переносы строк
    let text = (div as any).innerText || div.textContent || '';
    text = text.replace(/\r\n/g, '\n').replace(/\n+$/g, '');
    return text;
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
  
  // Сколько «символов» в строке, где один эмодзи = 1 (используем Array.from для юникода)
  const uCount = (s: string) => Array.from(s).length;
  
  // Получаем позицию каретки в «плоском» тексте (эмодзи = 1, <br> = \n)
  function getCaretPlainOffset(root: HTMLElement): number | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const r = sel.getRangeAt(0);
  
    // Если курсор не внутри root — не трогаем
    if (!root.contains(r.startContainer)) return null;
  
    // Берём содержимое от начала root до позиции каретки и прогоняем через htmlToPlain
    const pre = document.createRange();
    pre.selectNodeContents(root);
    pre.setEnd(r.startContainer, r.startOffset);
  
    const tmp = document.createElement('div');
    tmp.appendChild(pre.cloneContents());
    const plain = htmlToPlain(tmp.innerHTML);
    return uCount(plain);
  }
  
  // Устанавливаем каретку по «плоскому» смещению
  function setCaretByPlainOffset(root: HTMLElement, target: number) {
    const sel = window.getSelection();
    if (!sel) return;
  
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ALL,
      null,
    );
  
    let acc = 0;
  
    function setInTextNode(node: Text, charIndex: number) {
      const text = node.nodeValue || '';
      // преобразуем «индекс по юникод-символам» → «индекс по code unit»
      const arr = Array.from(text);
      const cu = arr.slice(0, charIndex).join('').length;
      const range = document.createRange();
      range.setStart(node, Math.min(cu, text.length));
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  
    let node: Node | null = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = (node as Text).nodeValue || '';
        const len = uCount(text);
        if (target <= acc + len) {
          setInTextNode(node as Text, target - acc);
          return;
        }
        acc += len;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        // <img.twemoji> считаем как 1 символ
        if (el.tagName === 'IMG' && el.classList.contains('twemoji')) {
          const len = 1;
          if (target <= acc + len) {
            const range = document.createRange();
            // ставим каретку ПОСЛЕ картинки — можно печатать «между» эмодзи
            range.setStartAfter(el);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            return;
          }
          acc += len;
        } else if (el.tagName === 'BR') {
          const len = 1;
          if (target <= acc + len) {
            const range = document.createRange();
            range.setStartAfter(el);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            return;
          }
          acc += len;
        }
      }
      node = walker.nextNode();
    }
  
    // Если дошли сюда — ставим в конец
    const range = document.createRange();
    range.selectNodeContents(root);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }
  
  const TwemojiInput = forwardRef<TwemojiInputHandle, Props>(
    ({ value, onChange, placeholder, className, style, onKeyDown }, ref) => {
      const divRef = useRef<HTMLDivElement>(null);
  
      // Внешний API
      useImperativeHandle(ref, () => ({
        insert(text: string) {
          if (!divRef.current) return;
          insertAtCaret(divRef.current, text);
          onChange(htmlToPlain(divRef.current.innerHTML));
        },
        focus() {
          divRef.current?.focus();
        },
        getElement() {
          return divRef.current;
        },
      }));
  
      // Ререндерим twemoji при изменении value, сохранив/восстановив каретку
      useEffect(() => {
        const el = divRef.current;
        if (!el) return;
  
        // 1) Снимок позиции каретки (если фокус внутри)
        let caret: number | null = null;
        const sel = window.getSelection();
        if (sel && el.contains(sel.anchorNode)) {
          caret = getCaretPlainOffset(el);
        }
  
        // 2) Новое HTML (эмодзи → <img.twemoji>, \n → <br>)
        const html = toTwemojiHTML(value).replace(/\n/g, '<br>');
        if (el.innerHTML !== html) {
          el.innerHTML = html;
        }
  
        // 3) Восстановить каретку, если была внутри
        if (caret !== null) {
          setCaretByPlainOffset(el, caret);
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
          style={style}
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
  