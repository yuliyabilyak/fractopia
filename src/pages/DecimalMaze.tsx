import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'
import ThemeToggle from '../components/ThemeToggle'
import MazeIntersection from '../components/MazeIntersection'
import MazeSummary from '../components/MazeSummary'
import { MAZE_DIFFICULTIES, MAZE_LENGTH, MAZE_POOL, type MazeDifficulty } from '../data/decimalMaze'
import { shuffle } from '../data/exercises'

type Phase = 'select' | 'playing' | 'finished'

const DIFF_EMOJI: Record<MazeDifficulty, string> = {
  easy: '🌱', medium: '🌿', hard: '🌳', expert: '🔥',
}

const DIFF_LABEL_KEY = {
  easy:   'mazeDiffEasy',
  medium: 'mazeDiffMedium',
  hard:   'mazeDiffHard',
  expert: 'mazeDiffExpert',
} as const satisfies Record<MazeDifficulty, string>

export default function DecimalMaze() {
  const navigate = useNavigate()
  const { t } = useLang()

  const [phase,      setPhase]      = useState<Phase>('select')
  const [difficulty,  setDifficulty] = useState<MazeDifficulty>('easy')
  const [runKey,      setRunKey]     = useState(0)
  const [index,       setIndex]      = useState(0)
  const [stars,       setStars]      = useState(0)
  const [mistakes,    setMistakes]   = useState(0)
  const [elapsed,     setElapsed]    = useState(0)
  const startedAtRef = useRef<number | null>(null)

  const session = useMemo(
    () => shuffle(MAZE_POOL[difficulty]).slice(0, MAZE_LENGTH[difficulty]),
    [difficulty, runKey],
  )

  useEffect(() => {
    if (phase !== 'playing' || startedAtRef.current === null) return
    const startedAt = startedAtRef.current
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => clearInterval(id)
  }, [phase, runKey])

  function startMaze(diff: MazeDifficulty) {
    setDifficulty(diff)
    setRunKey(k => k + 1)
    setIndex(0)
    setStars(0)
    setMistakes(0)
    setElapsed(0)
    startedAtRef.current = Date.now()
    setPhase('playing')
  }

  const handleMistake = useCallback(() => {
    setMistakes(m => m + 1)
  }, [])

  const handleSolved = useCallback((firstTry: boolean) => {
    if (firstTry) setStars(s => s + 1)
    setIndex(i => {
      const next = i + 1
      if (next >= session.length) setPhase('finished')
      return next
    })
  }, [session.length])

  if (phase === 'select') {
    return (
      <div className="fractions-page">
        <div className="fractions-header">
          <button className="training-back-btn" onClick={() => navigate('/')}>← {t('trainingBack')}</button>
          <ThemeToggle />
        </div>
        <h2 className="dm-select-title">{t('mazeDifficultyPrompt')}</h2>
        <div className="dm-diff-grid">
          {MAZE_DIFFICULTIES.map(diff => (
            <button key={diff} className="dm-diff-card" onClick={() => startMaze(diff)}>
              <span className="dm-diff-emoji">{DIFF_EMOJI[diff]}</span>
              <span className="dm-diff-name">{t(DIFF_LABEL_KEY[diff])}</span>
              <span className="dm-diff-count">{t('mazeIntersectionsLabel', { n: MAZE_LENGTH[diff] })}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'finished') {
    return (
      <div className="fractions-page">
        <MazeSummary
          stars={stars}
          total={session.length}
          mistakes={mistakes}
          seconds={elapsed}
          onPlayAgain={() => startMaze(difficulty)}
          onBack={() => setPhase('select')}
        />
      </div>
    )
  }

  const current = session[index]

  return (
    <div className="fractions-page">
      <div className="progress-bar-wrapper">
        <div className="progress-bar-fill" style={{ width: `${(index / session.length) * 100}%` }} />
      </div>
      <div className="fractions-header">
        <button className="training-back-btn" onClick={() => navigate('/')}>← {t('trainingBack')}</button>
        <p className="exercise-counter">{t('mazeCounter', { i: index + 1, total: session.length, stars })}</p>
        <ThemeToggle />
      </div>
      <p className="exercise-prompt">{t('mazePrompt')}</p>

      <MazeIntersection
        key={index}
        question={current}
        onSolved={handleSolved}
        onMistake={handleMistake}
      />
    </div>
  )
}
