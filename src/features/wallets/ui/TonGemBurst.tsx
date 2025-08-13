import React, { useEffect, useMemo, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'

export function TonGemBurst({ size = 96, intensity = 1, sparkles = true }: { size?: number; intensity?: number; sparkles?: boolean }) {
  const controls = useAnimation()
  useEffect(() => {
    controls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 3.0, ease: 'easeInOut', repeat: Infinity },
    })
  }, [controls])

  // Sparkles: generate positions deterministically for performance
  const count = Math.round(22 * Math.max(0, Math.min(2, intensity)))
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => i + 1), [count])
  const wrapRef = useRef<HTMLDivElement>(null)

  return (
    <div style={{ width: size, height: size }} className="relative grid place-items-center">
      {sparkles && (
        <div className="absolute inset-0 pointer-events-none">
          {seeds.map((i) => {
            const angle = (i * 137.508) % 360
            const r = 20 + (i % 30) // 20..49
            const x = Math.cos((angle * Math.PI) / 180) * r
            const y = Math.sin((angle * Math.PI) / 180) * r
            const d = 0.7 + ((i % 5) / 10) // 0.7..1.1s
            const delay = (i % 7) * 0.12
            const hue = i % 3 === 0 ? '#7BD1FF' : i % 3 === 1 ? '#BCE7FF' : '#A5F0FF'
            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{ left: '50%', top: '50%', width: 3, height: 3, background: hue }}
                initial={{ x, y, opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4] }}
                transition={{ duration: d, delay, repeat: Infinity, ease: 'easeInOut' }}
              />
            )
          })}
        </div>
      )}

      {/* Glow layer */}
      <motion.div
        className="absolute"
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 3.0, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: 'blur(8px)' }}
      >
        <Gem size={size} glow />
      </motion.div>

      {/* Main gem with pulse and shine mask */}
      <motion.div animate={controls} ref={wrapRef}>
        <Gem size={size} shine />
      </motion.div>
    </div>
  )
}

function Gem({ size, shine, glow }: { size: number; shine?: boolean; glow?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="tonG1" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7BD1FF" />
          <stop offset="1" stopColor="#1887F2" />
        </linearGradient>
        {shine && (
          <linearGradient id="shineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.6" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        )}
        {shine && (
          <mask id="shineMask">
            <motion.rect
              x="-64"
              y="0"
              width="64"
              height="128"
              fill="url(#shineGrad)"
              transform="skewX(-20)"
              animate={{ x: [ -64, 192 ] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </mask>
        )}
      </defs>
      <g filter={glow ? undefined : undefined}>
        <path d="M64 8L116 48L64 120L12 48L64 8Z" fill="url(#tonG1)" />
        {shine && (
          <g mask="url(#shineMask)">
            <rect x="0" y="0" width="128" height="128" fill="#fff" opacity="0.7" />
          </g>
        )}
        <path d="M64 8L116 48L64 120L12 48L64 8Z" fill="none" stroke="#BCE7FF" strokeOpacity="0.6" />
      </g>
    </svg>
  )
}

export default TonGemBurst

