import * as React from 'react'

export interface KebabButtonProps {
  onOpenChange?: (open: boolean) => void
  ariaLabel?: string
}

export function KebabButton({ onOpenChange, ariaLabel = 'Больше' }: KebabButtonProps) {
  // Consumers can wrap this with a Dropdown trigger; we still expose basic button
  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-label={ariaLabel}
      className="w-8 h-8 rounded-full grid place-items-center hover:bg-[#EEF6FF] active:bg-[#dbeafe] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      onClick={() => onOpenChange?.(true)}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="5" r="2" fill="#0F172A" />
        <circle cx="12" cy="12" r="2" fill="#0F172A" />
        <circle cx="12" cy="19" r="2" fill="#0F172A" />
      </svg>
    </button>
  )
}

export default KebabButton

