import React from 'react';

export interface PlanOptionProps {
  id: 'annual' | 'monthly';
  label: string;
  priceMain: string; // e.g., 1990,00 ₽
  priceSub: string; // e.g., 165,83 ₽ в месяц
  discountBadge?: string; // e.g., -45%
  selected: boolean;
  onSelect: (id: 'annual' | 'monthly') => void;
}

export default function PlanOption({ id, label, priceMain, priceSub, discountBadge, selected, onSelect }: PlanOptionProps) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id); }
      }}
      className={`flex items-center gap-3 h-[72px] rounded-2xl px-4 border transition-colors cursor-pointer ${
        selected ? 'border-[#6C5CE7] border-2 bg-[#F5F3FF]' : 'border-[#E2E8F0] border'
      }`}
    >
      <span aria-hidden className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2" style={{ borderColor: selected ? '#6C5CE7' : '#CBD5E1' }}>
        <span className="block rounded-full" style={{ width: 12, height: 12, background: selected ? '#6C5CE7' : 'transparent' }} />
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="font-semibold">{label}</div>
          {discountBadge && (
            <span className="inline-flex items-center justify-center h-[22px] px-2 rounded-full text-xs" style={{ background: '#E6F4FF', color: '#0B6EF3' }}>{discountBadge}</span>
          )}
        </div>
        <div className="text-[#1F2937]">{priceMain}</div>
        <div className="text-sm" style={{ color: '#4A5568' }}>{priceSub}</div>
      </div>
    </div>
  );
}

