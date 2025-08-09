// src/shared/nats/SendBox.tsx
import { useEffect, useRef, useState } from 'react'
import { keycloak } from '../../features/auth'
import { sendWalletCommand } from './connection'

export function SendBox() {
  const [userId, setUserId] = useState<string>('')
  const [text, setText] = useState('pay 10 usd')
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const offsetRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const parsed = keycloak.tokenParsed as { sub?: string } | undefined
    setUserId(parsed?.sub || '')
    setPosition({
      x: window.innerWidth - 320,
      y: window.innerHeight / 2,
    })
  }, [])

  function onMouseDown(e: React.MouseEvent) {
    setDragging(true)
    offsetRef.current = { x: e.clientX - position.x, y: e.clientY - position.y }
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging) return
      setPosition({ x: e.clientX - offsetRef.current.x, y: e.clientY - offsetRef.current.y })
    }
    function onMouseUp() {
      setDragging(false)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging])

  async function onSend() {
    if (!userId) return alert('No userId')
    try {
      await sendWalletCommand(userId, text)
      console.log('➡ sent:', text)
    } catch (e) {
      console.error(e)
      alert('Failed to send (see console)')
    }
  }

  return (
    <div
      onMouseDown={onMouseDown}
      style={{ top: position.y, left: position.x }}
      className="fixed z-[1000] bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white shadow-xl cursor-move"
    >
      <div className="text-sm opacity-80 mb-2">Send to <span className="font-mono">{userId?.slice(0,8)}…</span></div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          className="px-3 py-2 rounded-md bg-white/20 border border-white/20 text-white min-w-[240px]"
          placeholder="command text"
        />
        <button
          onClick={onSend}
          className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700"
        >
          Send
        </button>
      </div>
    </div>
  )
}
