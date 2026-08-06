// AnubisPuzzle — Anubis' Scales mini-game core loop.
// Three steps per puzzle: pick the common denominator, fill in the converted
// numerators, then press Balance to check both at once.

import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { playFeedbackSound } from '../utils/sounds'
import type { AnubisPuzzle as AnubisPuzzleData, ScaleFraction } from '../data/anubisScales'

type Phase = 'simplify' | 'denominator' | 'numerators' | 'balancing' | 'balanced'

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
const MAX_DIGITS = 3
const WOBBLE_MS = 650
const DENOM_WRONG_MS = 650
const BALANCING_MS = 1300

interface Props {
  puzzle: AnubisPuzzleData
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

interface ScaleVisualProps {
  fractions: ScaleFraction[]
  mode: 'original' | 'target'
  values?: (number | null)[]
  correctDenominator?: number
  wobble: boolean
  balanced: boolean
  wrongBlanks?: Set<number>
  activeBlank?: number
  interactive?: boolean
  onPanClick?: (i: number) => void
  onPanDrop?: (i: number, e: React.DragEvent) => void
}

function ScaleVisual({
  fractions, mode, values, correctDenominator, wobble, balanced,
  wrongBlanks, activeBlank, interactive, onPanClick, onPanDrop,
}: ScaleVisualProps) {
  return (
    <div className="anb-scale-wrap">
      <span className="anb-scale-pivot" aria-hidden="true">🐺</span>
      <div className={`anb-scale-beam${wobble ? ' anb-scale-beam--wobble' : ''}${balanced ? ' anb-scale-beam--balanced' : ''}`}>
        {fractions.map((f, i) => {
          const isWrong = wrongBlanks?.has(i) ?? false
          const isActive = activeBlank === i
          const n: number | string = (mode === 'original' ? f.numerator : values?.[i]) ?? '?'
          const d: number | string = (mode === 'original' ? f.denominator : correctDenominator) ?? '?'
          return (
            <div key={i} className="anb-pan-group">
              {mode === 'target' && (
                <>
                  <FracDisplay n={f.numerator} d={f.denominator} />
                  <span className="anb-pan-eq-sign" aria-hidden="true">=</span>
                </>
              )}
              <div className="anb-pan">
                <span className="anb-pan-chain" aria-hidden="true" />
                <div
                  className={[
                    'anb-pan-plate',
                    isWrong ? 'anb-pan-plate--wrong' : '',
                    isActive ? 'anb-pan-plate--active' : '',
                    interactive ? 'anb-pan-plate--interactive' : '',
                  ].filter(Boolean).join(' ')}
                  role={interactive ? 'button' : undefined}
                  tabIndex={interactive ? 0 : undefined}
                  onClick={interactive && onPanClick ? () => onPanClick(i) : undefined}
                  onDragOver={interactive && onPanDrop ? (e) => e.preventDefault() : undefined}
                  onDrop={interactive && onPanDrop ? (e) => onPanDrop(i, e) : undefined}
                >
                  {isWrong && <span className="anb-pan-wrong-mark" aria-hidden="true">⚠️</span>}
                  <FracDisplay n={n} d={d} large />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AnubisPuzzle({ puzzle, onMistake, onSolved }: Props) {
  const { t } = useLang()
  const { fractions } = puzzle

  const [phase, setPhase] = useState<Phase>(puzzle.needsSimplify ? 'simplify' : 'denominator')

  // Step 1 — denominator choice
  const [denomWrongId, setDenomWrongId] = useState<number | null>(null)
  const [denomHint, setDenomHint] = useState(false)

  // Step 2 — numerator entry (only the relevant mode's state is ever touched)
  const [choiceValues, setChoiceValues] = useState<(number | null)[]>(() => fractions.map(() => null))
  const [pool, setPool] = useState(() => puzzle.tilePool ?? [])
  const [placed, setPlaced] = useState<({ id: number; value: number } | null)[]>(() => fractions.map(() => null))
  const [typed, setTyped] = useState<string[]>(() => fractions.map(() => ''))
  const [activeBlank, setActiveBlank] = useState(0)
  const dragTileRef = useRef<number | null>(null)

  // Step 3 — balance check
  const [wrongBlanks, setWrongBlanks] = useState<Set<number>>(new Set())
  const [scaleWobble, setScaleWobble] = useState(false)

  useEffect(() => {
    if (denomWrongId === null) return
    const id = setTimeout(() => { setDenomWrongId(null); setDenomHint(true) }, DENOM_WRONG_MS)
    return () => clearTimeout(id)
  }, [denomWrongId])

  useEffect(() => {
    if (!scaleWobble) return
    const id = setTimeout(() => setScaleWobble(false), WOBBLE_MS)
    return () => clearTimeout(id)
  }, [scaleWobble])

  useEffect(() => {
    if (phase !== 'balancing') return
    const id = setTimeout(() => setPhase('balanced'), BALANCING_MS)
    return () => clearTimeout(id)
  }, [phase])

  const values: (number | null)[] =
    puzzle.inputMode === 'choice' ? choiceValues :
    puzzle.inputMode === 'tiles'  ? placed.map(p => p ? p.value : null) :
    typed.map(s => (s === '' ? null : parseInt(s, 10)))

  const allFilled = values.every(v => v !== null && !Number.isNaN(v))

  function clearWrong(i: number) {
    setWrongBlanks(prev => {
      if (!prev.has(i)) return prev
      const next = new Set(prev)
      next.delete(i)
      return next
    })
  }

  function chooseDenominator(d: number) {
    if (phase !== 'denominator' || denomWrongId !== null) return
    if (d === puzzle.correctDenominator) {
      playFeedbackSound(true)
      setDenomHint(false)
      setPhase('numerators')
    } else {
      playFeedbackSound(false)
      onMistake()
      setDenomWrongId(d)
    }
  }

  function pickChoice(i: number, opt: number) {
    setChoiceValues(prev => {
      const next = [...prev]
      next[i] = opt
      return next
    })
    clearWrong(i)
  }

  function placeTile(tile: { id: number; value: number }, slotIndex: number) {
    setPlaced(prev => {
      const displaced = prev[slotIndex]
      const next = [...prev]
      next[slotIndex] = tile
      setPool(p => {
        let np = p.filter(t => t.id !== tile.id)
        if (displaced) np = [...np, displaced]
        return np
      })
      return next
    })
    clearWrong(slotIndex)
  }

  function removeTile(slotIndex: number) {
    setPlaced(prev => {
      const tile = prev[slotIndex]
      if (!tile) return prev
      setPool(p => [...p, tile])
      const next = [...prev]
      next[slotIndex] = null
      return next
    })
  }

  function tapPan(i: number) {
    if (puzzle.inputMode === 'tiles') {
      if (placed[i]) { removeTile(i); return }
      const tile = pool[0]
      if (tile) placeTile(tile, i)
    } else if (puzzle.inputMode === 'keypad') {
      setActiveBlank(i)
    }
  }

  function pressDigit(d: string) {
    setTyped(prev => {
      if (prev[activeBlank].length >= MAX_DIGITS) return prev
      const next = [...prev]
      next[activeBlank] = next[activeBlank] + d
      return next
    })
    clearWrong(activeBlank)
  }

  function pressBackspace() {
    setTyped(prev => {
      const next = [...prev]
      next[activeBlank] = next[activeBlank].slice(0, -1)
      return next
    })
  }

  function pressClear() {
    setTyped(prev => {
      const next = [...prev]
      next[activeBlank] = ''
      return next
    })
  }

  function handleBalance() {
    if (phase !== 'numerators' || !allFilled) return
    const wrong = new Set<number>()
    values.forEach((v, i) => { if (v !== puzzle.correctNumerators[i]) wrong.add(i) })
    if (wrong.size === 0) {
      playFeedbackSound(true)
      setWrongBlanks(new Set())
      setPhase('balancing')
    } else {
      playFeedbackSound(false)
      onMistake()
      setWrongBlanks(wrong)
      setScaleWobble(true)
    }
  }

  const isBalanced = phase === 'balanced'
  const showScale = phase !== 'simplify'

  return (
    <div className="exercise-card anb-board">
      {phase === 'simplify' && (
        <>
          <p className="exercise-prompt">{t('anubisSimplifyTitle')}</p>
          <div className="anb-simplify-row">
            {fractions.map((f, i) => (
              <span key={i} className="anb-simplify-item">
                {f.rawNumerator !== undefined ? (
                  <>
                    <FracDisplay n={f.rawNumerator} d={f.rawDenominator!} large />
                    <span className="anb-simplify-arrow" aria-hidden="true">→</span>
                    <FracDisplay n={f.numerator} d={f.denominator} large />
                  </>
                ) : (
                  <FracDisplay n={f.numerator} d={f.denominator} large />
                )}
              </span>
            ))}
          </div>
          <button className="btn-check" onClick={() => setPhase('denominator')}>{t('next')} →</button>
        </>
      )}

      {showScale && (
        <>
          {phase === 'denominator' && <p className="exercise-prompt">{t('anubisPrompt')}</p>}
          {phase === 'numerators' && <p className="exercise-prompt">{t('anubisNumeratorPrompt')}</p>}

          <ScaleVisual
            fractions={fractions}
            mode={phase === 'denominator' ? 'original' : 'target'}
            values={values}
            correctDenominator={puzzle.correctDenominator}
            wobble={scaleWobble || denomWrongId !== null}
            balanced={isBalanced}
            wrongBlanks={wrongBlanks}
            activeBlank={puzzle.inputMode === 'keypad' && phase === 'numerators' ? activeBlank : undefined}
            interactive={phase === 'numerators' && puzzle.inputMode !== 'choice'}
            onPanClick={phase === 'numerators' ? tapPan : undefined}
            onPanDrop={phase === 'numerators' && puzzle.inputMode === 'tiles' ? (i, e) => {
              e.preventDefault()
              const id = dragTileRef.current
              const tile = pool.find(t => t.id === id)
              if (tile) placeTile(tile, i)
              dragTileRef.current = null
            } : undefined}
          />

          {phase === 'denominator' && (
            <>
              <div className="anb-denom-choices">
                {puzzle.denominatorChoices.map(d => (
                  <button
                    key={d}
                    className={`btn-choice anb-denom-btn${denomWrongId === d ? ' anb-btn--wrong' : ''}`}
                    onClick={() => chooseDenominator(d)}
                    disabled={denomWrongId !== null}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {denomHint && <p className="anb-hint">{t('anubisWrongDenom')}</p>}
            </>
          )}

          {phase === 'numerators' && (
            <>
              {puzzle.inputMode === 'choice' && (
                <div className="anb-choice-groups">
                  {fractions.map((_, i) => (
                    <div key={i} className="anb-choice-group">
                      {puzzle.choiceOptions![i].map(opt => (
                        <button
                          key={opt}
                          className={`btn-choice anb-numerator-btn${choiceValues[i] === opt ? ' anb-numerator-btn--sel' : ''}`}
                          onClick={() => pickChoice(i, opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {puzzle.inputMode === 'tiles' && (
                <div className="anb-tile-pool">
                  {pool.map(tile => (
                    <button
                      key={tile.id}
                      type="button"
                      className="anb-tile"
                      draggable
                      onDragStart={() => { dragTileRef.current = tile.id }}
                      onClick={() => {
                        const emptyIndex = placed.findIndex(p => p === null)
                        if (emptyIndex !== -1) placeTile(tile, emptyIndex)
                      }}
                    >
                      {tile.value}
                    </button>
                  ))}
                </div>
              )}

              {puzzle.inputMode === 'keypad' && (
                <div className="scr-keypad anb-keypad">
                  {DIGITS.map(d => (
                    <button key={d} type="button" className="scr-key" onClick={() => pressDigit(d)}>{d}</button>
                  ))}
                  <button type="button" className="scr-key scr-key--clear" onClick={pressClear}>{t('scrollClear')}</button>
                  <button type="button" className="scr-key" onClick={() => pressDigit('0')}>0</button>
                  <button type="button" className="scr-key scr-key--back" onClick={pressBackspace} aria-label={t('scrollClear')}>⌫</button>
                </div>
              )}

              <button className="btn-check anb-balance-btn" onClick={handleBalance} disabled={!allFilled}>
                ⚖️ {t('anubisBalanceBtn')}
              </button>
              {wrongBlanks.size > 0 && <p className="anb-hint anb-hint--wrong">{t('anubisWrongBalance')}</p>}
            </>
          )}

          {isBalanced && (
            <div className="anb-reveal">
              <div className="anb-doors" aria-hidden="true">
                <span className="anb-door anb-door--left" />
                <span className="anb-door anb-door--right" />
              </div>
              <p className="anb-balanced-title">{t('anubisBalancedTitle')}</p>
              <div className="anb-treasure" aria-hidden="true">🗝️ 📦 → 💰 💎</div>
              <button className="ice-btn-next" onClick={onSolved}>{t('next')} →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
