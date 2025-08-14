
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
      className="icon-btn"
      onClick={() => onOpenChange?.(true)}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="5" r="2" fill="currentColor" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <circle cx="12" cy="19" r="2" fill="currentColor" />
      </svg>
    </button>
  )
}

export default KebabButton

