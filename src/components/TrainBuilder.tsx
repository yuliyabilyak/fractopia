// TrainBuilder — improper-fraction-to-mixed-number exercise
// Child clicks fraction carriages to build a train matching the target.
// Discovery: n/d = w full carriages + r/d partial = mixed number w r/d.

import { useState, useEffect } from 'react'
import { useLang } from '../i18n/LangContext'
import ConfettiBurst from './ConfettiBurst'

const FILL_COLORS = ['#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#F59E0B']
const FILL_DARKS  = ['#15803D', '#1D4ED8', '#6D28D9', '#BE185D', '#C2410C', '#B45309']

// ── Carriage ──────────────────────────────────────────────────────────────────

function Carriage({ n, d, colorIdx = 0, onRemove }: {
  n: number
  d: number
  colorIdx?: number
  onRemove?: () => void
}) {
  const color = FILL_COLORS[colorIdx % FILL_COLORS.length]
  const dark  = FILL_DARKS[colorIdx % FILL_DARKS.length]

  return (
    <div className="tc-car">
      {onRemove && (
        <button className="tc-car-rm" onClick={onRemove} aria-label={`Remove ${n}/${d}`}>
          ×
        </button>
      )}
      <div className="tc-car-body" style={{ borderColor: dark }}>
        {Array.from({ length: d }, (_, i) => (
          <div
            key={i}
            className="tc-seg"
            style={{ background: i < n ? color : '#E5E7EB' }}
          />
        ))}
      </div>
      <div className="tc-wheels">
        <div className="tc-wheel" style={{ background: dark }} />
        <div className="tc-wheel" style={{ background: dark }} />
      </div>
      <span className="tc-label">{n}/{d}</span>
    </div>
  )
}

// ── Stacked fraction label ────────────────────────────────────────────────────

function Frac({ n, d, large }: { n: number; d: number; large?: boolean }) {
  return (
    <span className={`frac-display${large ? ' frac--train-lg' : ''}`}>
      <span className="frac-n">{n}</span>
      <span className="frac-bar-line" />
      <span className="frac-d">{d}</span>
    </span>
  )
}

// ── Conversion reveal ─────────────────────────────────────────────────────────

// Shows the child's completed train, then steps through the mixed-number conversion.
function ConvReveal({ n, d, train, onNext }: {
  n: number
  d: number
  train: number[]
  onNext: () => void
}) {
  const [step, setStep] = useState(0)
  const wholes = Math.floor(n / d)
  const rem    = n % d

  useEffect(() => {
    if (step >= 3) return
    const id = setTimeout(() => setStep(s => s + 1), 700)
    return () => clearTimeout(id)
  }, [step])

  // C5 → E5 → G5 → C6 chime on mount
  useEffect(() => {
    try {
      const ac = new AudioContext()
      const tone = (freq: number, s: number) => {
        const o = ac.createOscillator(), g = ac.createGain()
        o.connect(g); g.connect(ac.destination)
        o.frequency.value = freq
        g.gain.setValueAtTime(0.22, ac.currentTime + s)
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + s + 0.3)
        o.start(ac.currentTime + s); o.stop(ac.currentTime + s + 0.35)
      }
      tone(523.25, 0); tone(659.25, 0.1); tone(783.99, 0.2); tone(1046.5, 0.32)
    } catch { /* no audio */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="tc-reveal">
      <ConfettiBurst />
      <p className="tc-reveal-hd">🚂 All aboard!</p>

      {/* Child's completed train */}
      <div className="tc-reveal-train">
        {train.map((carN, i) => (
          <Carriage key={i} n={carN} d={d} colorIdx={d - carN} />
        ))}
      </div>

      {/* Step-by-step conversion */}
      <div className="tc-conv">
        <div className="tc-conv-row">
          <Frac n={n} d={d} large />
        </div>

        {step >= 1 && (
          <>
            <div className="tc-conv-arrow">↓</div>
            <div className="tc-conv-row">
              {Array.from({ length: wholes }, (_, i) => (
                <span key={i} className="tc-conv-chunk">
                  <Frac n={d} d={d} />
                  {(i < wholes - 1 || rem > 0) && (
                    <span className="tc-conv-op">+</span>
                  )}
                </span>
              ))}
              {rem > 0 && <Frac n={rem} d={d} />}
            </div>
          </>
        )}

        {step >= 2 && rem > 0 && (
          <>
            <div className="tc-conv-arrow">↓</div>
            <div className="tc-conv-row">
              <span className="tc-whole">{wholes}</span>
              <span className="tc-conv-op">+</span>
              <Frac n={rem} d={d} />
            </div>
          </>
        )}

        {step >= 3 && (
          <>
            <div className="tc-conv-arrow">↓</div>
            <div className="tc-conv-row tc-conv-row--result">
              {rem > 0 ? (
                <>
                  <span className="tc-whole tc-whole--big">{wholes}</span>
                  <Frac n={rem} d={d} large />
                </>
              ) : (
                <span className="tc-whole tc-whole--big">{wholes}</span>
              )}
            </div>
          </>
        )}
      </div>

      {step >= 3 && (
        <button className="ice-btn-next" onClick={onNext}>
          Next →
        </button>
      )}
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────

interface Props {
  numerator:   number
  denominator: number
  onAnswer: (correct: boolean) => void
}

export default function TrainBuilder({ numerator, denominator, onAnswer }: Props) {
  const { t } = useLang()
  const [train, setTrain] = useState<number[]>([])
  const [phase, setPhase] = useState<'playing' | 'done'>('playing')

  const currentNum = train.reduce((a, b) => a + b, 0)

  // Pieces from largest (d/d) to smallest (1/d)
  const pieces = Array.from({ length: denominator }, (_, i) => denominator - i)

  function addCarriage(n: number) {
    if (phase !== 'playing') return
    const next = [...train, n]
    setTrain(next)
    if (next.reduce((a, b) => a + b, 0) === numerator) {
      setTimeout(() => setPhase('done'), 350)
    }
  }

  function removeCarriage(idx: number) {
    if (phase !== 'playing') return
    setTrain(p => p.filter((_, i) => i !== idx))
  }

  const remaining = numerator - currentNum
  const isOver = currentNum > numerator
  const hintText = isOver
    ? `Too many! Remove a carriage to get back to ${numerator}/${denominator}`
    : remaining >= denominator
      ? `Try adding a full carriage (${denominator}/${denominator})`
      : `You need ${remaining} more — try a smaller piece!`

  return (
    <div className="exercise-card">
      <p className="exercise-prompt">
        {t('trainPrompt', { n: numerator, d: denominator })}
      </p>

      {phase === 'playing' ? (
        <>
          {/* Train track */}
          <div className="tc-track">
            {train.length === 0 ? (
              <span className="tc-track-empty">Tap a piece below to start!</span>
            ) : (
              train.map((n, i) => (
                <Carriage
                  key={i}
                  n={n}
                  d={denominator}
                  colorIdx={denominator - n}
                  onRemove={() => removeCarriage(i)}
                />
              ))
            )}
          </div>

          {/* Live progress counter */}
          <div className="tc-progress">
            <span className="tc-progress-lbl">Your train:</span>
            <Frac n={currentNum} d={denominator} />
            <span className="tc-progress-sep">·</span>
            <span className="tc-progress-lbl">Target:</span>
            <Frac n={numerator} d={denominator} />
          </div>

          {/* Available pieces */}
          <p className="tc-pieces-lbl">Tap to add a carriage:</p>
          <div className="tc-pieces">
            {pieces.map(n => (
              <button
                key={n}
                className="tc-piece-btn"
                onClick={() => addCarriage(n)}
                aria-label={`Add ${n}/${denominator} carriage`}
              >
                <Carriage n={n} d={denominator} colorIdx={denominator - n} />
              </button>
            ))}
          </div>

          {/* Hint: overshoot warning or nudge toward target */}
          {train.length > 0 && (isOver || remaining > 0) && (
            <p className={`tc-hint${isOver ? ' tc-hint--over' : ''}`}>{hintText}</p>
          )}
        </>
      ) : (
        <ConvReveal
          n={numerator}
          d={denominator}
          train={train}
          onNext={() => onAnswer(true)}
        />
      )}
    </div>
  )
}
