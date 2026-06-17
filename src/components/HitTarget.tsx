import { useState } from 'react'
import { useLang } from '../i18n/LangContext'

export interface HitFrac { n: number; d: number }

interface Props {
  target: HitFrac
  tiles: HitFrac[]
  onAnswer: (correct: boolean) => void
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

function addFracs(a: HitFrac, b: HitFrac): HitFrac {
  const n = a.n * b.d + b.n * a.d
  const d = a.d * b.d
  const g = gcd(Math.abs(n), d)
  return { n: n / g, d: d / g }
}

function FracInline({ f }: { f: HitFrac }) {
  if (f.d === 1) {
    return <span className="frac-n" style={{ fontSize: '1.3rem' }}>{f.n}</span>
  }
  return (
    <span className="frac-display">
      <span className="frac-n">{f.n}</span>
      <span className="frac-bar-line" />
      <span className="frac-d">{f.d}</span>
    </span>
  )
}

function Slot({ f, state }: { f?: HitFrac; state?: 'correct' | 'wrong' }) {
  return (
    <span className={['hit-slot', f ? 'hit-slot--filled' : 'hit-slot--empty', state ? `hit-slot--${state}` : ''].filter(Boolean).join(' ')}>
      {f ? <FracInline f={f} /> : '?'}
    </span>
  )
}

export default function HitTarget({ target, tiles, onAnswer }: Props) {
  const { t } = useLang()
  const [sel, setSel] = useState<number[]>([])

  const tap = (i: number) => {
    setSel(prev => {
      if (prev.includes(i)) return prev.filter(x => x !== i)
      if (prev.length >= 2) return prev
      return [...prev, i]
    })
  }

  const a = sel[0] !== undefined ? tiles[sel[0]] : undefined
  const b = sel[1] !== undefined ? tiles[sel[1]] : undefined
  const sumFrac = a && b ? addFracs(a, b) : undefined
  const isCorrect = sumFrac !== undefined &&
    Math.abs(sumFrac.n / sumFrac.d - target.n / target.d) < 0.001

  const sumState = sumFrac ? (isCorrect ? 'correct' : 'wrong') : undefined

  return (
    <div className="exercise-card">
      <p className="exercise-prompt">{t('hitTarget')}</p>

      {/* Target */}
      <div className="hit-target-box">
        <span className="frac-display frac-display--large">
          <span className="frac-n">{target.n}</span>
          <span className="frac-bar-line" />
          <span className="frac-d">{target.d}</span>
        </span>
      </div>

      {/* Live equation */}
      <div className="hit-equation">
        <Slot f={a} />
        <span className="hit-op">+</span>
        <Slot f={b} />
        <span className="hit-op">=</span>
        <Slot f={sumFrac} state={sumState} />
      </div>

      {/* Tile grid */}
      <div className="hit-tiles">
        {tiles.map((f, i) => (
          <button
            key={i}
            className={[
              'hit-tile',
              sel.includes(i) ? 'hit-tile--selected' : '',
              sel.length >= 2 && !sel.includes(i) ? 'hit-tile--dim' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => tap(i)}
            aria-pressed={sel.includes(i)}
          >
            <FracInline f={f} />
          </button>
        ))}
      </div>

      <button
        className="btn-check"
        onClick={() => onAnswer(isCorrect)}
        disabled={sel.length !== 2}
      >
        {t('check')}
      </button>
    </div>
  )
}
