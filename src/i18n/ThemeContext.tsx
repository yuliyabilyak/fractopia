import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface ThemeContextValue {
  isDark: boolean
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'dark'
    } catch {}
    return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light') } catch {}
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
