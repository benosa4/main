import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import OrangeStarBurst from './OrangeStarBurst';
import PurchaseGrid, { StarPackage } from './PurchaseGrid';
import HistoryList, { Operation } from './HistoryList';
import GiftDialog from './GiftDialog';

export interface OperationPage { items: Operation[]; nextPage?: number }
export interface ContactPage { items: { id: string; name: string; subtitle?: string; avatarUrl?: string }[]; nextPage?: number }

export interface StarsModalProps {
  open: boolean;
  onClose: () => void;
  balance: { amount: number };
  historyApi: { fetch: (filter: 'all'|'income'|'outcome', page: number) => Promise<OperationPage> };
  purchaseApi: { list: () => Promise<StarPackage[]>; buy: (packId: string) => Promise<void> };
  giftApi: { searchContacts: (query: string, page: number) => Promise<ContactPage>; startGift: (contactId: string) => Promise<void> };
}

// Mocks when not provided
const mockHistory: Operation[] = Array.from({ length: 20 }, (_, i) => ({
  id: `op-${i+1}`,
  title: i % 3 === 0 ? 'Покупка в Mini App' : 'Зачисление бонусов',
  subtitle: i % 3 === 0 ? 'Оплата контента' : 'Подарок от друга',
  date: 'сегодня, 12:3' + (i%10),
  sign: i % 3 === 0 ? '-' : '+',
  amount: (i % 3 === 0 ? 75 : 100) + i,
  avatarUrl: 'https://placehold.co/36x36',
}));

const mockPacks: StarPackage[] = [
  { id: 'p100', qty: 100, price: 99 },
  { id: 'p250', qty: 250, price: 249 },
  { id: 'p500', qty: 500, price: 499 },
  { id: 'p1000', qty: 1000, price: 999 },
  { id: 'p2500', qty: 2500, price: 2390 },
  { id: 'p10000', qty: 10000, price: 9290 },
  { id: 'p50000', qty: 50000, price: 43900 },
  { id: 'p150000', qty: 150000, price: 129900 },
  { id: 'p2500b', qty: 2500, price: 2490 },
  { id: 'p5000b', qty: 5000, price: 4790 },
  { id: 'p10000b', qty: 10000, price: 9490 },
  { id: 'p25000b', qty: 25000, price: 23490 },
  { id: 'p50000b', qty: 50000, price: 45990 },
  { id: 'p100000b', qty: 100000, price: 89990 },
  { id: 'p150000b', qty: 150000, price: 134990 },
];

export default function StarsModal({ open, onClose, balance, historyApi, purchaseApi, giftApi }: StarsModalProps) {
  const [view, setView] = useState<'home'|'purchase'>('home');
  const [tab, setTab] = useState<'all'|'income'|'outcome'>('all');
  const [ops, setOps] = useState<Operation[]>([]);
  const [packs, setPacks] = useState<StarPackage[]>([]);
  const [giftOpen, setGiftOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastActive = useRef<HTMLElement | null>(null);

  // Load initial
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const { items } = await (historyApi?.fetch?.(tab, 1) || Promise.resolve({ items: mockHistory }));
        setOps(items);
        const list = await (purchaseApi?.list?.() || Promise.resolve(mockPacks));
        setPacks(list);
      } catch {}
    })();
  }, [open, tab, historyApi, purchaseApi]);

  // Focus trap and close by Esc/backdrop
  useEffect(() => {
    if (!open) return;
    lastActive.current = (document.activeElement as HTMLElement) || null;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusSel = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => dialog.querySelectorAll<HTMLElement>(focusSel);
    const f = getFocusable();
    (f[0] || dialog).focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key === 'Tab') {
        const list = getFocusable();
        if (!list.length) return;
        const idx = Array.prototype.indexOf.call(list, document.activeElement);
        if (e.shiftKey) {
          if (idx <= 0) { e.preventDefault(); (list[list.length - 1] as HTMLElement).focus(); }
        } else {
          if (idx === list.length - 1) { e.preventDefault(); (list[0] as HTMLElement).focus(); }
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); lastActive.current?.focus(); };
  }, [open, onClose]);

  if (!open) return null;

  const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n);

  const content = (
    <div role="dialog" aria-modal className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-3">
        <div ref={dialogRef} className="w-[min(92vw,420px)] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] outline-none overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <button aria-label="Закрыть" className="w-8 h-8 rounded-full grid place-items-center text-black hover:bg-black/10" onClick={onClose}>×</button>
            <div className="text-sm font-semibold flex items-center gap-1" title="Баланс">
              Баланс <span aria-hidden>⭐</span> {fmt(balance.amount)}
            </div>
          </div>

          <div className="px-6">
            <div className="w-full" style={{ height: 120 }}>
              <OrangeStarBurst size={96} />
            </div>
            <h2 className="mt-1 font-semibold text-[20px] leading-[1.2]" style={{ color: '#1F2937' }}>Звёзды Telegram</h2>
            <p className="text-[14px] leading-[1.5]" style={{ color: '#4A5568' }}>
              Звёзды Telegram нужны для оплаты контента и услуг в мини‑приложениях.
            </p>
          </div>

          {/* Views */}
          {view === 'home' && (
            <div className="px-6 mt-3">
              <button className="w-full h-12 rounded-xl text-white font-semibold" style={{ background: '#1887F2' }} onClick={() => setView('purchase')}>КУПИТЬ ЗВЁЗДЫ</button>
              <div className="mt-2">
                <button className="text-[#1C7BEF] hover:underline" onClick={() => setGiftOpen(true)}>Подарить звёзды друзьям</button>
              </div>
              <div className="h-px my-3" style={{ background: '#E5E7EB' }} />
              {/* Tabs */}
              <div className="flex items-center gap-4 border-b" style={{ borderColor: '#E5E7EB' }}>
                {([
                  { id: 'all', label: 'Все операции' },
                  { id: 'income', label: 'Зачисления' },
                  { id: 'outcome', label: 'Списания' },
                ] as const).map(t => (
                  <button key={t.id} className="relative py-2 text-sm" onClick={async () => {
                    setTab(t.id as any);
                    try { const { items } = await (historyApi?.fetch?.(t.id as any, 1) || Promise.resolve({ items: mockHistory })); setOps(items); } catch {}
                  }} style={{ color: tab===t.id? '#1C7BEF' : '#374151' }}>
                    {t.label}
                    {tab === t.id && <span className="absolute left-0 right-0 -bottom-[1px] h-0.5" style={{ background: '#1C7BEF' }} />}
                  </button>
                ))}
              </div>
              <div className="max-h-[300px] overflow-y-auto py-2">
                <HistoryList items={ops} />
              </div>
            </div>
          )}

          {view === 'purchase' && (
            <div className="px-6 mt-3">
              <PurchaseGrid packs={packs} onShowMore={() => { /* no-op */ }} />
              <div className="mt-3 text-[12px] text-[#6B7280]">
                Приобретая звёзды, Вы принимаете <a href="#" className="text-[#1C7BEF] underline">условия Telegram</a>.
              </div>
              <div className="h-px my-3" style={{ background: '#E5E7EB' }} />
              <div className="mb-3">
                <div className="text-sm mb-2" style={{ color: '#374151' }}>История</div>
                <div className="max-h-[280px] overflow-y-auto">
                  <HistoryList items={ops} />
                </div>
              </div>
            </div>
          )}

          {/* Gift overlay */}
          <GiftDialog
            open={giftOpen}
            onClose={() => setGiftOpen(false)}
            onSubmit={async () => { setGiftOpen(false); }}
            search={async (query: string) => {
              const items = Array.from({ length: 15 }, (_, i) => ({ id: `c${i}`, name: `Контакт ${i+1}`, subtitle: 'был(а) недавно', avatarUrl: 'https://placehold.co/36x36' }))
                .filter(c => c.name.toLowerCase().includes((query||'').toLowerCase()));
              return { items }; 
            }}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

