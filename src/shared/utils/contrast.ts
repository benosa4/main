export function relLum([r, g, b]: [number, number, number]): number {
  const srgb = [r, g, b].map(v => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
}

export function contrast(c1: [number, number, number], c2: [number, number, number]): number {
  const L1 = relLum(c1)
  const L2 = relLum(c2)
  const [maxL, minL] = L1 > L2 ? [L1, L2] : [L2, L1]
  return (maxL + 0.05) / (minL + 0.05)
}
