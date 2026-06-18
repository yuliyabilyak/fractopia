import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'funny' | 'evil'

const CYCLE: Theme[] = ['light', 'funny', 'evil', 'dark']

interface ThemeContextValue {
  theme: Theme
  cycle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('theme') as Theme | null
      if (stored && CYCLE.includes(stored)) return stored
    } catch {}
    return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('theme', theme) } catch {}
  }, [theme])

  function cycle() {
    setTheme(t => CYCLE[(CYCLE.indexOf(t) + 1) % CYCLE.length])
  }

  return (
    <ThemeContext.Provider value={{ theme, cycle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
