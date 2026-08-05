import { useEffect, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { playFeedbackSound } from '../utils/sounds'
import type { SnakeChoice } from '../data/fractionSnake'

type Phase = 'playing' | 'correct' | 'wrong'

interface Props {
  choices: SnakeChoice[]
  isFinalJunction: boolean
  onMistake: () => void
  onAdvance: () => void
}

const WRONG_RESET_MS = 1100
const ADVANCE_MS = 550

export default function SnakeJunction({ choices, isFinalJunction, onMistake, onAdvance }: Props) {
  const { t } = useLang()
  const [phase, setPhase] = useState<Phase>('playing')
  const [chosenId, setChosenId] = useState<string | null>(null)

  // wrong → auto-reset after a beat so the child can try the junction again
  useEffect(() => {
    if (phase !== 'wrong') return
    const id = setTimeout(() => { setPhase('playing'); setChosenId(null) }, WRONG_RESET_MS)
    return () => clearTimeout(id)
  }, [phase])

  // correct → brief pulse before the parent advances the snake to the next junction
  useEffect(() => {
    if (phase !== 'correct') return
    const id = setTimeout(onAdvance, ADVANCE_MS)
    return () => clearTimeout(id)
  // onAdvance is stable (defined fresh per junction in the parent); only phase should retrigger this
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function handleChoose(choice: SnakeChoice) {
    if (phase !== 'playing') return
    setChosenId(choice.id)
    if (choice.correct) {
      playFeedbackSound(true)
      setPhase('correct')
    } else {
      playFeedbackSound(false)
      setPhase('wrong')
      onMistake()
    }
  }

  function tileClass(choice: SnakeChoice): string {
    const cls = ['sn-tile']
    if (phase === 'correct') cls.push(choice.id === chosenId ? 'sn-tile--correct' : 'sn-tile--disabled')
    else if (phase === 'wrong') cls.push(choice.id === chosenId ? 'sn-tile--trap' : 'sn-tile--disabled')
    return cls.join(' ')
  }

  return (
    <div className="sn-junction">
      <div className="sn-tiles-row">
        {choices.map(choice => (
          <button
            key={choice.id}
            type="button"
            className={tileClass(choice)}
            onClick={() => handleChoose(choice)}
            disabled={phase !== 'playing'}
          >
            <span className="sn-tile-icon" aria-hidden="true">🪨</span>
            <span className="frac-display">
              <span className="frac-n">{choice.fraction.numerator}</span>
              <span className="frac-bar-line" />
              <span className="frac-d">{choice.fraction.denominator}</span>
            </span>
          </button>
        ))}
      </div>
      {phase === 'wrong' && <p className="sn-wrong-hint">{t('snakeWrongHint')}</p>}
      {phase === 'correct' && isFinalJunction && <p className="sn-round-clear-banner">{t('snakeLevelClear')}</p>}
    </div>
  )
}
