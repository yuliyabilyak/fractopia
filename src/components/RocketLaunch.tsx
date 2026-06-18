// RocketLaunch — improper-fraction → mixed-number multiple-choice exercise.
// Child picks the correct mixed number; on success a rocket counts down and launches.

import { useState, useEffect, useMemo } from 'react'
import { useLang } from '../i18n/LangContext'
import ConfettiBurst from './ConfettiBurst'

// ── Distractor generation ────────────────────────────────────────────────────

function makeMixed(whole: number, remN: number, d: number): string {
  return remN === 0 ? `${whole}` : `${whole} ${remN}/${d}`
}

function makeChoices(n: number, d: number): string[] {
  const whole = Math.floor(n / d)
  const rem   = n % d
  const correct = makeMixed(whole, rem, d)

  const candidates = new Set<string>()
  candidates.add(correct)

  // off-by-one whole
  if (whole > 1) candidates.add(makeMixed(whole - 1, rem, d))
  candidates.add(makeMixed(whole + 1, rem, d))

  // wrong remainder
  if (rem > 1)         candidates.add(makeMixed(whole, rem - 1, d))
  if (rem < d - 1)     candidates.add(makeMixed(whole, rem + 1, d))

  // complement remainder
  const comp = d - rem
  if (comp !== rem && comp < d) candidates.add(makeMixed(whole, comp, d))

  // whole part = n, remainder = 1 (classic confusion)
  if (n !== whole) candidates.add(makeMixed(n, 1, d))

  const distractors = [...candidates].filter(x => x !== correct)
  const picked = distractors.sort(() => 0.5 - Math.random()).slice(0, 3)
  return [correct, ...picked].sort(() => 0.5 - Math.random())
}

// ── Fraction blocks visual ───────────────────────────────────────────────────
// 15/4  →  [■■■■][■■■■][■■■■][■■■□]  (3 full + ¾)

function FracBlocks({ n, d }: { n: number; d: number }) {
  const whole  = Math.floor(n / d)
  const rem    = n % d
  const blocks = rem > 0 ? whole + 1 : whole

  return (
    <div className="rl-blocks">
      {Array.from({ length: blocks }, (_, bi) => {
        const filled = bi < whole ? d : rem
        const label  = bi < whole ? `${d}/${d}` : `${rem}/${d}`
        return (
          <div key={bi} className="rl-block">
            {Array.from({ length: d }, (_, si) => (
              <div
                key={si}
                className={`rl-seg${si < filled ? ' rl-seg--on' : ''}`}
              />
            ))}
            <span className="rl-block-label">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Conversion steps reveal ──────────────────────────────────────────────────

function ConvSteps({ n, d }: { n: number; d: number }) {
  const [step, setStep] = useState(0)
  const whole = Math.floor(n / d)
  const rem   = n % d

  useEffect(() => {
    if (step >= 3) return
    const id = setTimeout(() => setStep(s => s + 1), 750)
    return () => clearTimeout(id)
  }, [step])

  return (
    <div className="rl-conv">
      <div className="rl-conv-row">
        <span className="rl-conv-frac">{n}/{d}</span>
      </div>

      {step >= 1 && (
        <>
          <div className="rl-conv-arrow">↓</div>
          <div className="rl-conv-row rl-conv-row--sm">
            <span className="rl-conv-muted">{n} ÷ {d} = {whole} remainder {rem}</span>
          </div>
        </>
      )}

      {step >= 2 && (
        <>
          <div className="rl-conv-arrow">↓</div>
          <div className="rl-conv-row">
            {Array.from({ length: whole }, (_, i) => (
              <span key={i} className="rl-conv-chunk">
                <span className="rl-conv-frac rl-conv-frac--sm">{d}/{d}</span>
                {(i < whole - 1 || rem > 0) && <span className="rl-conv-op">+</span>}
              </span>
            ))}
            {rem > 0 && <span className="rl-conv-frac rl-conv-frac--sm">{rem}/{d}</span>}
          </div>
        </>
      )}

      {step >= 3 && (
        <>
          <div className="rl-conv-arrow">↓</div>
          <div className="rl-conv-row rl-conv-row--result">
            <span className="rl-conv-whole">{whole}</span>
            {rem > 0 && <span className="rl-conv-frac rl-conv-frac--rem">{rem}/{d}</span>}
          </div>
        </>
      )}
    </div>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────

type Phase = 'question' | 'wrong' | 'countdown' | 'launch' | 'reveal'

interface Props {
  numerator:   number
  denominator: number
  onAnswer: (correct: boolean) => void
}

export default function RocketLaunch({ numerator, denominator, onAnswer }: Props) {
  const { t } = useLang()
  const [phase, setPhase]   = useState<Phase>('question')
  const [count, setCount]   = useState(3)
  const [hint,  setHint]    = useState(false)

  const whole   = Math.floor(numerator / denominator)
  const rem     = numerator % denominator
  const correct = makeMixed(whole, rem, denominator)
  const choices = useMemo(() => makeChoices(numerator, denominator), [numerator, denominator])

  // countdown 3 → 2 → 1 → launch
  useEffect(() => {
    if (phase !== 'countdown') return
    if (count > 0) {
      const id = setTimeout(() => setCount(c => c - 1), 700)
      return () => clearTimeout(id)
    } else {
      const id = setTimeout(() => setPhase('launch'), 400)
      return () => clearTimeout(id)
    }
  }, [phase, count])

  // after launch animation, show reveal
  useEffect(() => {
    if (phase !== 'launch') return
    const id = setTimeout(() => setPhase('reveal'), 1600)
    return () => clearTimeout(id)
  }, [phase])

  // clear shake
  useEffect(() => {
    if (phase !== 'wrong') return
    const id = setTimeout(() => setPhase('question'), 1000)
    return () => clearTimeout(id)
  }, [phase])

  function handleChoice(choice: string) {
    if (phase !== 'question') return
    if (choice === correct) {
      setPhase('countdown')
      setCount(3)
    } else {
      setPhase('wrong')
      setHint(true)
    }
  }

  // ── reveal screen ──
  if (phase === 'reveal') {
    return (
      <div className="exercise-card rl-reveal">
        <ConfettiBurst />
        <div className="rl-rocket rl-rocket--landed">🚀</div>
        <p className="rl-reveal-hd">{t('rocketSuccess', { n: numerator, d: denominator, mixed: correct })}</p>
        <ConvSteps n={numerator} d={denominator} />
        <button className="ice-btn-next" onClick={() => onAnswer(true)}>
          {t('next')} →
        </button>
      </div>
    )
  }

  // ── countdown / launch screen ──
  if (phase === 'countdown' || phase === 'launch') {
    return (
      <div className="exercise-card rl-launchpad">
        <div className={`rl-rocket${phase === 'launch' ? ' rl-rocket--fly' : ''}`}>🚀</div>
        {phase === 'countdown' && (
          <p className="rl-countdown">{count > 0 ? count : '🚀 Liftoff!'}</p>
        )}
        {phase === 'launch' && (
          <p className="rl-countdown">🚀 Liftoff!</p>
        )}
      </div>
    )
  }

  // ── question screen ──
  return (
    <div className="exercise-card">
      <p className="exercise-prompt">{t('rocketPrompt')}</p>

      {/* Fraction visual — blocks showing wholes + remainder */}
      <FracBlocks n={numerator} d={denominator} />

      {/* The improper fraction to convert */}
      <div className="rl-target">
        <span className="rl-target-frac">
          <span className="rl-frac-n">{numerator}</span>
          <span className="rl-frac-bar" />
          <span className="rl-frac-d">{denominator}</span>
        </span>
        <span className="rl-target-eq">= ?</span>
      </div>

      {/* Rocket (shakes on wrong) */}
      <div className={`rl-rocket${phase === 'wrong' ? ' rl-rocket--shake' : ''}`}>🚀</div>

      {/* Answer choices */}
      <div className="rl-choices">
        {choices.map(c => (
          <button
            key={c}
            className="rl-choice-btn"
            onClick={() => handleChoice(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Hint after first wrong */}
      {hint && (
        <p className="rl-hint">
          {t('rocketHint', { d: denominator, n: numerator })}
        </p>
      )}
    </div>
  )
}
