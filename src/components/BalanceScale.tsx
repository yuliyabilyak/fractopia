import { useState, useEffect, useMemo } from 'react'
import { useLang } from '../i18n/LangContext'

interface Props {
  numerator:   number  // total weight (m) — right side blocks
  denominator: number  // coefficient (n) — number of boxes on left
  answer:      number  // x value
  onAnswer:    (correct: boolean) => void
}

type Phase = 'choose' | 'wrong' | 'splitting' | 'reveal'

interface Op {
  label:   string
  correct: boolean
  key:     'div' | 'mul' | 'add'
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function BalanceScale({ numerator, denominator, answer, onAnswer }: Props) {
  const { t } = useLang()
  const [phase, setPhase]       = useState<Phase>('choose')
  const [wrongKey, setWrongKey] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)

  const coeff = denominator  // n  (number of boxes on left)
  const total = numerator    // m  (total blocks on right = coeff × answer)

  const ops = useMemo<Op[]>(() => shuffled([
    { label: `÷ ${coeff}`, correct: true,  key: 'div' as const },
    { label: `× ${coeff}`, correct: false, key: 'mul' as const },
    { label: `+ ${coeff}`, correct: false, key: 'add' as const },
  ]), [coeff])

  // wrong → back to choose after 0.8 s
  useEffect(() => {
    if (phase !== 'wrong') return
    const id = setTimeout(() => {
      setPhase('choose')
      setWrongKey(null)
      setShowHint(true)
    }, 800)
    return () => clearTimeout(id)
  }, [phase])

  // splitting → reveal after 1.4 s
  useEffect(() => {
    if (phase !== 'splitting') return
    const id = setTimeout(() => setPhase('reveal'), 1400)
    return () => clearTimeout(id)
  }, [phase])

  function handleOp(op: Op) {
    if (phase !== 'choose') return
    if (op.correct) {
      setShowHint(false)
      setPhase('splitting')
    } else {
      setWrongKey(op.key)
      setPhase('wrong')
    }
  }

  const isSplit  = phase === 'splitting' || phase === 'reveal'
  const isReveal = phase === 'reveal'

  return (
    <div className="exercise-card">
      <p className="exercise-prompt">{t('bsPrompt')}</p>

      {/* Equation */}
      <div className="bs-equation">
        <span className="bs-eq-coeff">{coeff}</span>
        <span className="bs-eq-x">x</span>
        <span className="bs-eq-sign">=</span>
        <span className="bs-eq-total">{total}</span>
      </div>

      {/* Balance scale visual */}
      <div className="bs-scale-row">
        {/* Left pan: mystery boxes */}
        <div className="bs-boxes-wrap">
          {Array.from({ length: coeff }, (_, i) => (
            <div
              key={i}
              className={
                'bs-box-group' +
                (isSplit ? ' bs-box-group--split' : '') +
                (isReveal && i > 0 ? ' bs-box-group--dim' : '')
              }
            >
              <span className="bs-box-emoji">📦</span>
            </div>
          ))}
        </div>

        {/* Pivot */}
        <div className="bs-scale-center">
          <span className={'bs-scale-icon' + (phase === 'wrong' ? ' bs-scale-icon--wobble' : '')}>
            ⚖️
          </span>
        </div>

        {/* Right pan: weight blocks */}
        <div className="bs-blocks-wrap">
          {Array.from({ length: coeff }, (_, gi) => (
            <div
              key={gi}
              className={
                'bs-block-group' +
                (isSplit ? ' bs-block-group--split' : '') +
                (isReveal && gi > 0 ? ' bs-block-group--dim' : '')
              }
            >
              {Array.from({ length: answer }, (_, bi) => (
                <div key={bi} className="bs-block" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Operation choices */}
      {(phase === 'choose' || phase === 'wrong') && (
        <>
          <p className="bs-choose-label">{t('bsChooseOp')}</p>
          <div className="bs-ops">
            {ops.map(op => (
              <button
                key={op.key}
                className={
                  'bs-op-btn' +
                  (phase === 'wrong' && wrongKey === op.key ? ' bs-btn--wrong' : '')
                }
                onClick={() => handleOp(op)}
                disabled={phase === 'wrong'}
              >
                {op.label}
              </button>
            ))}
          </div>
          {showHint && (
            <p className="bs-hint-msg">{t('bsWrongOp')}</p>
          )}
        </>
      )}

      {/* Splitting label */}
      {phase === 'splitting' && (
        <p className="bs-split-label">{t('bsSplitting', { n: coeff })}</p>
      )}

      {/* Reveal */}
      {isReveal && (
        <div className="bs-reveal">
          <div className="bs-result-eq">
            <span className="bs-result-lhs">x</span>
            <span className="bs-result-sign">=</span>
            <span className="bs-result-rhs">{answer}</span>
          </div>
          <button className="ice-btn-next" onClick={() => onAnswer(true)}>
            {t('next')} →
          </button>
        </div>
      )}
    </div>
  )
}
