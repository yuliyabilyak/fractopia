import { useState } from 'react'
import { isCorrectAnswer, isCorrectChoice, type CancelProblem } from '../../data/numberWorkshop'
import { useLang } from '../../i18n/LangContext'
import AnswerCards from './AnswerCards'
import WorkshopPrompt from './WorkshopPrompt'
import { Frac, Product, ValueText } from './Values'

interface Props {
  problem: CancelProblem
  onAnswer: (correct: boolean) => void
}

/** The fraction with top and bottom written as products: (2 × 6)/(3 × 6). */
export function FactoredFraction({ top, bottom, struck }: { top: number[]; bottom: number[]; struck?: number }) {
  const show = (xs: number[]) => {
    const i = struck === undefined ? -1 : xs.indexOf(struck)
    return xs.map((x, j) => (j === i ? <span key={j} className="ws-cancel-chip ws-cancel-chip--on">{x}</span> : x))
  }
  return <Frac n={<Product factors={show(top)} />} d={<Product factors={show(bottom)} />} />
}

/** Spot the multiplier top and bottom share, and cancel it: 12/18 = (2 × 6)/(3 × 6) = 2/3. */
export default function FractionCancel({ problem, onAnswer }: Props) {
  const { t } = useLang()
  const [pick, setPick] = useState<{ top: number | null; bottom: number | null }>({ top: null, bottom: null })
  const fraction = `${problem.numerator}/${problem.denominator}`

  const row = (which: 'top' | 'bottom', factors: [number, number]) => (
    <Product
      factors={factors.map((f, i) => {
        const on = pick[which] === i
        return (
          <button
            key={i}
            type="button"
            className={`ws-cancel-chip${on ? ' ws-cancel-chip--on' : ''}`}
            aria-pressed={on}
            aria-label={`${t(which === 'top' ? 'wsTop' : 'wsBottom')}: ${f}`}
            onClick={() => setPick(p => ({ ...p, [which]: on ? null : i }))}
          >
            {f}
          </button>
        )
      })}
    />
  )

  return (
    <div className="exercise-card ws-station-card">
      <WorkshopPrompt textKey="wsPromptCancel" value={fraction} display={<ValueText value={fraction} />} />
      {problem.answerMode === 'select' ? (
        <>
          <span className="ws-big-value">
            <FactoredFraction top={problem.topFactors} bottom={problem.bottomFactors} />
          </span>
          <AnswerCards
            choices={problem.choices!}
            onPick={i => onAnswer(isCorrectChoice(problem, i))}
            render={c => <span className="ws-big-value"><ValueText value={c} /></span>}
          />
        </>
      ) : (
        <>
          <span className="ws-big-value ws-cancel-fraction">
            <Frac n={row('top', problem.topFactors)} d={row('bottom', problem.bottomFactors)} />
          </span>
          <button
            type="button"
            className="btn-check"
            disabled={pick.top === null || pick.bottom === null}
            onClick={() => onAnswer(isCorrectAnswer(problem, [
              String(problem.topFactors[pick.top!]),
              String(problem.bottomFactors[pick.bottom!]),
            ]))}
          >
            {t('check')}
          </button>
        </>
      )}
    </div>
  )
}
