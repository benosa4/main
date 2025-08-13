export type ThemeChoice = 'light' | 'dark' | 'system'

import appSettingsStore from '../config/appSettings'

/** Apply selected theme and persist via appSettingsStore */
export function applyTheme(choice: ThemeChoice) {
  const mode = choice === 'system' ? 'auto' : choice
  appSettingsStore.setTheme(mode)
}

/** Initialise theme system and watch for system preference changes */
export function initTheme() {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = () => {
    if (appSettingsStore.state.theme === 'auto') {
      // reapply to respect new system preference
      appSettingsStore.setTheme('auto')
    }
  }
  mq.addEventListener('change', handler)
}
