function hexToRgb(hex) {
  const v = hex.replace('#', '')
  const bigint = parseInt(v, 16)
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
}

function relLum([r, g, b]) {
  const srgb = [r, g, b].map(v => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
}

function contrast(c1, c2) {
  const L1 = relLum(c1)
  const L2 = relLum(c2)
  const [maxL, minL] = L1 > L2 ? [L1, L2] : [L2, L1]
  return (maxL + 0.05) / (minL + 0.05)
}

function blend(fg, bg, alpha) {
  return [
    Math.round(fg[0]*alpha + bg[0]*(1-alpha)),
    Math.round(fg[1]*alpha + bg[1]*(1-alpha)),
    Math.round(fg[2]*alpha + bg[2]*(1-alpha))
  ]
}

const cases = [
  { theme: 'dark', zone: 'left',  state: 'idle',   icon: '#ffffff', pill: '#221f47', header: '#0B1220' },
  { theme: 'dark', zone: 'left',  state: 'hover',  icon: '#ffffff', pill: '#2f275c', header: '#0B1220' },
  { theme: 'dark', zone: 'left',  state: 'active', icon: '#ffffff', pill: '#392d6d', header: '#0B1220' },
  { theme: 'dark', zone: 'right', state: 'idle',   icon: '#ffffff', pill: '#133147', header: '#0B1220' },
  { theme: 'dark', zone: 'right', state: 'hover',  icon: '#ffffff', pill: '#18425c', header: '#0B1220' },
  { theme: 'dark', zone: 'right', state: 'active', icon: '#ffffff', pill: '#1b506e', header: '#0B1220' },
  { theme: 'light', zone: 'left',  state: 'idle',   icon: '#0B1220', pill: '#ebe7fb', header: '#F8FAFC' },
  { theme: 'light', zone: 'left',  state: 'hover',  icon: '#0B1220', pill: '#e2dafb', header: '#F8FAFC' },
  { theme: 'light', zone: 'left',  state: 'active', icon: '#0B1220', pill: '#d9cefa', header: '#F8FAFC' },
  { theme: 'light', zone: 'right', state: 'idle',   icon: '#0B1220', pill: '#e1f3fc', header: '#F8FAFC' },
  { theme: 'light', zone: 'right', state: 'hover',  icon: '#0B1220', pill: '#d2eefb', header: '#F8FAFC' },
  { theme: 'light', zone: 'right', state: 'active', icon: '#0B1220', pill: '#c2e9fb', header: '#F8FAFC' }
]

let ok = true
for (const c of cases) {
  const iconRgb = hexToRgb(c.icon)
  const pillRgb = hexToRgb(c.pill)
  const headerRgb = hexToRgb(c.header)
  const iconOnPill = blend(iconRgb, pillRgb, c.icon === '#ffffff' ? 0.9 : 1)
  const cIcon = contrast(iconOnPill, pillRgb)
  if (cIcon < 4.5) {
    console.error(`icon contrast failed for ${c.theme} ${c.zone} ${c.state}: ${cIcon.toFixed(2)}`)
    ok = false
  }
  const cPill = contrast(pillRgb, headerRgb)
  const max = c.state === 'idle' ? 1.8 : 2.2
  const min = c.state === 'idle' ? 1.05 : 0
  if (cPill < min || cPill > max) {
    console.error(`pill contrast out of range for ${c.theme} ${c.zone} ${c.state}: ${cPill.toFixed(2)}`)
    ok = false
  }
}

if (!ok) {
  process.exit(1)
} else {
  console.log('Contrast checks passed')
}
