import type { ReactNode } from 'react'

interface Props {
  choices: string[]
  render: (choice: string) => ReactNode
  /** one tap answers — no separate Check for Mode A */
  onPick: (index: number) => void
  wide?: boolean
}

/** Mode A: 3–4 large cards, a single tap answers. */
export default function AnswerCards({ choices, render, onPick, wide }: Props) {
  return (
    <div className={`ws-answer-cards${wide ? ' ws-answer-cards--wide' : ''}`}>
      {choices.map((choice, i) => (
        <button key={choice} type="button" className="ws-answer-card" onClick={() => onPick(i)}>
          {render(choice)}
        </button>
      ))}
    </div>
  )
}
