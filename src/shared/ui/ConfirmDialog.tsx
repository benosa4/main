import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o)=>{ if(!o) onCancel() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9999] bg-black/50" onClick={onCancel} />
        <Dialog.Content className="fixed inset-0 z-[10000] grid place-items-center p-4 outline-none">
          <div className="w-[min(92vw,420px)] rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-5">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-base font-semibold">{title}</Dialog.Title>
              <Dialog.Close asChild>
                <button aria-label="Закрыть" className="w-8 h-8 rounded-full grid place-items-center text-black hover:bg-black/10 focus:outline-none">×</button>
              </Dialog.Close>
            </div>
            {description && (
              <Dialog.Description className="mt-2 text-[14px] text-slate-600">{description}</Dialog.Description>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button className="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50" onClick={onCancel}>{cancelLabel}</button>
              <button
                className={`h-10 px-4 rounded-xl text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-sky-600 hover:bg-sky-700'}`}
                onClick={onConfirm}
              >{confirmLabel}</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ConfirmDialog

