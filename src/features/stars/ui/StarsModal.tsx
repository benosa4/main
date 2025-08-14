import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import OrangeStarBurst from './OrangeStarBurst';
import PurchaseGrid, { StarPackage } from './PurchaseGrid';
import HistoryList, { Operation } from './HistoryList';
import { GiftContactsDialog, Contact as GiftContact } from '../../gifting';

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
  const giftBtnRef = useRef<HTMLButtonElement>(null);
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
    <Dialog.Root open={open} onOpenChange={(o)=>{ if(!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-[10000] grid place-items-center p-3 outline-none">
          <div
            ref={dialogRef}
            className="w-[min(92vw,420px)] h-[560px] sm:h-[600px] max-h-[92vh] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col"
          >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <Dialog.Close asChild>
              <button aria-label="Закрыть" className="w-8 h-8 rounded-full grid place-items-center text-black hover:bg-black/10">×</button>
            </Dialog.Close>
            <div className="text-sm font-semibold flex items-center gap-1" title="Баланс">
              Баланс <span aria-hidden>⭐</span> {fmt(balance.amount)}
            </div>
          </div>

          {/* Hero (non-scrollable) */}
          <div className="px-6 shrink-0">
            <div className="w-full" style={{ height: 120 }}>
              <OrangeStarBurst size={96} />
            </div>
            <Dialog.Title className="mt-1 font-semibold text-[20px] leading-[1.2]" style={{ color: '#1F2937' }}>Звёзды Telegram</Dialog.Title>
            <Dialog.Description className="text-[14px] leading-[1.5]" style={{ color: '#4A5568' }}>
              Звёзды Telegram нужны для оплаты контента и услуг в мини‑приложениях.
            </Dialog.Description>
          </div>

          {/* Views in scroll area */}
          {view === 'home' && (
            <div className="flex-1 overflow-y-auto px-6 pt-3 pb-4">
              <button className="w-full h-12 rounded-xl text-white font-semibold" style={{ background: '#1887F2' }} onClick={() => setView('purchase')}>КУПИТЬ ЗВЁЗДЫ</button>
              <div className="mt-2">
                <button ref={giftBtnRef} className="text-[#1C7BEF] hover:underline" onClick={() => setGiftOpen(true)}>Подарить звёзды друзьям</button>
              </div>
              <div className="h-px my-3" style={{ background: '#E5E7EB' }} />
              <Tabs.Root value={tab} onValueChange={(v)=>setTab(v as any)}>
                <Tabs.List className="flex items-center gap-4 border-b" style={{ borderColor: '#E5E7EB' }}>
                  <Tabs.Trigger value="all" className="relative py-2 text-sm data-[state=active]:text-[#1C7BEF]">Все операции
                    {tab==='all' && <span className="absolute left-0 right-0 -bottom-[1px] h-0.5" style={{ background: '#1C7BEF' }} />}
                  </Tabs.Trigger>
                  <Tabs.Trigger value="income" className="relative py-2 text-sm data-[state=active]:text-[#1C7BEF]">Зачисления
                    {tab==='income' && <span className="absolute left-0 right-0 -bottom-[1px] h-0.5" style={{ background: '#1C7BEF' }} />}
                  </Tabs.Trigger>
                  <Tabs.Trigger value="outcome" className="relative py-2 text-sm data-[state=active]:text-[#1C7BEF]">Списания
                    {tab==='outcome' && <span className="absolute left-0 right-0 -bottom-[1px] h-0.5" style={{ background: '#1C7BEF' }} />}
                  </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="all" asChild>
                  <div className="max-h-[300px] overflow-y-auto py-2">
                    <HistoryList items={ops} />
                  </div>
                </Tabs.Content>
                <Tabs.Content value="income" asChild>
                  <div className="max-h-[300px] overflow-y-auto py-2">
                    <HistoryList items={ops.filter(o=>o.sign==='+')} />
                  </div>
                </Tabs.Content>
                <Tabs.Content value="outcome" asChild>
                  <div className="max-h-[300px] overflow-y-auto py-2">
                    <HistoryList items={ops.filter(o=>o.sign==='-')} />
                  </div>
                </Tabs.Content>
              </Tabs.Root>
            </div>
          )}

          {view === 'purchase' && (
            <div className="flex-1 overflow-y-auto px-6 pt-3 pb-4">
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
          <GiftContactsDialog
            open={giftOpen}
            onClose={() => { setGiftOpen(false); setTimeout(()=>giftBtnRef.current?.focus(), 0) }}
            onContinue={async (contact) => { setGiftOpen(false); await giftApi.startGift(contact.id); }}
            initialQuery={''}
            pageSize={30}
            fetchContacts={async ({ query, cursor, limit: _limit }) => {
              const pageNum = cursor ? parseInt(cursor, 10) : 1
              const res = await giftApi.searchContacts(query || '', pageNum)
              return { items: res.items as GiftContact[], nextCursor: res.nextPage ? String(res.nextPage) : null }
            }}
          />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );

  return createPortal(content, document.body);
}
