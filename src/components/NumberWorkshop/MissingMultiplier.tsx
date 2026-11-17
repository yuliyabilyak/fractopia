import type { ReactNode } from 'react'
import { isCorrectAnswer, isCorrectChoice, missingSlots, type MissingProblem } from '../../data/numberWorkshop'
import AnswerCards from './AnswerCards'
import FillTheSlot from './FillTheSlot'
import WorkshopPrompt from './WorkshopPrompt'
import { EqualsSign, Product } from './Values'

interface Props {
  problem: MissingProblem
  onAnswer: (correct: boolean) => void
}

/** Complete the product: 48 = 6 × ?, or 60 = 2 × 5 × ?. */
export default function MissingMultiplier({ problem, onAnswer }: Props) {
  const slots = missingSlots(problem)

  const equation = (gap: ReactNode) => (
    <>
      <span className="ws-value">{problem.target}</span>
      <EqualsSign />
      <Product factors={slots.map((s, i) => (s === null ? <span key={i}>{gap}</span> : s))} />
    </>
  )

  return (
    <div className="exercise-card ws-station-card">
      <WorkshopPrompt textKey="wsPromptMissing" />
      {problem.answerMode === 'select' ? (
        <>
          <div className="ws-equation">{equation(<span className="ws-slot ws-slot--question" aria-hidden="true">?</span>)}</div>
          <AnswerCards
            choices={problem.choices!}
            onPick={i => onAnswer(isCorrectChoice(problem, i))}
            render={c => <span className="ws-big-value">{c}</span>}
          />
        </>
      ) : (
        <FillTheSlot
          equation={equation}
          cards={problem.cards!}
          onSubmit={v => onAnswer(isCorrectAnswer(problem, [...problem.knownFactors.map(String), v]))}
        />
      )}
    </div>
  )
}
