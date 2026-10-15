import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TOPIC_PATH } from '../data/topics'
import { useLang } from '../i18n/LangContext'
import ThemeToggle from '../components/ThemeToggle'
import ScrollTemple from '../components/ScrollTemple'
import ScrollPuzzle from '../components/ScrollPuzzle'
import ScrollCelebration from '../components/ScrollCelebration'
import { LEVELS, TOTAL_LEVELS, STARTING_HEARTS, generatePuzzle, computeReward } from '../data/lostScroll'
import { playChimeSound } from '../utils/sounds'

type Phase = 'playing' | 'finished'

export default function LostScroll() {
  const navigate = useNavigate()
  const { t } = useLang()
  // A plain (non-ref) mutable Set: read once to seed state, then mutated in place —
  // never reassigned via setState, so it never needs to be read back during render.
  const [usedSignatures]      = useState(() => new Set<string>())
  const [phase,          setPhase]          = useState<Phase>('playing')
  const [levelIndex,     setLevelIndex]     = useState(0)
  const [puzzle,         setPuzzle]         = useState(() => generatePuzzle(LEVELS[0], usedSignatures))
  const [levelMistakes,  setLevelMistakes]  = useState(0)
  const [hearts,         setHearts]         = useState(STARTING_HEARTS)
  const [xp,             setXp]             = useState(0)
  const [coins,          setCoins]          = useState(0)
  const [comboStreak,    setComboStreak]    = useState(0)
  const [bestCombo,      setBestCombo]      = useState(0)
  const [totalMistakes,  setTotalMistakes]  = useState(0)

  function handleMistake() {
    setHearts(h => Math.max(0, h - 1))
    setLevelMistakes(m => m + 1)
    setTotalMistakes(m => m + 1)
  }

  function handleSolved() {
    const nextStreak = levelMistakes === 0 ? comboStreak + 1 : 0
    const reward = computeReward(LEVELS[levelIndex], levelMistakes, nextStreak)
    setXp(x => x + reward.xp)
    setCoins(c => c + reward.coins)
    setComboStreak(nextStreak)
    setBestCombo(b => Math.max(b, nextStreak))

    const nextLevel = levelIndex + 1
    if (nextLevel >= TOTAL_LEVELS) {
      setPhase('finished')
    } else {
      playChimeSound()
      setLevelIndex(nextLevel)
      setPuzzle(generatePuzzle(LEVELS[nextLevel], usedSignatures))
      setLevelMistakes(0)
    }
  }

  function playAgain() {
    usedSignatures.clear()
    setPhase('playing')
    setLevelIndex(0)
    setPuzzle(generatePuzzle(LEVELS[0], usedSignatures))
    setLevelMistakes(0)
    setHearts(STARTING_HEARTS)
    setXp(0)
    setCoins(0)
    setComboStreak(0)
    setBestCombo(0)
    setTotalMistakes(0)
  }

  if (phase === 'finished') {
    return (
      <div className="fractions-page">
        <ScrollCelebration
          xp={xp}
          coins={coins}
          hearts={hearts}
          bestCombo={bestCombo}
          mistakes={totalMistakes}
          onPlayAgain={playAgain}
          onBack={() => navigate(TOPIC_PATH.fractions)}
        />
      </div>
    )
  }

  return (
    <div className="fractions-page">
      <div className="fractions-header">
        <button className="training-back-btn" onClick={() => navigate(TOPIC_PATH.fractions)}>← {t('trainingBack')}</button>
        <p className="exercise-counter">{t('scarabCounter', { level: levelIndex + 1, total: TOTAL_LEVELS })}</p>
        <ThemeToggle />
      </div>

      <div className="game-hud">
        <span className="game-hud-chip game-hud-hearts" aria-label={t('scarabHeartsLabel')}>
          {Array.from({ length: STARTING_HEARTS }, (_, i) => (i < hearts ? '❤️' : '🤍')).join('')}
        </span>
        <span className="game-hud-chip">
          <span className="game-hud-icon" aria-hidden="true">✨</span>{xp} {t('scarabXpLabel')}
        </span>
        <span className="game-hud-chip">
          <span className="game-hud-icon" aria-hidden="true">🪙</span>{coins} {t('scarabCoinsLabel')}
        </span>
        {comboStreak > 0 && (
          <span className="game-hud-chip">
            <span className="game-hud-icon" aria-hidden="true">🔥</span>{t('scarabComboLabel')} x{comboStreak}
          </span>
        )}
      </div>

      <ScrollTemple levelIndex={levelIndex} totalLevels={TOTAL_LEVELS} difficulty={LEVELS[levelIndex]} />

      <ScrollPuzzle key={levelIndex} puzzle={puzzle} onMistake={handleMistake} onSolved={handleSolved} />
    </div>
  )
}
