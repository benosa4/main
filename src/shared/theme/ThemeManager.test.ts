import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../config/appSettings', () => {
  const state = { theme: 'dark' }
  return {
    __esModule: true,
    default: {
      state,
      setTheme: vi.fn((t: any) => {
        state.theme = t
        const mode = t === 'auto'
          ? ((window as any).matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : t
        document.documentElement.setAttribute('data-theme', mode)
      })
    }
  }
})

import { applyTheme } from './ThemeManager'

beforeEach(() => {
  ;(window as any).matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} })
  document.documentElement.removeAttribute('data-theme')
})

describe('ThemeManager', () => {
  it('applies light and dark themes', () => {
    applyTheme('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    applyTheme('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('applies system theme', () => {
    applyTheme('system')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
