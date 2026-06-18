// MonsterBattle — fraction comparison exercise.
// Child taps the larger of two fractions; the monster eats it.

import { useState, useEffect } from 'react'
import { useLang } from '../i18n/LangContext'

type Phase = 'playing' | 'wrong' | 'eating' | 'explain'

// ── Segment bar visual ────────────────────────────────────────────────────────
// 7/4 → [■■■■][■■■□]   3/5 → [■■■□□]

function FracBar({ n, d }: { n: number; d: number }) {
  const groups = Math.max(1, Math.ceil(n / d))
  return (
    <div className="mb-segs-wrap">
      {Array.from({ length: groups }, (_, gi) => (
        <div key={gi} className="mb-seg-group">
          {Array.from({ length: d }, (_, si) => {
            const pos = gi * d + si
            return (
              <div key={si} className={`mb-seg${pos < n ? ' mb-seg--on' : ''}`} />
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ── Stacked fraction display ──────────────────────────────────────────────────

function FracDisplay({ n, d, large }: { n: number; d: number; large?: boolean }) {
  return (
    <span className={`mb-frac${large ? ' mb-frac--lg' : ''}`}>
      <span className="mb-frac-n">{n}</span>
      <span className="mb-frac-bar" />
      <span className="mb-frac-d">{d}</span>
    </span>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

interface Props {
  left:     { numerator: number; denominator: number }
  right:    { numerator: number; denominator: number }
  onAnswer: (correct: boolean) => void
}

export default function MonsterBattle({ left, right, onAnswer }: Props) {
  const { t } = useLang()
  const [phase,  setPhase]  = useState<Phase>('playing')
  const [chosen, setChosen] = useState<'left' | 'right' | null>(null)

  const leftVal  = left.numerator  / left.denominator
  const rightVal = right.numerator / right.denominator
  const answer   = leftVal >= rightVal ? 'left' : 'right'
  const winner   = answer === 'left' ? left : right

  // wrong → auto-reset after 1400 ms
  useEffect(() => {
    if (phase !== 'wrong') return
    const id = setTimeout(() => { setPhase('playing'); setChosen(null) }, 1400)
    return () => clearTimeout(id)
  }, [phase])

  // eating → explain after 1100 ms
  useEffect(() => {
    if (phase !== 'eating') return
    const id = setTimeout(() => setPhase('explain'), 1100)
    return () => clearTimeout(id)
  }, [phase])

  function handleChoice(side: 'left' | 'right') {
    if (phase !== 'playing') return
    setChosen(side)
    setPhase(side === answer ? 'eating' : 'wrong')
  }

  function cardClass(side: 'left' | 'right') {
    const cls = ['mb-card']
    if (phase === 'eating'  && chosen === side)  cls.push('mb-card--eaten')
    if (phase === 'wrong'   && chosen === side)  cls.push('mb-card--wrong')
    if (phase === 'wrong'   && side === answer)  cls.push('mb-card--hint')
    return cls.join(' ')
  }

  const monsterClass =
    phase === 'eating'  ? 'mb-monster mb-monster--eating'   :
    phase === 'wrong'   ? 'mb-monster mb-monster--confused' :
    phase === 'explain' ? 'mb-monster mb-monster--happy'    :
    'mb-monster mb-monster--idle'

  // ── explain ──
  if (phase === 'explain') {
    return (
      <div className="exercise-card mb-explain">
        <div className={monsterClass}>👹</div>
        <p className="mb-explain-result">
          <FracDisplay n={winner.numerator} d={winner.denominator} large />
          <span className="mb-wins-label">{t('mbWins')}</span>
        </p>
        <div className="mb-explain-bars">
          {(['left', 'right'] as const).map(side => {
            const frac = side === 'left' ? left : right
            return (
              <div key={side} className={`mb-explain-row${side === answer ? ' mb-explain-row--winner' : ''}`}>
                <FracDisplay n={frac.numerator} d={frac.denominator} />
                <FracBar n={frac.numerator} d={frac.denominator} />
              </div>
            )
          })}
        </div>
        <button className="ice-btn-next" onClick={() => onAnswer(true)}>
          {t('next')} →
        </button>
      </div>
    )
  }

  // ── playing / wrong / eating ──
  return (
    <div className="exercise-card">
      <div className={monsterClass}>
        👹
        {phase === 'eating' && <span className="mb-nom">NOM!</span>}
      </div>
      <p className="exercise-prompt">{t('mbPrompt')}</p>

      <div className="mb-cards">
        {(['left', 'right'] as const).map(side => {
          const frac = side === 'left' ? left : right
          return (
            <button
              key={side}
              className={cardClass(side)}
              onClick={() => handleChoice(side)}
            >
              <FracDisplay n={frac.numerator} d={frac.denominator} large />
              <FracBar n={frac.numerator} d={frac.denominator} />
            </button>
          )
        })}
      </div>

      {phase === 'wrong' && (
        <p className="mb-try-again">{t('mbTryAgain')}</p>
      )}
    </div>
  )
}
