import type { KeyboardEvent } from 'react'

/**
 * Arrow-key focus movement through the buttons matching `selector` inside the
 * element that has the handler. Enter / Space then press them natively.
 *   grid (default)  Left/Right step by one, Up/Down by a visual row
 *   linear          Left/Up previous, Right/Down next, in DOM order
 */
export function arrowNav(e: KeyboardEvent<HTMLElement>, selector: string, layout: 'grid' | 'linear' = 'grid') {
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(selector))
  const i = items.indexOf(document.activeElement as HTMLElement)
  if (i < 0) return
  const row = layout === 'grid' ? items.filter(el => el.offsetTop === items[0].offsetTop).length || 1 : 1
  const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -row, ArrowDown: row }
  if (!(e.key in step)) return
  e.preventDefault()
  items[Math.min(items.length - 1, Math.max(0, i + step[e.key]))].focus()
}
