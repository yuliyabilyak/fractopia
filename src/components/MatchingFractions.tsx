import { useState, useRef, useEffect } from 'react'
import { useLang } from '../i18n/LangContext'

export interface FracPair {
  left:  { n: number; d: number }
  right: { n: number; d: number }
}

interface Props {
  pairs: FracPair[]
  onAnswer: (correct: boolean) => void
}

interface Line { x1: number; y1: number; x2: number; y2: number }

function equiv(a: { n: number; d: number }, b: { n: number; d: number }) {
  return a.n * b.d === b.n * a.d
}

function FracDisplay({ n, d }: { n: number; d: number }) {
  return (
    <span className="frac-display" style={{ pointerEvents: 'none' }}>
      <span className="frac-n">{n}</span>
      <span className="frac-bar-line" />
      <span className="frac-d">{d}</span>
    </span>
  )
}

export default function MatchingFractions({ pairs, onAnswer }: Props) {
  const { t } = useLang()

  const [rightOrder] = useState<{ n: number; d: number }[]>(() => {
    const rights = pairs.map(p => p.right)
    const shuffled = [...rights].sort(() => 0.5 - Math.random())
    const trivial = shuffled.every((r, i) => r.n === rights[i].n && r.d === rights[i].d)
    if (trivial) [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
    return shuffled
  })

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [matched, setMatched] = useState<Map<number, number>>(new Map())
  const [wrongLeft,  setWrongLeft]  = useState<number | null>(null)
  const [wrongRight, setWrongRight] = useState<number | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const mistakesRef = useRef(0)
  const doneRef     = useRef(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const leftRefs     = useRef<(HTMLDivElement | null)[]>([])
  const rightRefs    = useRef<(HTMLDivElement | null)[]>([])

  // Recalculate line positions after every matched-state change
  useEffect(() => {
    if (!containerRef.current) return
    const box = containerRef.current.getBoundingClientRect()
    const next: Line[] = []
    for (const [li, ri] of matched) {
      const lEl = leftRefs.current[li]
      const rEl = rightRefs.current[ri]
      if (!lEl || !rEl) continue
      const lc = lEl.getBoundingClientRect()
      const rc = rEl.getBoundingClientRect()
      next.push({
        x1: lc.right  - box.left,
        y1: lc.top + lc.height / 2 - box.top,
        x2: rc.left   - box.left,
        y2: rc.top + rc.height / 2 - box.top,
      })
    }
    setLines(next)
  }, [matched])

  const matchedRights = new Set(matched.values())

  const handleLeft = (i: number) => {
    if (matched.has(i) || doneRef.current) return
    setSelectedLeft(prev => (prev === i ? null : i))
  }

  const handleRight = (j: number) => {
    if (matchedRights.has(j) || doneRef.current || selectedLeft === null) return

    if (equiv(pairs[selectedLeft].left, rightOrder[j])) {
      const next = new Map(matched).set(selectedLeft, j)
      setMatched(next)
      setSelectedLeft(null)
      if (next.size === pairs.length) {
        doneRef.current = true
        setTimeout(() => onAnswer(mistakesRef.current === 0), 500)
      }
    } else {
      mistakesRef.current += 1
      setWrongLeft(selectedLeft)
      setWrongRight(j)
      setTimeout(() => {
        setWrongLeft(null)
        setWrongRight(null)
        setSelectedLeft(null)
      }, 450)
    }
  }

  return (
    <div className="exercise-card">
      <p className="exercise-prompt">{t('matchFractions')}</p>

      <div ref={containerRef} className="matching-container">
        <svg className="matching-svg" aria-hidden="true">
          {lines.map((ln, i) => (
            <line key={i} className="matching-line"
              x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2} />
          ))}
        </svg>

        {/* Left column */}
        <div className="matching-column">
          {pairs.map((pair, i) => {
            const isMatched  = matched.has(i)
            const isSelected = selectedLeft === i
            const isWrong    = wrongLeft === i
            return (
              <div
                key={i}
                ref={el => { leftRefs.current[i] = el }}
                className={[
                  'matching-card',
                  isSelected ? 'matching-card--selected' : '',
                  isMatched  ? 'matching-card--matched'  : '',
                  isWrong    ? 'matching-card--wrong'    : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleLeft(i)}
              >
                <FracDisplay n={pair.left.n} d={pair.left.d} />
              </div>
            )
          })}
        </div>

        {/* Right column */}
        <div className="matching-column">
          {rightOrder.map((frac, j) => {
            const isMatched = matchedRights.has(j)
            const isWrong   = wrongRight === j
            return (
              <div
                key={j}
                ref={el => { rightRefs.current[j] = el }}
                className={[
                  'matching-card',
                  isMatched ? 'matching-card--matched' : '',
                  isWrong   ? 'matching-card--wrong'   : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleRight(j)}
              >
                <FracDisplay n={frac.n} d={frac.d} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
