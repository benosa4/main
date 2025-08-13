import React from 'react'

export function TonIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  // Minimal TON diamond SVG
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      focusable={false}
    >
      <defs>
        <linearGradient id="tonGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7BD1FF" />
          <stop offset="1" stopColor="#1887F2" />
        </linearGradient>
      </defs>
      <path d="M32 4L58 24L32 60L6 24L32 4Z" fill="url(#tonGrad)"/>
    </svg>
  )
}

export default TonIcon

