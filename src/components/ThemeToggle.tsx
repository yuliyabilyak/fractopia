import { useTheme } from '../i18n/ThemeContext'

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme()
  return (
    <button className="theme-toggle" onClick={toggle} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
