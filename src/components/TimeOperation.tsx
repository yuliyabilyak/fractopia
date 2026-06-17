import { useMemo } from 'react'
import { useLang } from '../i18n/LangContext'

type Operation = 'add' | 'subtract' | 'divide'

const ICON: Record<Operation, string> = {
  add:      '➕',
  subtract: '➖',
  divide:   '➗',
}

const MINUTES_POOL = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]

function pickChoices(answer: number): number[] {
  const distractors = MINUTES_POOL.filter(x => x !== answer)
  const shuffled = [...distractors].sort(() => 0.5 - Math.random()).slice(0, 3)
  return [...shuffled, answer].sort(() => 0.5 - Math.random())
}

interface Props {
  numerator: number
  denominator: number
  operation: Operation
  n2?: number
  d2?: number
  divisor?: number
  answer: number
  onAnswer: (correct: boolean) => void
}

export default function TimeOperation({
  numerator, denominator, operation, n2, d2, divisor, answer, onAnswer,
}: Props) {
  const { t } = useLang()

  const choices = useMemo(() => pickChoices(answer), [answer])

  const promptKey =
    operation === 'add'      ? 'timeOpAdd' :
    operation === 'subtract' ? 'timeOpSubtract' : 'timeOpDivide'

  const vars: Record<string, string | number> = operation === 'divide'
    ? { n: numerator, d: denominator, div: divisor! }
    : { n1: numerator, d1: denominator, n2: n2!, d2: d2! }

  return (
    <div className="exercise-card">
      <div className="time-frac-icon">{ICON[operation]}</div>
      <p
        className="exercise-prompt"
        dangerouslySetInnerHTML={{
          __html: t(promptKey, vars).replace(/(\d+\/\d+)/g, '<strong>$1</strong>'),
        }}
      />
      <p className="time-frac-hint">{t('hintHour')}</p>
      <div className="answer-choices">
        {choices.map(c => (
          <button key={c} className="answer-choice-btn" onClick={() => onAnswer(c === answer)}>
            <span className="answer-choice-num">{c}</span>
            <span className="answer-choice-unit">{t('unitMinutes')}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
