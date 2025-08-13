import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { FixedSizeList as List, ListOnItemsRenderedProps } from 'react-window'
import { Contact, FetchContacts, Page } from '../model/useInfiniteContacts'
import useInfiniteContacts from '../model/useInfiniteContacts'

export type { Contact, Page, FetchContacts }

export function GiftContactsDialog(props: {
  open: boolean
  onClose: () => void
  onContinue: (contact: Contact) => void
  fetchContacts: FetchContacts
  initialQuery?: string
  pageSize?: number // default 30
}) {
  const { open, onClose, onContinue, fetchContacts, initialQuery = '', pageSize = 30 } = props

  const [query, setQuery] = useState(initialQuery)
  useEffect(() => { if (open) setQuery(initialQuery) }, [open, initialQuery])

  const { items, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteContacts({
    query,
    pageSize,
    fetchContacts,
  })

  // Selection and keyboard focus management
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const listRef = useRef<List>(null)
  const continueRef = useRef<HTMLButtonElement>(null)
  const headingId = 'gift-contacts-title'

  useEffect(() => {
    if (!open) return
    setActiveIndex(items.length ? 0 : -1)
    setSelectedId(null)
  }, [open, items.length])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
    if (!items.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => {
        const ni = Math.min((i < 0 ? 0 : i) + 1, items.length - 1)
        if (ni !== i) listRef.current?.scrollToItem(ni, 'smart')
        return ni
      })
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => {
        const ni = Math.max((i < 0 ? 0 : i) - 1, 0)
        if (ni !== i) listRef.current?.scrollToItem(ni, 'smart')
        return ni
      })
    }
    if (e.key === 'Home') { e.preventDefault(); setActiveIndex(0); listRef.current?.scrollToItem(0, 'start') }
    if (e.key === 'End') { e.preventDefault(); setActiveIndex(items.length - 1); listRef.current?.scrollToItem(items.length - 1, 'end') }
    if (e.key === 'Enter') {
      e.preventDefault()
      const c = items[activeIndex]
      if (c) { setSelectedId((prev) => (prev === c.id ? null : c.id)); setTimeout(() => continueRef.current?.focus(), 0) }
    }
  }, [open, items, activeIndex, onClose])

  const itemSize = 72 // px
  const overscan = 6

  const onItemsRendered = useCallback(({ visibleStopIndex }: ListOnItemsRenderedProps) => {
    // Trigger loading next page when within ~300px to the end
    const threshold = Math.max(0, items.length - Math.ceil(300 / itemSize))
    if (visibleStopIndex >= threshold) {
      if (hasNextPage) fetchNextPage()
    }
  }, [items.length, itemSize, hasNextPage, fetchNextPage])

  const renderRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const c = items[index]
    const selected = selectedId === c?.id
    const isActive = activeIndex === index
    const bg = selected ? '#E8F0FE' : isActive ? '#F7F8FA' : undefined
    const label = c ? `${c.name}, ${c.lastSeenText}` : ''
    const avatar = c?.avatarUrl
    const letter = c?.name?.[0]?.toUpperCase() || '?'
    return (
      <div style={style} role="option" aria-selected={selected} aria-label={label}>
        <button
          data-index={index}
          className="w-full flex items-center gap-3 px-3 h-18 rounded-xl cursor-pointer select-none focus:outline-none"
          style={{ height: itemSize, background: bg }}
          onMouseEnter={() => setActiveIndex(index)}
          onClick={() => setSelectedId(selected ? null : c.id)}
        >
          <div className="w-10 h-10 rounded-full grid place-items-center overflow-hidden bg-slate-200 text-slate-700 text-sm">
            {avatar ? (<img src={avatar} alt="" className="w-full h-full object-cover" />) : letter}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="text-[14px] font-semibold text-slate-900 truncate">{c.name}</div>
            <div className="text-[12px] text-slate-500">{c.lastSeenText}</div>
          </div>
        </button>
      </div>
    )
  }

  const overlay = (
    <Dialog.Root open={open} onOpenChange={(o)=>{ if(!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9999] bg-[rgba(0,0,0,0.5)]" onClick={onClose} />
        <Dialog.Content
          onKeyDown={handleKeyDown}
          aria-labelledby={headingId}
          aria-describedby={undefined}
          className="fixed inset-0 z-[10000] grid place-items-center p-4 outline-none"
        >
          <div className="w-[min(92vw,420px)] rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-4 sm:p-5 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="relative flex items-center justify-center">
              <button
                aria-label="Закрыть"
                className="absolute left-0 top-0 w-8 h-8 rounded-full grid place-items-center text-black hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-sky-500"
                onClick={onClose}
              >
                ×
              </button>
              <div id={headingId} className="text-center text-base font-semibold pointer-events-none">Подарить Premium или звёзды</div>
            </div>

            {/* Search */}
            <div className="mt-3">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 grid place-items-center text-slate-400" aria-hidden>🔍</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск"
                  className="w-full h-11 rounded-xl border border-slate-200 px-10 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* List area */}
            <div className="mt-3 flex-1 min-h-[260px]">
              <div className="relative border border-transparent rounded-xl">
                {isLoading && (
                  <div role="status" aria-live="polite" className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-[72px] rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                )}

                {!isLoading && isError && (
                  <div className="p-4 text-sm text-slate-700 bg-slate-50 rounded-xl border border-slate-200">
                    <div>Произошла ошибка при загрузке.</div>
                    <button className="mt-2 h-10 px-3 rounded-lg bg-sky-600 text-white" onClick={() => refetch()}>Повторить</button>
                    {error && <div className="mt-1 text-[12px] text-slate-500 truncate" title={String(error)}>{String(error)}</div>}
                  </div>
                )}

                {!isLoading && !isError && items.length === 0 && (
                  <div className="p-6 text-center text-slate-600">
                    <div className="font-medium">Ничего не найдено</div>
                    <div className="text-[12px] text-slate-500">Попробуйте изменить запрос</div>
                  </div>
                )}

                {!isLoading && !isError && items.length > 0 && (
                  <List
                    ref={listRef as any}
                    height={Math.min(420, Math.round(window.innerHeight * 0.5))}
                    itemCount={items.length}
                    itemSize={itemSize}
                    width={'100%'}
                    overscanCount={overscan}
                    onItemsRendered={onItemsRendered}
                    role="listbox"
                  >
                    {renderRow as any}
                  </List>
                )}

                {isFetchingNextPage && (
                  <div className="py-3 text-center text-slate-500 text-sm">Загрузка…</div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-200 sticky bottom-0 bg-white">
              <button
                ref={continueRef}
                className="w-full h-12 rounded-xl bg-sky-600 text-white font-semibold disabled:opacity-50"
                onClick={() => {
                  const c = items.find((x) => x.id === selectedId)
                  if (c) onContinue(c)
                }}
                disabled={!selectedId}
              >
                ПРОДОЛЖИТЬ
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )

  if (!open) return null
  return createPortal(overlay, document.body)
}

export default GiftContactsDialog
