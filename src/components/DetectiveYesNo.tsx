import { useEffect, useMemo, useRef, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { useDetectiveText } from '../hooks/useDetectiveText'
import { playFeedbackSound } from '../utils/sounds'
import DetectiveNumber from './DetectiveNumber'
import DetectiveClues from './DetectiveClues'
import DetectiveSpeakButton from './DetectiveSpeakButton'
import {
  checkAnswer, challengeRules, explain, explainBoth,
  type Challenge, type Highlight, type RuleResult,
} from '../data/numberDetective'

type Status = 'answering' | 'retry' | 'solved'

interface Props {
  challenge: Extract<Challenge, { kind: 'yes-no' | 'two-rules' }>
  /** called from "Next case", with how the first answer went for each rule */
  onDone: (firstAttempt: RuleResult[]) => void
}

export default function DetectiveYesNo({ challenge, onDone }: Props) {
  const { t } = useLang()
  const text = useDetectiveText()
  const [status, setStatus] = useState<Status>('answering')
  const [hintsShown, setHintsShown] = useState(0)
  const [triedWrong, setTriedWrong] = useState<boolean | null>(null)
  const firstAttemptRef = useRef<RuleResult[] | null>(null)
  const questionRef = useRef<HTMLHeadingElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const explanation = useMemo(
    () => challenge.kind === 'two-rules' ? explainBoth(challenge.n, challenge.divisors) : explain(challenge.n, challenge.divisor),
    [challenge],
  )
  const { steps } = explanation
  const question = text.question(challenge)

  useEffect(() => { questionRef.current?.focus() }, [])
  useEffect(() => { if (status === 'solved') nextRef.current?.focus() }, [status])

  function answer(value: boolean) {
    const correct = checkAnswer(challenge, value)
    firstAttemptRef.current ??= challengeRules(challenge).map(divisor => ({ divisor, correct }))
    playFeedbackSound(correct)
    // either way, lay out every clue; the conclusion only appears once solved
    setHintsShown(steps.length)
    if (correct) {
      setStatus('solved')
    } else {
      setStatus('retry')
      setTriedWrong(value)
    }
  }

  const visibleSteps = steps.slice(0, hintsShown)
  const initialFocus: Highlight = challenge.kind === 'yes-no' ? challenge.focus : 0
  const highlight = hintsShown > 0 ? steps[hintsShown - 1].highlight : initialFocus

  return (
    <div className="exercise-card nd-card">
      <div className="nd-question-row">
        <h2 className="nd-question" tabIndex={-1} ref={questionRef}>{question}</h2>
        <DetectiveSpeakButton lines={[question]} />
      </div>

      <DetectiveNumber n={challenge.n} highlight={highlight} />

      {status !== 'solved' && (
        <div className="nd-answer-row">
          {([true, false] as const).map(value => (
            <button
              key={String(value)}
              type="button"
              className={`nd-answer-btn${triedWrong === value ? ' nd-answer-btn--tried' : ''}`}
              onClick={() => answer(value)}
            >
              {triedWrong === value && <span className="nd-answer-mark" aria-hidden="true">✗ </span>}
              {t(value ? 'ndYes' : 'ndNo')}
            </button>
          ))}
        </div>
      )}

      <div role="status" className="nd-feedback-slot">
        {status === 'retry' && (
          <p className="nd-feedback nd-feedback--retry"><span aria-hidden="true">🔎</span> {t('ndNotQuite')}</p>
        )}
        {status === 'solved' && (
          <p className="nd-feedback nd-feedback--correct"><span aria-hidden="true">✓</span> {t('ndCorrect')}</p>
        )}
      </div>

      {hintsShown > 0 && (
        <section className="nd-clues" aria-label={t('ndCluesTitle')}>
          <div className="nd-clues-header">
            <h3 className="nd-clues-title"><span aria-hidden="true">💡</span> {t('ndCluesTitle')}</h3>
          </div>
          <div aria-live="polite">
            <DetectiveClues steps={visibleSteps} conclusion={status === 'solved' ? explanation.conclusion : undefined} />
          </div>
        </section>
      )}

      {status !== 'solved' && hintsShown < steps.length && (
        <button type="button" className="nd-hint-btn" onClick={() => setHintsShown(h => h + 1)}>
          <span aria-hidden="true">💡</span> {t(hintsShown === 0 ? 'ndHintBtn' : 'ndNextHintBtn')}
        </button>
      )}

      {status === 'solved' && (
        <button type="button" ref={nextRef} className="btn-start nd-next-btn" onClick={() => onDone(firstAttemptRef.current ?? [])}>
          {t('ndNextCase')} <span aria-hidden="true">→</span>
        </button>
      )}
    </div>
  )
}
