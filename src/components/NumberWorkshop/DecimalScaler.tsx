import type { ReactNode } from 'react'
import { isCorrectAnswer, isCorrectChoice, type ScalerProblem } from '../../data/numberWorkshop'
import AnswerCards from './AnswerCards'
import FillTheSlot from './FillTheSlot'
import WorkshopPrompt from './WorkshopPrompt'
import { EqualsSign, Product, ValueText } from './Values'

interface Props {
  problem: ScalerProblem
  onAnswer: (correct: boolean) => void
}

/** A decimal as a whole number times a power of ten: 0.24 = 24 × 0.01. */
export default function DecimalScaler({ problem, onAnswer }: Props) {
  const select = problem.answerMode === 'select'
  const equation = (gap: ReactNode) => (
    <>
      <span className="ws-value">{problem.value}</span>
      <EqualsSign />
      <Product factors={[gap, problem.scaleFactor]} />
    </>
  )

  return (
    <div className="exercise-card ws-station-card">
      <WorkshopPrompt
        textKey="wsPromptScaler"
        value={problem.value}
      />
      {select ? (
        <AnswerCards
          choices={problem.choices!}
          onPick={i => onAnswer(isCorrectChoice(problem, i))}
          render={c => <span className="ws-big-value"><ValueText value={c} /></span>}
        />
      ) : (
        <FillTheSlot
          equation={equation}
          cards={problem.cards!}
          onSubmit={v => onAnswer(isCorrectAnswer(problem, [v, problem.scaleFactor]))}
        />
      )}
    </div>
  )
}
