import { useEffect, useMemo, useRef, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { useDetectiveText } from '../hooks/useDetectiveText'
import { playFeedbackSound } from '../utils/sounds'
import DetectiveNumber from './DetectiveNumber'
import DetectiveClues from './DetectiveClues'
import DetectiveSpeakButton from './DetectiveSpeakButton'
import {
  checkAnswer, explain,
  type Challenge, type Divisor, type Explanation, type RuleResult,
} from '../data/numberDetective'

type Status = 'answering' | 'retry' | 'solved'

interface Props {
  challenge: Extract<Challenge, { kind: 'all-divisors' }>
  onDone: (firstAttempt: RuleResult[]) => void
}

export default function DetectiveAllDivisors({ challenge, onDone }: Props) {
  const { t } = useLang()
  const text = useDetectiveText()
  const [status, setStatus] = useState<Status>('answering')
  const [selected, setSelected] = useState<ReadonlySet<Divisor>>(new Set())
  // options as they were at the last check — their verdicts stay visible
  // while they remain selected, so the player can see which picks were wrong
  const [checkedPicks, setCheckedPicks] = useState<ReadonlySet<Divisor>>(new Set())
  const [missing, setMissing] = useState(0)
  const [showRules, setShowRules] = useState(false)
  const [openWhy, setOpenWhy] = useState<Divisor | null>(null)
  const firstAttemptRef = useRef<RuleResult[] | null>(null)
  const questionRef = useRef<HTMLHeadingElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const explanations = useMemo(
    () => new Map<Divisor, Explanation>(challenge.options.map(d => [d, explain(challenge.n, d)])),
    [challenge],
  )
  const isCorrect = (d: Divisor) => challenge.correct.includes(d)
  const question = text.question(challenge)

  useEffect(() => { questionRef.current?.focus() }, [])
  useEffect(() => { if (status === 'solved') nextRef.current?.focus() }, [status])

  function toggle(d: Divisor) {
    if (status === 'solved') return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(d)) next.delete(d)
      else next.add(d)
      return next
    })
  }

  function check() {
    const picks = [...selected]
    const correct = checkAnswer(challenge, picks)
    firstAttemptRef.current ??= challenge.options.map(d => ({ divisor: d, correct: selected.has(d) === isCorrect(d) }))
    playFeedbackSound(correct)
    setCheckedPicks(new Set(selected))
    setMissing(challenge.correct.filter(d => !selected.has(d)).length)
    if (correct) {
      setStatus('solved')
      setShowRules(false)
    } else {
      setStatus('retry')
      setShowRules(true) // the relevant hint: every rule on the board
    }
  }

  function verdictFor(d: Divisor): boolean | null {
    if (status === 'solved') return isCorrect(d)
    if (selected.has(d) && checkedPicks.has(d)) return isCorrect(d)
    return null
  }

  const whyExplanation = openWhy !== null ? explanations.get(openWhy)! : null
  const highlight = whyExplanation ? whyExplanation.steps[whyExplanation.steps.length - 1].highlight : 0

  return (
    <div className="exercise-card nd-card">
      <div className="nd-question-row">
        <h2 className="nd-question" tabIndex={-1} ref={questionRef}>{question}</h2>
        <DetectiveSpeakButton lines={[question, t('ndPickAll')]} />
      </div>

      <DetectiveNumber n={challenge.n} highlight={highlight} />

      <p className="nd-instruction">{t('ndPickAll')}</p>

      <div className="nd-option-grid">
        {challenge.options.map(d => {
          const isOn = selected.has(d)
          const verdict = verdictFor(d)
          return (
            <button
              key={d}
              type="button"
              aria-pressed={isOn}
              disabled={status === 'solved'}
              className={`nd-option${isOn ? ' nd-option--on' : ''}${verdict === false && isOn ? ' nd-option--wrong' : ''}`}
              onClick={() => toggle(d)}
            >
              <span className="nd-option-box" aria-hidden="true">{isOn ? '☑' : '☐'}</span>
              <span className="nd-option-num">{d}</span>
              {verdict !== null && (
                <span className="nd-option-verdict">
                  <span aria-hidden="true">{verdict ? '✓ ' : '✗ '}</span>{t(verdict ? 'ndYes' : 'ndNo')}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {status !== 'solved' && (
        <button type="button" className="btn-start nd-check-btn" onClick={check} disabled={selected.size === 0}>
          {t('ndCheck')}
        </button>
      )}

      <div role="status" className="nd-feedback-slot">
        {status === 'retry' && (
          <p className="nd-feedback nd-feedback--retry">
            <span aria-hidden="true">🔎</span> {t('ndNotQuite')}
            {missing > 0 && <><br />{t('ndMissing', { n: missing })}</>}
          </p>
        )}
        {status === 'solved' && (
          <p className="nd-feedback nd-feedback--correct"><span aria-hidden="true">✓</span> {t('ndCorrect')} {t('ndAllFound')}</p>
        )}
      </div>

      {status !== 'solved' && (
        <button type="button" className="nd-hint-btn" aria-expanded={showRules} onClick={() => setShowRules(s => !s)}>
          <span aria-hidden="true">💡</span> {t(showRules ? 'ndHideRules' : 'ndShowRules')}
        </button>
      )}

      {showRules && (
        <section className="nd-clues" aria-label={t('ndCluesTitle')}>
          <div className="nd-clues-header">
            <h3 className="nd-clues-title"><span aria-hidden="true">📖</span> {t('ndCluesTitle')}</h3>
          </div>
          <ul className="nd-rule-list">
            {challenge.options.map(d => (
              <li key={d} className="nd-rule-row">
                <span className="nd-rule-divisor">{d}</span>
                <span>{text.rule(d)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {status === 'solved' && (
        <ul className="nd-why-list">
          {challenge.options.map(d => {
            const ex = explanations.get(d)!
            const isOpen = openWhy === d
            return (
              <li key={d} className="nd-why-row">
                <div className="nd-why-head">
                  <span className="nd-why-verdict">
                    <span aria-hidden="true">{ex.conclusion.ok ? '✓ ' : '✗ '}</span>
                    {t(ex.conclusion.ok ? 'ndPartYes' : 'ndPartNo', { d })}
                  </span>
                  <button
                    type="button"
                    className="nd-why-btn"
                    aria-expanded={isOpen}
                    onClick={() => setOpenWhy(isOpen ? null : d)}
                  >
                    {t('ndWhy')} <span aria-hidden="true">{isOpen ? '▴' : '▾'}</span>
                  </button>
                </div>
                {isOpen && (
                  <div className="nd-why-body">
                    <DetectiveClues steps={ex.steps} conclusion={ex.conclusion} />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {status === 'solved' && (
        <button type="button" ref={nextRef} className="btn-start nd-next-btn" onClick={() => onDone(firstAttemptRef.current ?? [])}>
          {t('ndNextCase')} <span aria-hidden="true">→</span>
        </button>
      )}
    </div>
  )
}
