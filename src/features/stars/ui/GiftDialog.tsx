import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface Contact { id: string; name: string; subtitle?: string; avatarUrl?: string }

export default function GiftDialog({ open, onClose, onSubmit, search }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (contactId: string) => void | Promise<void>;
  search: (query: string, page: number) => Promise<{ items: Contact[]; nextPage?: number }>;
}) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = window.setTimeout(async () => {
      const res = await search(q, 1);
      setItems(res.items);
      setPage(res.nextPage || 2);
    }, 300) as unknown as number;
    return () => { if (tRef.current) clearTimeout(tRef.current); };
  }, [q, open, search]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-10">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-[min(92vw,420px)] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#E5E7EB' }}>
            <div className="font-semibold">Подарить звёзды</div>
            <button aria-label="Закрыть" className="w-8 h-8 rounded-full grid place-items-center text-black hover:bg-black/10" onClick={onClose}>×</button>
          </div>
          <div className="p-4">
            <input
              placeholder="Поиск"
              className="w-full px-3 py-2 rounded-md border" style={{ borderColor: '#E5E7EB' }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="mt-3 max-h-[280px] overflow-y-auto">
              {items.map((c) => (
                <button key={c.id} className={`w-full flex items-center gap-3 px-2 py-2 rounded-md ${selected===c.id?'bg-[#E6F4FF]':''}`} onClick={() => setSelected(c.id)} aria-selected={selected===c.id}>
                  <img src={c.avatarUrl || 'https://placehold.co/36x36'} className="w-9 h-9 rounded-md object-cover" />
                  <div className="flex-1 text-left">
                    <div className="text-[14px] font-semibold">{c.name}</div>
                    <div className="text-[12px] text-[#6B7280]">{c.subtitle || 'был(а) недавно'}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <button
                className="w-full h-12 rounded-xl text-white font-semibold disabled:opacity-60"
                style={{ background: '#1887F2' }}
                onClick={() => selected && onSubmit(selected)}
                disabled={!selected}
              >
                ПРОДОЛЖИТЬ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

