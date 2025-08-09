import { useEffect, useRef } from 'react'
import type { Subscription } from 'nats.ws'
import { connectToNats, getStringCodec } from './connection'
import { natsStore } from './model'

export function useNatsSubscription(token: string, subject: string, onMessage: (msg: string) => void) {
  const subRef = useRef<Subscription | null>(null)

  useEffect(() => {
    if (!subject || !token) return

    let cancelled = false
    connectToNats(token).then(async (nc) => {
      if (cancelled) return
      const sc = getStringCodec()
      const sub = nc.subscribe(subject)
      subRef.current = sub

      for await (const msg of sub) {
        if (cancelled) break
        const decoded = sc.decode(msg.data)
        natsStore.pushLog({ ts: Date.now(), dir: 'in', subject: msg.subject, payload: decoded })
        onMessage(decoded)
      }
    }).catch(() => {})

    return () => {
      cancelled = true
      subRef.current?.unsubscribe()
      subRef.current = null
      // ⛔️ НИЧЕГО не закрываем глобально
    }
  }, [token, subject])
}
