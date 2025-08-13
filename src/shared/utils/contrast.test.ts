import { describe, it, expect } from 'vitest'
import { relLum, contrast } from './contrast'

function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace('#', '')
  const bigint = parseInt(v, 16)
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
}

describe('contrast utils', () => {
  it('computes relative luminance', () => {
    expect(relLum([0,0,0])).toBe(0)
    expect(relLum([255,255,255])).toBeCloseTo(1)
  })

  it('computes contrast ratio', () => {
    expect(contrast([0,0,0], [255,255,255])).toBeCloseTo(21)
    const c = contrast(hexToRgb('#221f47'), hexToRgb('#ffffff'))
    expect(c).toBeGreaterThan(4.5)
  })
})
