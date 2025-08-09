import { useEffect, useState } from 'react'
import { useNatsSubscription } from './useNats'
import { keycloak } from '../../features/auth'
import {
  onConnected, removeOnConnected,
  publishPresenceOnline,
  onAuthExpired, removeOnAuthExpired,
  connectToNats, resetConnection
} from './connection'

export function NatsBridge() {
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  // первичная инициализация токена/юзера
  useEffect(() => {
    const update = async () => {
      if (keycloak.token) {
        setToken(keycloak.token)
        const p: any = keycloak.tokenParsed
        setUserId(p?.sub || null)
        setSessionId(p?.session_state || null)
      }
    }
    update()

    keycloak.onTokenExpired = async () => {
      try {
        await keycloak.updateToken(60)
        update()
        console.log('🔁 Keycloak token refreshed (onTokenExpired)')
      } catch (err) {
        console.error('❌ Keycloak updateToken failed', err)
      }
    }

    // проактивно подливаем токен раз в 30 сек (запас 60с)
    const t = setInterval(async () => {
      try {
        await keycloak.updateToken(60)
        if (keycloak.token) setToken(keycloak.token)
      } catch {}
    }, 30000)

    return () => clearInterval(t)
  }, [])

  // держим соединение, как только есть токен
  useEffect(() => {
    if (!token) return
    connectToNats(token).catch((e) => console.error('NATS connect failed', e))
  }, [token])

  // presence при connect/reconnect
  useEffect(() => {
    if (!userId || !sessionId) return
    const handler = async () => {
      try {
        await publishPresenceOnline(userId, sessionId)
        console.log('📡 presence.online sent')
      } catch (e) {
        console.warn('presence publish failed', e)
      }
    }
    onConnected(handler)
    return () => removeOnConnected(handler)
  }, [userId, sessionId])

  // ⬇️ главный фикс: реакция на истечение аутентификации в NATS
  useEffect(() => {
    const handler = async () => {
      try {
        console.warn('⚠ NATS auth expired — refreshing Keycloak token')
        await keycloak.updateToken(60)
        if (!keycloak.token) throw new Error('no refreshed token')
        setToken(keycloak.token)          // триггерим реконнект эффектом выше
        resetConnection()                  // гарантированно закрываем старый сокет
        await connectToNats(keycloak.token)
        // повторим presence (если уже знаем userId/sessionId)
        const p: any = keycloak.tokenParsed
        const uid = p?.sub
        const sid = p?.session_state
        if (uid && sid) await publishPresenceOnline(uid, sid)
        console.log('✅ Reconnected to NATS with refreshed token')
      } catch (e) {
        console.error('❌ Failed to refresh and reconnect', e)
      }
    }
    onAuthExpired(handler)
    return () => removeOnAuthExpired(handler)
  }, [])

  // подписка на личные события
  const subject = userId ? `app.wallet.${userId}.receive` : ''
  useNatsSubscription(token || '', subject, (msg) => {
    console.log('📨 NATS message:', msg)
  })

  return null
}
