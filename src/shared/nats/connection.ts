import {
    connect,
    StringCodec,
    tokenAuthenticator,
    NatsConnection,
  } from 'nats.ws'
  import { natsStore } from './model'
  
  const sc = StringCodec()
  let connection: NatsConnection | null = null
  
  type ConnListener = (ev: 'connect'|'reconnect') => void
  const listeners = new Set<ConnListener>()
  export function onConnected(cb: ConnListener) { listeners.add(cb) }
  export function removeOnConnected(cb: ConnListener) { listeners.delete(cb) }
  
  type AuthExpiredListener = () => void
  const authExpiredListeners = new Set<AuthExpiredListener>()
  export function onAuthExpired(cb: AuthExpiredListener) { authExpiredListeners.add(cb) }
  export function removeOnAuthExpired(cb: AuthExpiredListener) { authExpiredListeners.delete(cb) }
  
  function maybeAuthExpired(err?: unknown) {
    const msg = (err as { message?: string } | undefined)?.message || String(err || "")
    if (/UserAuthenticationExpired|Authentication\s*Expired|authorization/i.test(msg)) {
      authExpiredListeners.forEach(cb => cb())
      return true
    }
    return false
  }
  
  export async function connectToNats(jwt: string) {
    if (connection) return connection
  
    const url = import.meta.env.VITE_NATS_URL || 'ws://localhost:8222'
    natsStore.setStatus('connecting')
  
    try {
      connection = await connect({
        servers: url,
        authenticator: tokenAuthenticator(jwt),
      })
      natsStore.setStatus('connected')
  
      // следим за статусами
      ;(async () => {
        for await (const s of connection!.status()) {
          if (s.type === 'disconnect') {
            natsStore.setStatus('reconnecting')
            // иногда сюда прилетает причина
            maybeAuthExpired((s as { data?: { error?: unknown } }).data?.error)
          }
          if (s.type === 'reconnect') {
            natsStore.setStatus('connected')
            listeners.forEach(cb => cb('reconnect'))
          }
        }
      })().catch(() => {})
  
      // на закрытие — проверяем причину
      connection.closed().then((err) => {
        if (err) {
          if (!maybeAuthExpired(err)) {
            console.warn('NATS closed with error', err)
          }
        }
        natsStore.setStatus('disconnected')
      })
  
      // первичное успешное подключение
      listeners.forEach(cb => cb('connect'))
  
      return connection
    } catch (err) {
      natsStore.setStatus('disconnected')
      throw err
    }
  }
  
  export function getStringCodec() { return sc }
  
  export function resetConnection() {
    connection = null
    natsStore.setStatus('disconnected')
  }
  
  /** Паблиш команды в work-очередь (JetStream stream WALLET подберёт по subject) */
  export async function sendWalletCommand(userId: string, text: string) {
    if (!connection) throw new Error('NATS is not connected')
    const subject = `app.wallet.${userId}.send`
    connection.publish(subject, sc.encode(text))
    natsStore.pushLog({ ts: Date.now(), dir: 'out', subject, payload: text })
  }
  
  /** Паблиш presence-событие для onConnect/outbox */
  export async function publishPresenceOnline(userId: string, sessionId: string) {
    if (!connection) throw new Error('NATS is not connected')
    const subject = `presence.online.${userId}.${sessionId}`
    const payload = JSON.stringify({ ts: Math.floor(Date.now() / 1000) })
    connection.publish(subject, sc.encode(payload))
    natsStore.pushLog({ ts: Date.now(), dir: 'out', subject, payload })
  }
  