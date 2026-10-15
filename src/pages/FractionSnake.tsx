import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TOPIC_PATH } from '../data/topics'
import { useLang } from '../i18n/LangContext'
import ThemeToggle from '../components/ThemeToggle'
import SnakeTemple from '../components/SnakeTemple'
import SnakeJunction from '../components/SnakeJunction'
import SnakeCelebration from '../components/SnakeCelebration'
import { LEVELS, TOTAL_LEVELS, STARTING_HEARTS, generateLevel, computeReward } from '../data/fractionSnake'
import { playChimeSound } from '../utils/sounds'

type Phase = 'playing' | 'finished'

export default function FractionSnake() {
  const navigate = useNavigate()
  const { t } = useLang()

  const [phase,          setPhase]          = useState<Phase>('playing')
  const [levelIndex,     setLevelIndex]     = useState(0)
  const [level,          setLevel]          = useState(() => generateLevel(LEVELS[0]))
  const [junctionIndex,  setJunctionIndex]  = useState(0)
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

  function handleAdvance() {
    const nextJunction = junctionIndex + 1
    if (nextJunction < level.junctions.length) {
      setJunctionIndex(nextJunction)
      return
    }

    const nextStreak = levelMistakes === 0 ? comboStreak + 1 : 0
    const reward = computeReward(LEVELS[levelIndex].difficulty, levelMistakes, nextStreak)
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
      setLevel(generateLevel(LEVELS[nextLevel]))
      setJunctionIndex(0)
      setLevelMistakes(0)
    }
  }

  function playAgain() {
    setPhase('playing')
    setLevelIndex(0)
    setLevel(generateLevel(LEVELS[0]))
    setJunctionIndex(0)
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
        <SnakeCelebration
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

  const { target, junctions } = level

  return (
    <div className="fractions-page">
      <div className="fractions-header">
        <button className="training-back-btn" onClick={() => navigate(TOPIC_PATH.fractions)}>← {t('trainingBack')}</button>
        <p className="exercise-counter">{t('snakeCounter', { level: levelIndex + 1, total: TOTAL_LEVELS })}</p>
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

      <SnakeTemple
        levelIndex={levelIndex}
        totalLevels={TOTAL_LEVELS}
        junctionIndex={junctionIndex}
        numJunctions={junctions.length}
      />

      <div className="exercise-card sn-board">
        <p className="exercise-prompt">{t('snakePrompt')}</p>

        <div className="frac-target-frame">
          <span className="frac-target-label">{t('scarabTargetLabel')}</span>
          <span className="frac-display frac-display--large">
            <span className="frac-n">{target.numerator}</span>
            <span className="frac-bar-line" />
            <span className="frac-d">{target.denominator}</span>
          </span>
        </div>

        <p className="frac-progress-label">
          {t('snakeJunctionLabel', { i: junctionIndex + 1, total: junctions.length })}
        </p>

        <SnakeJunction
          key={junctionIndex}
          choices={junctions[junctionIndex]}
          isFinalJunction={junctionIndex === junctions.length - 1}
          onMistake={handleMistake}
          onAdvance={handleAdvance}
        />
      </div>
    </div>
  )
}
