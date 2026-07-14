import { useEffect, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { playFeedbackSound } from '../utils/sounds'
import type { DecimalPair } from '../data/pyramidClimb'

type Phase = 'playing' | 'correct' | 'wrong'

interface Props {
  pair:     DecimalPair
  onAnswer: (correct: boolean) => void
}

export default function DecimalDuel({ pair, onAnswer }: Props) {
  const { t } = useLang()
  const [phase,  setPhase]  = useState<Phase>('playing')
  const [chosen, setChosen] = useState<number | null>(null)

  const [a, b] = pair
  const answer = Math.max(a, b)

  useEffect(() => {
    if (phase === 'playing') return
    const id = setTimeout(() => onAnswer(phase === 'correct'), 550)
    return () => clearTimeout(id)
  // onAnswer is stable (useCallback in the parent); only phase should retrigger this
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function handleChoose(value: number) {
    if (phase !== 'playing') return
    const correct = value === answer
    setChosen(value)
    setPhase(correct ? 'correct' : 'wrong')
    playFeedbackSound(correct)
  }

  function cardClass(value: number): string {
    const cls = ['pyr-tablet']
    if (phase === 'correct' && value === chosen) cls.push('pyr-tablet--correct')
    if (phase === 'wrong'   && value === chosen) cls.push('pyr-tablet--wrong')
    return cls.join(' ')
  }

  return (
    <div className="exercise-card pyr-duel-card">
      <p className="exercise-prompt">{t('pyrPrompt')}</p>
      <div className="pyr-tablets">
        {pair.map((value, i) => (
          <button
            key={i}
            className={cardClass(value)}
            onClick={() => handleChoose(value)}
            disabled={phase !== 'playing'}
          >
            {value}
          </button>
        ))}
      </div>
      {phase === 'wrong' && <p className="pyr-slip-msg">{t('pyrSlip')}</p>}
    </div>
  )
}
