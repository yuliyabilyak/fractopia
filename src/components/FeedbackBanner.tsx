interface Props {
  correct: boolean | null
  onNext: () => void
}

export default function FeedbackBanner({ correct, onNext }: Props) {
  if (correct === null) return null
  return (
    <div className={`feedback-banner ${correct ? 'correct' : 'wrong'}`}>
      <span>{correct ? '🎉 Correct! Well done!' : '❌ Not quite — try the next one!'}</span>
      <button onClick={onNext}>Next</button>
    </div>
  )
}
