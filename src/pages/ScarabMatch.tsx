import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TOPIC_PATH } from '../data/topics'
import { useLang } from '../i18n/LangContext'
import ThemeToggle from '../components/ThemeToggle'
import ScarabTemple from '../components/ScarabTemple'
import ScarabBoard from '../components/ScarabBoard'
import ScarabCelebration from '../components/ScarabCelebration'
import { LEVELS, TOTAL_LEVELS, STARTING_HEARTS, generateRound, computeReward } from '../data/scarabMatch'
import { playChimeSound } from '../utils/sounds'

type Phase = 'playing' | 'finished'

export default function ScarabMatch() {
  const navigate = useNavigate()
  const { t } = useLang()

  const [phase,        setPhase]        = useState<Phase>('playing')
  const [levelIndex,   setLevelIndex]   = useState(0)
  const [round,        setRound]        = useState(() => generateRound(LEVELS[0]))
  const [hearts,       setHearts]       = useState(STARTING_HEARTS)
  const [xp,           setXp]           = useState(0)
  const [coins,        setCoins]        = useState(0)
  const [comboStreak,  setComboStreak]  = useState(0)
  const [bestCombo,    setBestCombo]    = useState(0)
  const [totalMistakes, setTotalMistakes] = useState(0)

  function handleMistake() {
    setHearts(h => Math.max(0, h - 1))
    setTotalMistakes(m => m + 1)
  }

  function handleRoundComplete(mistakes: number) {
    const nextStreak = mistakes === 0 ? comboStreak + 1 : 0
    const reward = computeReward(LEVELS[levelIndex].difficulty, mistakes, nextStreak)
    setXp(x => x + reward.xp)
    setCoins(c => c + reward.coins)
    setComboStreak(nextStreak)
    setBestCombo(b => Math.max(b, nextStreak))

    const next = levelIndex + 1
    if (next >= TOTAL_LEVELS) {
      setPhase('finished')
    } else {
      playChimeSound()
      setLevelIndex(next)
      setRound(generateRound(LEVELS[next]))
    }
  }

  function playAgain() {
    setPhase('playing')
    setLevelIndex(0)
    setRound(generateRound(LEVELS[0]))
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
        <ScarabCelebration
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

      <ScarabTemple levelIndex={levelIndex} totalLevels={TOTAL_LEVELS} />

      <ScarabBoard
        key={levelIndex}
        target={round.target}
        options={round.options}
        onMistake={handleMistake}
        onComplete={handleRoundComplete}
      />
    </div>
  )
}
