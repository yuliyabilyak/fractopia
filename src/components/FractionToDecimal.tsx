import { useMemo } from 'react'
import { useLang } from '../i18n/LangContext'

interface Props {
  numerator: number
  denominator: number
  answer: number
  onAnswer: (correct: boolean) => void
}

function decimalPlacesOf(n: number): number {
  const s = n.toString()
  const i = s.indexOf('.')
  return i === -1 ? 0 : s.length - i - 1
}

function round(n: number, places: number): number {
  const f = 10 ** places
  return Math.round(n * f) / f
}

function buildChoices(answer: number, places: number): number[] {
  const wrong = new Set<number>()
  const tryAdd = (v: number) => {
    const r = round(v, places)
    if (r >= 0 && r !== answer) wrong.add(r)
  }
  const whole = Math.floor(answer)
  tryAdd(answer / 10)
  tryAdd(answer * 10)
  tryAdd(whole + 1 - (answer - whole))
  while (wrong.size < 3) {
    tryAdd(answer + (Math.random() < 0.5 ? -1 : 1) * (0.02 + Math.random() * 0.3))
  }
  const values = [...wrong].slice(0, 3)
  values.push(answer)
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[values[i], values[j]] = [values[j], values[i]]
  }
  return values
}

export default function FractionToDecimal({ numerator, denominator, answer, onAnswer }: Props) {
  const { t } = useLang()
  const places = Math.max(decimalPlacesOf(answer), 2)
  const choices = useMemo(() => buildChoices(answer, places), [answer, places])

  return (
    <div className="exercise-card">
      <p className="exercise-prompt">{t('decimalPrompt')}</p>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 8px' }}>
        <span className="frac-display frac-display--large">
          <span className="frac-n">{numerator}</span>
          <span className="frac-bar-line" />
          <span className="frac-d">{denominator}</span>
        </span>
      </div>
      <div className="answer-choices">
        {choices.map((c, i) => (
          <button key={i} className="answer-choice-btn" onClick={() => onAnswer(c === answer)}>
            <span className="answer-choice-num">{c.toFixed(places)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
