import { useEffect, useMemo, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import PathOption, { type PathDirection, type PathState } from './PathOption'
import type { MazeQuestion } from '../data/decimalMaze'

type Phase = 'playing' | 'correct' | 'wrong'

interface Props {
  question:  MazeQuestion
  onSolved:  (firstTry: boolean) => void
  onMistake: () => void
}

const DIRECTIONS: PathDirection[] = ['up', 'left', 'right']

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MazeIntersection({ question, onSolved, onMistake }: Props) {
  const { t } = useLang()
  const [phase,      setPhase]      = useState<Phase>('playing')
  const [chosen,     setChosen]     = useState<string | null>(null)
  const [hadMistake, setHadMistake] = useState(false)

  const paths = useMemo(
    () => shuffled([question.correct, ...question.wrong]),
    [question],
  )

  // wrong → auto-reset after 1200 ms so the child can try again
  useEffect(() => {
    if (phase !== 'wrong') return
    const id = setTimeout(() => { setPhase('playing'); setChosen(null) }, 1200)
    return () => clearTimeout(id)
  }, [phase])

  // correct → brief pulse before the parent advances to the next intersection
  useEffect(() => {
    if (phase !== 'correct') return
    const id = setTimeout(() => onSolved(!hadMistake), 550)
    return () => clearTimeout(id)
  // onSolved is stable (useCallback in the parent); only phase should retrigger this
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function handleChoose(label: string) {
    if (phase !== 'playing') return
    setChosen(label)
    if (label === question.correct) {
      setPhase('correct')
    } else {
      setPhase('wrong')
      setHadMistake(true)
      onMistake()
    }
  }

  function stateFor(label: string): PathState {
    if (phase === 'correct') return label === chosen ? 'correct' : 'disabled'
    if (phase === 'wrong')   return label === chosen ? 'wrong' : 'disabled'
    return 'idle'
  }

  return (
    <div className="dm-intersection">
      {DIRECTIONS.map((dir, i) => {
        const label = paths[i]
        return (
          <PathOption
            key={dir}
            direction={dir}
            label={label}
            state={stateFor(label)}
            onChoose={() => handleChoose(label)}
          />
        )
      })}

      <div className="dm-node">
        <span className="frac-display frac-display--large">
          <span className="frac-n">{question.numerator}</span>
          <span className="frac-bar-line" />
          <span className="frac-d">{question.denominator}</span>
        </span>
      </div>

      {phase === 'wrong' && <p className="dm-dead-end-msg">{t('mazeTryAgain')}</p>}
    </div>
  )
}
