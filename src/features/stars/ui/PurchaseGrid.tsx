import { useMemo, useState } from 'react';

export interface StarPackage { id: string; qty: number; price: number }

export default function PurchaseGrid({ packs, onShowMore }: { packs: StarPackage[]; onShowMore: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const visible = useMemo(() => {
    if (expanded) return packs;
    // show first 8 as per spec
    return packs.slice(0, 8);
  }, [packs, expanded]);

  const format = (n: number) => new Intl.NumberFormat('ru-RU').format(n);
  const price = (p: number) => {
    try { return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(p); }
    catch { return `${p} ₽`; }
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {visible.map((p) => (
          <div key={p.id} className="h-[72px] rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] hover:shadow-sm px-4 flex items-center justify-between">
            <div>
              <div className="text-[18px] font-semibold flex items-center gap-1">
                +{format(p.qty)} <span aria-hidden>⭐</span>
              </div>
              <div className="text-sm text-[#6B7280]">{price(p.price)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <button
          className="text-[#1C7BEF] hover:underline"
          onClick={() => { setExpanded((v) => !v); if (!expanded) onShowMore(); }}
        >
          {expanded ? 'Свернуть варианты' : 'Показать другие варианты'}
        </button>
      </div>
    </div>
  );
}

