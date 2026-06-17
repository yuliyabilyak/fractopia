import { useState, useMemo } from 'react'
import { useLang } from '../i18n/LangContext'

interface Tile { n: number; d: number }

interface Props {
  tiles: Tile[]
  onAnswer: (correct: boolean) => void
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

function addFrac(an: number, ad: number, bn: number, bd: number): [number, number] {
  const n = an * bd + bn * ad
  const d = ad * bd
  const g = gcd(n, d)
  return [n / g, d / g]
}

const SEG_COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16']

export default function FractionTower({ tiles, onAnswer }: Props) {
  const { t } = useLang()
  const [stack, setStack] = useState<Tile[]>([])
  const [overflow, setOverflow] = useState(false)
  const [done, setDone] = useState(false)

  const totalCounts = useMemo(() => {
    const m = new Map<string, { tile: Tile; count: number }>()
    for (const tile of tiles) {
      const k = `${tile.n}/${tile.d}`
      if (m.has(k)) m.get(k)!.count++
      else m.set(k, { tile: { ...tile }, count: 1 })
    }
    return m
  }, [tiles])

  const uniqueTiles = useMemo(() => [...totalCounts.values()], [totalCounts])

  const usedCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const tile of stack) {
      const k = `${tile.n}/${tile.d}`
      m.set(k, (m.get(k) ?? 0) + 1)
    }
    return m
  }, [stack])

  const [sumN, sumD] = useMemo(() => {
    let n = 0, d = 1
    for (const tile of stack) [n, d] = addFrac(n, d, tile.n, tile.d)
    return [n, d]
  }, [stack])

  const handleAdd = (tile: Tile) => {
    if (done || overflow) return
    const k = `${tile.n}/${tile.d}`
    const used = usedCounts.get(k) ?? 0
    const avail = totalCounts.get(k)?.count ?? 0
    if (used >= avail) return

    const newStack = [...stack, tile]
    let n = 0, d = 1
    for (const t of newStack) [n, d] = addFrac(n, d, t.n, t.d)

    if (n > d) {
      setStack(newStack)
      setOverflow(true)
      setTimeout(() => { setStack([]); setOverflow(false) }, 800)
      return
    }
    setStack(newStack)
    if (n === d) {
      setDone(true)
      setTimeout(() => onAnswer(true), 700)
    }
  }

  const handleUndo = () => {
    if (overflow || done || stack.length === 0) return
    setStack(s => s.slice(0, -1))
  }

  // Compute absolute-positioned segments from bottom
  let cumPct = 0
  const segments = stack.map((tile, i) => {
    const hPct = (tile.n / tile.d) * 100
    const bottomPct = cumPct
    cumPct += hPct
    return { tile, i, hPct, bottomPct }
  })

  const sumLabel = stack.length === 0 ? '0' : sumN === sumD ? '1' : `${sumN}/${sumD}`

  return (
    <div className="exercise-card">
      <p className="exercise-prompt">{t('towerPrompt')}</p>

      <div className="tower-layout">
        <div className={`tower-wrap ${overflow ? 'tower--overflow' : ''} ${done ? 'tower--done' : ''}`}>
          <span className="tower-goal-label">1</span>
          <div className="tower-container">
            {segments.map(({ tile, i, hPct, bottomPct }) => (
              <div
                key={i}
                className="tower-segment"
                style={{
                  bottom: `${bottomPct}%`,
                  height: `${hPct}%`,
                  backgroundColor: SEG_COLORS[i % SEG_COLORS.length],
                }}
              >
                {hPct >= 14 && (
                  <span className="tower-seg-label">{tile.n}/{tile.d}</span>
                )}
              </div>
            ))}
          </div>
          <div className="tower-sum">{sumLabel}</div>
        </div>

        <div className="tower-tiles">
          {uniqueTiles.map(({ tile, count }) => {
            const k = `${tile.n}/${tile.d}`
            const remaining = count - (usedCounts.get(k) ?? 0)
            const disabled = remaining <= 0 || done || overflow
            return (
              <button
                key={k}
                className={`tower-tile ${disabled ? 'tower-tile--disabled' : ''}`}
                onClick={() => handleAdd(tile)}
                disabled={disabled}
                aria-label={`Add ${tile.n} over ${tile.d}`}
              >
                <span className="tower-tile-n">{tile.n}</span>
                <span className="tower-tile-bar-line" />
                <span className="tower-tile-d">{tile.d}</span>
                {count > 1 && (
                  <span className="tower-tile-badge">×{remaining}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {stack.length > 0 && !done && !overflow && (
        <button className="tower-undo" onClick={handleUndo}>
          ↩ {t('towerUndo')}
        </button>
      )}
    </div>
  )
}
