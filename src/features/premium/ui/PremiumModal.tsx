import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import StarBurst from './StarBurst';
import PlanOption from './PlanOption';

export interface PremiumPrices {
  annual: { total: number; monthly: number; discountLabel?: string };
  monthly: { total: number; monthly: number };
}

export interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (plan: 'annual' | 'monthly') => Promise<void> | void;
  defaultPlan?: 'annual' | 'monthly';
  prices?: PremiumPrices;
}

const DEFAULT_PRICES: PremiumPrices = {
  annual: { total: 1990, monthly: 165.83, discountLabel: '-45%' },
  monthly: { total: 299, monthly: 299 },
};

function formatRub(val: number) {
  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(val);
  } catch {
    return `${val.toFixed(2)} ₽`;
  }
}

export default function PremiumModal({ open, onClose, onSubmit, defaultPlan = 'annual', prices = DEFAULT_PRICES }: PremiumModalProps) {
  const [plan, setPlan] = useState<'annual' | 'monthly'>(defaultPlan);
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastActive = useRef<HTMLElement | null>(null);

  useEffect(() => { if (open) setPlan(defaultPlan); }, [open, defaultPlan]);

  // focus trap
  useEffect(() => {
    if (!open) return;
    lastActive.current = (document.activeElement as HTMLElement) || null;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const getFocusable = () => dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const focusable = getFocusable();
    const first = focusable[0];
    (first || dialog).focus();
    const onKey = (e: KeyboardEvent) => {
      // Block ESC close to enforce explicit actions (close or buy)
      if (e.key === 'Tab') {
        const f = getFocusable();
        if (f.length === 0) return;
        const idx = Array.prototype.indexOf.call(f, document.activeElement);
        if (e.shiftKey) {
          if (idx <= 0) { e.preventDefault(); (f[f.length - 1] as HTMLElement).focus(); }
        } else {
          if (idx === f.length - 1) { e.preventDefault(); (f[0] as HTMLElement).focus(); }
        }
      }
      // Radiogroup arrows
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setPlan('annual'); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setPlan('monthly'); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); lastActive.current?.focus(); };
  }, [open]);

  if (!open) return null;

  const priceAnnualMain = formatRub(prices.annual.total);
  const priceAnnualSub = `${formatRub(prices.annual.monthly)} в месяц`;
  const priceMonthlyMain = formatRub(prices.monthly.total);
  const priceMonthlySub = `${formatRub(prices.monthly.monthly)} в месяц`;
  const ctaText = plan === 'annual' ? `ПОДКЛЮЧИТЬ ЗА ${formatRub(prices.annual.monthly)} В МЕСЯЦ` : `ПОДКЛЮЧИТЬ ЗА ${formatRub(prices.monthly.monthly)} В МЕСЯЦ`;

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-title"
      aria-describedby="premium-desc"
      className="fixed inset-0 z-[9999]"
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 grid place-items-center">
        <div
          ref={dialogRef}
          className="w-[min(92vw,440px)] bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] outline-none"
        >
          {/* close */}
          <button aria-label="Закрыть" className="w-8 h-8 ml-2 mt-2 rounded-full grid place-items-center text-black hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-black" onClick={onClose}>×</button>

          {/* animated header */}
          <div className="px-6 pt-2">
            <div className="w-full" style={{ height: 128 }}>
              <StarBurst starSize={90} />
            </div>
          </div>

          {/* text block */}
          <div className="px-6">
            <h2 id="premium-title" className="font-semibold text-[20px] leading-[1.2] md:text-[22px]" style={{ color: '#1F2937' }}>Telegram Premium</h2>
            <p id="premium-desc" className="mt-1 text-[14px] leading-[1.5]" style={{ color: '#4A5568' }}>
              Больше свобод и десятки эксклюзивных функций…
            </p>
          </div>

          {/* plans */}
          <div className="px-6 mt-4" role="radiogroup" aria-label="Тарифы">
            <div className="space-y-3">
              <PlanOption
                id="annual"
                label="12 месяцев"
                priceMain={priceAnnualMain}
                priceSub={priceAnnualSub}
                discountBadge={prices.annual.discountLabel}
                selected={plan === 'annual'}
                onSelect={setPlan}
              />
              <PlanOption
                id="monthly"
                label="1 месяц"
                priceMain={priceMonthlyMain}
                priceSub={priceMonthlySub}
                selected={plan === 'monthly'}
                onSelect={setPlan}
              />
            </div>
          </div>

          {/* benefits */}
          <div className="px-6 mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md grid place-items-center" style={{ background: '#FFEDD5' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <path d="M6 8 L10 8 L12 6 L14 8 L18 8 L15 11 L16 16 L12 13 L8 16 L9 11 Z" fill="#F97316" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[14px]" style={{ color: '#1F2937' }}>Истории</div>
                <div className="text-[13px]" style={{ color: '#4A5568' }}>Публикуйте больше историй с расширенными возможностями.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md grid place-items-center" style={{ background: '#FFE4E6' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <rect x="4" y="6" width="16" height="12" rx="2" fill="#FB7185" />
                  <rect x="7" y="9" width="6" height="2" fill="#FFE4E6" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[14px]" style={{ color: '#1F2937' }}>Безлимитное хранилище</div>
                <div className="text-[13px]" style={{ color: '#4A5568' }}>Храните файлы и медиа без ограничений в облаке.</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="px-6 py-6">
            <button
              className="w-full h-12 rounded-full text-white font-semibold tracking-wide uppercase disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]"
              style={{
                background: 'linear-gradient(90deg, #6C5CE7 0%, #B06BF3 50%, #FF7AC8 100%)',
                boxShadow: '0 8px 20px rgba(108,92,231,0.35)'
              }}
              onClick={async () => {
                try {
                  setLoading(true);
                  await onSubmit(plan);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              <span className="inline-flex items-center justify-center gap-2">
                {loading && (
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                    <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="3" opacity="0.25" fill="none" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                  </svg>
                )}
                <span>{ctaText}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
