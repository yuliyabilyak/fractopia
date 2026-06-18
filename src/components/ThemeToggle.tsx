import { useTheme } from '../i18n/ThemeContext'
import type { Theme } from '../i18n/ThemeContext'

const ICONS: Record<Theme, string> = {
  light: '☀️',
  funny: '🐸',
  evil:  '💀',
  dark:  '🌙',
}

const LABELS: Record<Theme, string> = {
  light: 'Switch to animal mode',
  funny: 'Switch to evil mode',
  evil:  'Switch to dark mode',
  dark:  'Switch to light mode',
}

export default function ThemeToggle() {
  const { theme, cycle } = useTheme()
  return (
    <button className="theme-toggle" onClick={cycle} aria-label={LABELS[theme]}>
      {ICONS[theme]}
    </button>
  )
}
