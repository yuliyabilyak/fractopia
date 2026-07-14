import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'
import ThemeToggle from '../components/ThemeToggle'
import PyramidScene from '../components/PyramidScene'
import DecimalDuel from '../components/DecimalDuel'
import TreasureCelebration from '../components/TreasureCelebration'
import { CHAMBERS, TOTAL_STEPS, STEPS_PER_CHAMBER, tierForChamber, randomPair } from '../data/pyramidClimb'
import { playChimeSound } from '../utils/sounds'

type Phase = 'playing' | 'finished'

function chamberIndexFor(level: number): number {
  return Math.min(CHAMBERS.length - 1, Math.floor(level / STEPS_PER_CHAMBER))
}

export default function PyramidClimb() {
  const navigate = useNavigate()
  const { t } = useLang()

  const [phase,    setPhase]    = useState<Phase>('playing')
  const [level,    setLevel]    = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [elapsed,  setElapsed]  = useState(0)
  const [pair,     setPair]     = useState(() => randomPair(tierForChamber(0)))
  const [roundKey, setRoundKey] = useState(0)

  const startedAtRef = useRef<number | null>(null)
  const chamberRef   = useRef(0)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  useEffect(() => {
    if (phase !== 'playing' || startedAtRef.current === null) return
    const startedAt = startedAtRef.current
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => clearInterval(id)
  }, [phase])

  const chamberIndex = chamberIndexFor(level)

  useEffect(() => {
    if (chamberIndex > chamberRef.current) playChimeSound()
    chamberRef.current = chamberIndex
  }, [chamberIndex])

  const handleAnswer = useCallback((correct: boolean) => {
    const next = Math.max(0, Math.min(TOTAL_STEPS, level + (correct ? 1 : -1)))
    setLevel(next)
    if (!correct) setMistakes(m => m + 1)
    if (next >= TOTAL_STEPS) {
      setPhase('finished')
    } else {
      setPair(randomPair(tierForChamber(chamberIndexFor(next))))
      setRoundKey(k => k + 1)
    }
  }, [level])

  function playAgain() {
    setLevel(0)
    setMistakes(0)
    setElapsed(0)
    setPair(randomPair(tierForChamber(0)))
    setRoundKey(k => k + 1)
    chamberRef.current = 0
    startedAtRef.current = Date.now()
    setPhase('playing')
  }

  if (phase === 'finished') {
    return (
      <div className="fractions-page">
        <TreasureCelebration
          mistakes={mistakes}
          seconds={elapsed}
          onPlayAgain={playAgain}
          onBack={() => navigate('/')}
        />
      </div>
    )
  }

  return (
    <div className="fractions-page">
      <div className="fractions-header">
        <button className="training-back-btn" onClick={() => navigate('/')}>← {t('trainingBack')}</button>
        <p className="exercise-counter">{t('pyrCounter', { level, total: TOTAL_STEPS })}</p>
        <ThemeToggle />
      </div>

      <PyramidScene level={level} chamberIndex={chamberIndex} />

      <DecimalDuel key={roundKey} pair={pair} onAnswer={handleAnswer} />
    </div>
  )
}
