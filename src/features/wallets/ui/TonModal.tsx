import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { TonIcon } from './TonIcon'
import TonGemBurst from './TonGemBurst'

export interface TonModalProps {
  open: boolean
  onClose: () => void
  onTopUp: () => void | Promise<void>
  balanceTon: number
  usdRate?: number
  formatters?: { ton?: (v: number) => string; usd?: (v: number) => string }
  // Optional burst tuning for Storybook controls
  burstSize?: number
  burstIntensity?: number
  burstSparkles?: boolean
}

export function TonModal({ open, onClose, onTopUp, balanceTon, usdRate, formatters, burstSize = 96, burstIntensity = 1, burstSparkles = true }: TonModalProps) {
  const [loading, setLoading] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const titleId = 'ton-modal-title'
  const descId = 'ton-modal-desc'

  useEffect(() => { if (!open) setLoading(false) }, [open])

  const fmtTon = useMemo(() => formatters?.ton || ((v: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 }).format(v)), [formatters])
  const fmtUsd = useMemo(() => formatters?.usd || ((v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v)), [formatters])

  const usdText = typeof usdRate === 'number' ? fmtUsd(balanceTon * usdRate) : null

  const content = (
    <Dialog.Root open={open} onOpenChange={(o)=>{ if(!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9999] bg-[rgba(0,0,0,0.5)]" onClick={onClose} />
        <Dialog.Content className="fixed inset-0 z-[10000] grid place-items-center p-4 outline-none">
          <div className="w-[min(92vw,420px)] rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-6 max-h-[92vh] overflow-hidden">
            {/* Close */}
            <div className="relative">
              <Dialog.Close asChild>
                <button aria-label="Закрыть" className="absolute left-0 top-0 w-8 h-8 rounded-full grid place-items-center text-black hover:bg-black/10">×</button>
              </Dialog.Close>
            </div>

            {/* Top animation block (≈140px) */}
            <div className="mt-2" style={{ height: 140 }}>
              <div className="w-full h-full grid place-items-center">
                <TonGemBurst size={burstSize} intensity={burstIntensity} sparkles={burstSparkles} />
              </div>
            </div>

            {/* Title + description */}
            <Dialog.Title id={titleId} className="text-center text-[18px] font-semibold text-slate-900">TON</Dialog.Title>
            <Dialog.Description id={descId} className="mt-1 text-center text-[13px] text-slate-600 leading-5">
              Offer TON to submit post suggestions to channels on Telegram.
            </Dialog.Description>

            {/* Balance block */}
            <div className="mt-3 flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 text-[18px] font-semibold">
                <TonIcon size={16} /> {fmtTon(balanceTon)} TON
              </div>
              {usdText && (
                <div className="text-[12px] text-slate-500">{usdText}</div>
              )}
            </div>

            {/* CTA */}
            <div className="mt-4">
              <button
                ref={btnRef}
                className="h-12 w-full rounded-xl bg-sky-600 text-white font-semibold disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 hover:bg-sky-600/90 active:bg-sky-700"
                onClick={async () => {
                  if (loading) return
                  const r = onTopUp()
                  if (r && typeof (r as any).then === 'function') {
                    try { setLoading(true); await r } finally { setLoading(false) }
                  }
                }}
                disabled={loading}
                aria-busy={loading || undefined}
              >
                {loading ? 'PROCESSING…' : 'TOP-UP VIA FRAGMENT'}
              </button>
              <div className="mt-2 text-[12px] text-slate-500 text-center">You can top-up your TON using Fragment.</div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )

  if (!open) return null
  return createPortal(content, document.body)
}

export default TonModal
