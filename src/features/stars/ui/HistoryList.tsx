import React from 'react';

export interface Operation { id: string; title: string; subtitle: string; date: string; sign: '+' | '-'; amount: number; avatarUrl?: string }

export default function HistoryList({ items }: { items: Operation[] }) {
  const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n);
  return (
    <div className="divide-y" style={{ borderColor: '#E5E7EB' }}>
      {items.map((op) => (
        <div key={op.id} className="flex items-center gap-3 py-3">
          <img src={op.avatarUrl || 'https://placehold.co/36x36'} className="w-9 h-9 rounded-md object-cover" />
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold truncate" style={{ color: '#111827' }}>{op.title}</div>
            <div className="text-[12px] truncate" style={{ color: '#6B7280' }}>{op.subtitle}</div>
          </div>
          <div className="text-right">
            <div className="text-[12px] text-[#6B7280]">{op.date}</div>
            <div className="text-[14px] font-bold flex items-center justify-end gap-1" style={{ color: op.sign === '+' ? '#16A34A' : '#EF4444' }}>
              <span>{op.sign}{fmt(op.amount)}</span>
              <span aria-hidden>⭐</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

