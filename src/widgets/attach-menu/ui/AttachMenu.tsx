import { useAnchoredPanel } from '../../../shared/utils';
import { RefObject, useEffect, useRef } from 'react';
import { Image, File, ListTodo, Wallet } from 'lucide-react';

interface Props {
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

const items = [
  { icon: Image, label: 'Photo/Video' },
  { icon: File, label: 'File' },
  { icon: ListTodo, label: 'Checklist' },
  { icon: Wallet, label: 'Wallet' },
];

export function AttachMenu({ anchorRef, onClose }: Props) {
  const style = useAnchoredPanel(anchorRef);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={style}
      className="w-40 bg-white/95 rounded-2xl border border-neutral-200 shadow-xl py-2"
    >
      {items.map(({ icon: Icon, label }) => (
        <button
          key={label}
          className="flex w-full items-center gap-2 px-3 h-10 hover:bg-black/5 cursor-pointer"
        >
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
