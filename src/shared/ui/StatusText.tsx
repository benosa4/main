import { useEffect, useState } from 'react'

interface StatusTextProps {
  label: string
  className?: string
}

export function StatusText({ label, className }: StatusTextProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const t = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'))
    }, 450)
    return () => clearInterval(t)
  }, [])

  return <span className={className}>{label}{dots.padEnd(3, ' ')}</span>
}

