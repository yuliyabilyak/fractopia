import { useMemo } from 'react'
import { useLang } from '../i18n/LangContext'

type TimeUnit = 'hour' | 'day' | 'week'

const ICON: Record<TimeUnit, string> = { hour: '⏰', day: '☀️', week: '📅' }

const UNIT_POOL: Record<TimeUnit, number[]> = {
  hour: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
  day:  [3, 4, 6, 8, 9, 12, 15, 16, 18],
  week: [1, 2, 3, 4, 5, 6],
}

function pickChoices(answer: number, pool: number[]): number[] {
  const distractors = pool.filter(x => x !== answer)
  const shuffled = [...distractors].sort(() => 0.5 - Math.random()).slice(0, 3)
  return [...shuffled, answer].sort(() => 0.5 - Math.random())
}

interface Props {
  numerator: number
  denominator: number
  unit: TimeUnit
  answer: number
  onAnswer: (correct: boolean) => void
}

export default function TimeFraction({ numerator, denominator, unit, answer, onAnswer }: Props) {
  const { t } = useLang()

  const choices = useMemo(
    () => pickChoices(answer, UNIT_POOL[unit]),
    [answer, unit],
  )

  const promptKey = unit === 'hour' ? 'timeFracHour' : unit === 'day' ? 'timeFracDay' : 'timeFracWeek'
  const hintKey   = unit === 'hour' ? 'hintHour'     : unit === 'day' ? 'hintDay'    : 'hintWeek'
  const unitKey   = unit === 'hour' ? 'unitMinutes'   : unit === 'day' ? 'unitHours'  : 'unitDays'

  return (
    <div className="exercise-card">
      <div className="time-frac-icon">{ICON[unit]}</div>
      <p
        className="exercise-prompt"
        dangerouslySetInnerHTML={{
          __html: t(promptKey, { n: numerator, d: denominator })
            .replace(/(\d+\/\d+)/, '<strong>$1</strong>'),
        }}
      />
      <p className="time-frac-hint">{t(hintKey)}</p>
      <div className="answer-choices">
        {choices.map(c => (
          <button key={c} className="answer-choice-btn" onClick={() => onAnswer(c === answer)}>
            <span className="answer-choice-num">{c}</span>
            <span className="answer-choice-unit">{t(unitKey)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
