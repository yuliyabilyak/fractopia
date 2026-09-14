// ScribeEgyptianBuilder — Egyptian unit-fraction decomposition.
// Mode A ('select'): pick the one candidate decomposition that equals the target.
// Mode B ('generate'): drag/tap unit-fraction jars into the sack until they sum to it.

import { useRef, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { playFeedbackSound } from '../utils/sounds'
import { egyptianSumHint, sumFractions, type EgyptianPuzzle } from '../data/scribePyramid'
import type { Fraction } from '../utils/fractionMath'

type Phase = 'answering' | 'solved'

interface Props {
  puzzle: EgyptianPuzzle
  onMistake: () => void
  onSolved: () => void
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

function DecompositionRow({ terms }: { terms: Fraction[] }) {
  return (
    <span className="scb-decomp-row">
      {terms.map((term, i) => (
        <span key={i} className="scb-decomp-term">
          {i > 0 && <span className="scb-plus" aria-hidden="true">+</span>}
          <FracDisplay n={term.numerator} d={term.denominator} />
        </span>
      ))}
    </span>
  )
}

interface Tile { id: number; fraction: Fraction }

export default function ScribeEgyptianBuilder({ puzzle, onMistake, onSolved }: Props) {
  const { t } = useLang()
  const [phase, setPhase] = useState<Phase>('answering')
  const [wrongIndex, setWrongIndex] = useState<number | null>(null)
  const [hint, setHint] = useState<string | null>(null)

  const [pool, setPool] = useState<Tile[]>(() => (puzzle.jarPool ?? []).map((fraction, id) => ({ id, fraction })))
  const [sack, setSack] = useState<Tile[]>([])
  const dragTileRef = useRef<number | null>(null)

  function pickChoice(i: number) {
    if (phase !== 'answering' || !puzzle.choices) return
    if (i === puzzle.correctChoiceIndex) {
      playFeedbackSound(true)
      setPhase('solved')
    } else {
      playFeedbackSound(false)
      onMistake()
      setWrongIndex(i)
      setTimeout(() => setWrongIndex(null), 500)
    }
  }

  function moveToSack(tile: Tile) {
    setPool(p => p.filter(x => x.id !== tile.id))
    setSack(s => [...s, tile])
    setHint(null)
  }

  function moveToPool(tile: Tile) {
    setSack(s => s.filter(x => x.id !== tile.id))
    setPool(p => [...p, tile])
    setHint(null)
  }

  function handleCheck() {
    if (phase !== 'answering' || sack.length === 0) return
    const outcome = egyptianSumHint(sack.map(t => t.fraction), puzzle.target)
    if (outcome === 'correct') {
      playFeedbackSound(true)
      setHint(null)
      setPhase('solved')
    } else {
      playFeedbackSound(false)
      onMistake()
      setHint(outcome === 'need-more' ? t('scribeNeedMoreHint') : t('scribeTooManyHint'))
    }
  }

  const sackSum = sack.length > 0 ? sumFractions(sack.map(t => t.fraction)) : null

  return (
    <div className="exercise-card scb-board">
      <p className="exercise-prompt">{t('scribeDecomposePrompt', { n: puzzle.target.numerator, d: puzzle.target.denominator })}</p>
      <FracDisplay n={puzzle.target.numerator} d={puzzle.target.denominator} large />

      {phase === 'answering' && puzzle.mode === 'select' && puzzle.choices && (
        <>
          <p className="scb-caption">{t('scribeSelectHint')}</p>
          <div className="scb-choice-list">
            {puzzle.choices.map((terms, i) => (
              <button
                key={i}
                type="button"
                className={`btn-choice scb-choice-btn${wrongIndex === i ? ' scb-choice-btn--wrong' : ''}`}
                onClick={() => pickChoice(i)}
              >
                <DecompositionRow terms={terms} />
              </button>
            ))}
          </div>
        </>
      )}

      {phase === 'answering' && puzzle.mode === 'generate' && (
        <>
          <p className="scb-caption">{t('scribeJarHint')}</p>
          <div
            className="scb-sack"
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault()
              const id = dragTileRef.current
              const tile = pool.find(x => x.id === id)
              if (tile) moveToSack(tile)
              dragTileRef.current = null
            }}
          >
            {sack.length === 0 && <span className="scb-sack-empty" aria-hidden="true">🏺</span>}
            {sack.map(tile => (
              <button
                key={tile.id}
                type="button"
                className="scb-jar scb-jar--placed"
                onClick={() => moveToPool(tile)}
              >
                <FracDisplay n={tile.fraction.numerator} d={tile.fraction.denominator} />
              </button>
            ))}
          </div>
          {sackSum && <p className="scb-running-total">{t('scribeSackTotal', { n: sackSum.numerator, d: sackSum.denominator })}</p>}

          <div className="scb-jar-pool">
            {pool.map(tile => (
              <button
                key={tile.id}
                type="button"
                className="scb-jar"
                draggable
                onDragStart={() => { dragTileRef.current = tile.id }}
                onClick={() => moveToSack(tile)}
              >
                <FracDisplay n={tile.fraction.numerator} d={tile.fraction.denominator} />
              </button>
            ))}
          </div>

          <button type="button" className="btn-check" onClick={handleCheck} disabled={sack.length === 0}>
            {t('check')}
          </button>
          {hint && <p className="scb-hint">{hint}</p>}
        </>
      )}

      {phase === 'solved' && (
        <div className="scb-reveal">
          <p className="scb-reveal-title">{t('scribeDecomposeSolved')}</p>
          <DecompositionRow terms={puzzle.decomposition} />
          <button type="button" className="ice-btn-next" onClick={onSolved}>
            {t('next')} →
          </button>
        </div>
      )}
    </div>
  )
}
