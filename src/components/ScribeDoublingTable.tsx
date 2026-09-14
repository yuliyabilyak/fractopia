// ScribeDoublingTable — the ancient Egyptian doubling method.
// The player taps grain-sack rows (1, 2, 4 wholes) until their multipliers sum
// to the target whole number, then combines the matching fraction rows.

import { useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { playFeedbackSound } from '../utils/sounds'
import { doublingHint, doublingSelectedSum, formatFraction, type MultiplyPuzzle } from '../data/scribePyramid'
import type { Fraction } from '../utils/fractionMath'

type Phase = 'selecting' | 'solved'

interface Props {
  puzzle: MultiplyPuzzle
  onMistake: () => void
  onSolved: (result: Fraction) => void
}

function FracDisplay({ n, d, large }: { n: number | string; d: number | string; large?: boolean }) {
  return (
    <span className={`frac-display${large ? ' frac-display--large' : ''}`}>
      <span className="frac-n">{n}</span>
      <span className="frac-bar-line" />
      <span className="frac-d">{d}</span>
    </span>
  )
}

export default function ScribeDoublingTable({ puzzle, onMistake, onSolved }: Props) {
  const { t } = useLang()
  const [phase, setPhase] = useState<Phase>('selecting')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [wrong, setWrong] = useState(false)
  const [hint, setHint] = useState<string | null>(null)

  const selectedSum = doublingSelectedSum(puzzle.rows, selected)

  function toggleRow(multiplier: number) {
    if (phase !== 'selecting') return
    setWrong(false)
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(multiplier)) next.delete(multiplier)
      else next.add(multiplier)
      return next
    })
  }

  function handleCombine() {
    if (phase !== 'selecting' || selected.size === 0) return
    const outcome = doublingHint(selectedSum, puzzle.whole)
    if (outcome === 'correct') {
      playFeedbackSound(true)
      setHint(null)
      setPhase('solved')
    } else {
      playFeedbackSound(false)
      onMistake()
      setWrong(true)
      setHint(outcome === 'need-more' ? t('scribeNeedMoreHint') : t('scribeTooManyHint'))
      setTimeout(() => setWrong(false), 500)
    }
  }

  return (
    <div className="exercise-card scb-board">
      <p className="exercise-prompt">{t('scribeDoublingPrompt', { whole: puzzle.whole, n: puzzle.unit.numerator, d: puzzle.unit.denominator })}</p>

      <div className="scb-doubling-table">
        {puzzle.rows.map(row => {
          const isSel = selected.has(row.multiplier)
          return (
            <button
              key={row.multiplier}
              type="button"
              className={`scb-row${isSel ? ' scb-row--selected' : ''}${wrong && isSel ? ' scb-row--wrong' : ''}`}
              onClick={() => toggleRow(row.multiplier)}
              disabled={phase !== 'selecting'}
            >
              <span className="scb-row-multiplier" aria-hidden="true">
                {Array.from({ length: row.multiplier }, (_, i) => <span key={i}>🌾</span>)}
              </span>
              <span className="scb-row-label">{row.multiplier} × </span>
              <FracDisplay n={row.fraction.numerator} d={row.fraction.denominator} />
            </button>
          )
        })}
      </div>

      {phase === 'selecting' && (
        <>
          <p className="scb-running-total">{t('scribeGroupsSoFar', { n: selectedSum, whole: puzzle.whole })}</p>
          <button type="button" className="btn-check" onClick={handleCombine} disabled={selected.size === 0}>
            {t('scribeCombineBtn')}
          </button>
          {hint && <p className="scb-hint">{hint}</p>}
        </>
      )}

      {phase === 'solved' && (
        <div className="scb-reveal">
          <p className="scb-reveal-title">{t('scribeCombinedResult')}</p>
          <FracDisplay n={puzzle.result.numerator} d={puzzle.result.denominator} large />
          <p className="scb-caption">
            {puzzle.whole} × {formatFraction(puzzle.unit)} = {formatFraction(puzzle.result)}
          </p>
          <button type="button" className="ice-btn-next" onClick={() => onSolved(puzzle.result)}>
            {t('next')} →
          </button>
        </div>
      )}
    </div>
  )
}
