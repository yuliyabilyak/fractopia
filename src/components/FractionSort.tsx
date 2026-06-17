import { useState, useRef } from 'react'
import { useLang } from '../i18n/LangContext'

export interface SortFrac { n: number; d: number }

interface Props {
  fractions: SortFrac[]
  onAnswer: (correct: boolean) => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function reinsert<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export default function FractionSort({ fractions, onAnswer }: Props) {
  const { t } = useLang()

  const [order, setOrder] = useState<SortFrac[]>(() => {
    const sorted = [...fractions].sort((a, b) => a.n / a.d - b.n / b.d)
    let arr = shuffle(fractions)
    // Ensure not trivially pre-sorted
    while (arr.every((f, i) => Math.abs(f.n / f.d - sorted[i].n / sorted[i].d) < 0.001)) {
      arr = shuffle(fractions)
    }
    return arr
  })

  // HTML5 drag state
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const wasDragging = useRef(false)

  // Tap-to-swap state (mobile / fallback)
  const [tapIdx, setTapIdx] = useState<number | null>(null)

  const onDragStart = (i: number) => {
    wasDragging.current = true
    setDragIdx(i)
    setTapIdx(null)
  }

  const onDragOver = (i: number, e: React.DragEvent) => {
    e.preventDefault()
    if (dragIdx !== null && dragIdx !== i) setOverIdx(i)
  }

  const onDrop = (i: number, e: React.DragEvent) => {
    e.preventDefault()
    if (dragIdx !== null && dragIdx !== i) {
      setOrder(prev => reinsert(prev, dragIdx, i))
    }
    setDragIdx(null)
    setOverIdx(null)
  }

  const onDragEnd = () => {
    setDragIdx(null)
    setOverIdx(null)
    // Defer clearing so click that fires after dragend is ignored
    setTimeout(() => { wasDragging.current = false }, 80)
  }

  const onTap = (i: number) => {
    if (wasDragging.current) return
    if (tapIdx === null) {
      setTapIdx(i)
    } else if (tapIdx === i) {
      setTapIdx(null)
    } else {
      setOrder(prev => {
        const next = [...prev]
        ;[next[tapIdx], next[i]] = [next[i], next[tapIdx]]
        return next
      })
      setTapIdx(null)
    }
  }

  const check = () => {
    const sorted = [...fractions].sort((a, b) => a.n / a.d - b.n / b.d)
    const correct = order.every((f, i) => Math.abs(f.n / f.d - sorted[i].n / sorted[i].d) < 0.001)
    onAnswer(correct)
  }

  return (
    <div className="exercise-card">
      <p className="exercise-prompt">{t('sortFractions')}</p>

      <div className="sort-direction">
        <span className="sort-end-label">{t('smallest')}</span>
        <div className="sort-arrow-track" />
        <span className="sort-end-label">{t('largest')}</span>
      </div>

      <div className="sort-fraction-row">
        {order.map((f, i) => (
          <button
            key={i}
            className={[
              'sort-fraction-card',
              dragIdx === i ? 'dragging' : '',
              overIdx === i ? 'drag-over' : '',
              tapIdx  === i ? 'selected'  : '',
            ].filter(Boolean).join(' ')}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => onDragOver(i, e)}
            onDrop={(e) => onDrop(i, e)}
            onDragEnd={onDragEnd}
            onClick={() => onTap(i)}
            aria-label={`${f.n}/${f.d}`}
            aria-pressed={tapIdx === i}
          >
            <span className="frac-display">
              <span className="frac-n">{f.n}</span>
              <span className="frac-bar-line" />
              <span className="frac-d">{f.d}</span>
            </span>
          </button>
        ))}
      </div>

      <button className="btn-check" onClick={check}>{t('check')}</button>
    </div>
  )
}
