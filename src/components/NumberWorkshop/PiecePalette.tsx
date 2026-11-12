import type { DragEvent, ReactNode } from 'react'

export interface PaletteItem {
  value: string
  className?: string
  content: ReactNode
}

interface Props {
  label: string
  items: PaletteItem[]
  selected: string | null
  onSelect: (value: string | null) => void
}

export const DRAG_TYPE = 'text/plain'

/**
 * The pieces a student can place: drag one onto its target, or tap it (or press
 * Enter/Space) to pick it up and then tap the target — for kids who find
 * dragging hard, and for keyboards.
 */
export default function PiecePalette({ label, items, selected, onSelect }: Props) {
  return (
    <div className="ws-palette" role="group" aria-label={label}>
      {items.map(item => {
        const isOn = selected === item.value
        return (
          <button
            key={item.value}
            type="button"
            draggable
            aria-pressed={isOn}
            className={`ws-piece${isOn ? ' ws-piece--selected' : ''}${item.className ? ` ${item.className}` : ''}`}
            onClick={() => onSelect(isOn ? null : item.value)}
            onDragStart={(e: DragEvent) => {
              e.dataTransfer.setData(DRAG_TYPE, item.value)
              e.dataTransfer.effectAllowed = 'copy'
              onSelect(item.value)
            }}
          >
            {item.content}
          </button>
        )
      })}
    </div>
  )
}
