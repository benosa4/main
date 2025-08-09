import { observer } from 'mobx-react-lite'
import { natsStore } from './model'
import { useState } from 'react'

export const NatsLogPanel = observer(function NatsLogPanel() {
  const [open, setOpen] = useState(false)
  const items = [...natsStore.logs].slice(-50).reverse()

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 left-6 z-[1000] px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20"
        title="NATS logs"
      >
        {open ? '✖' : '🧭 Logs'}
      </button>

      {open && (
        <div className="fixed bottom-16 left-6 z-[1000] w-[520px] max-h-[50vh] overflow-auto
          bg-black/70 backdrop-blur-md text-white border border-white/20 rounded-xl p-3 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">NATS Messages (last {items.length})</div>
          </div>
          <div className="space-y-1 text-xs font-mono">
            {items.map((l, i) => (
              <div key={i} className="grid grid-cols-[88px_28px_1fr] gap-2">
                <span className="text-white/60">{new Date(l.ts).toLocaleTimeString()}</span>
                <span className={l.dir === 'in' ? 'text-green-400' : 'text-blue-400'}>
                  {l.dir === 'in' ? 'IN' : 'OUT'}
                </span>
                <span className="truncate">{l.subject} — <span className="text-white/70">{l.payload}</span></span>
              </div>
            ))}
            {items.length === 0 && <div className="text-white/60">No messages yet…</div>}
          </div>
        </div>
      )}
    </>
  )
})
