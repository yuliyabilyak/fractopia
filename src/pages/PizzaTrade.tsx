import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'
import { useAuth } from '../hooks/useAuth'
import { usePizzaTradeProgress } from '../hooks/usePizzaTradeProgress'
import ThemeToggle from '../components/ThemeToggle'
import PizzaTradeShop from '../components/PizzaTradeShop'
import PizzaTradeOrder from '../components/PizzaTradeOrder'
import PizzaTradeCelebration from '../components/PizzaTradeCelebration'
import {
  generateOrder, SESSION_LENGTH, CORRECT_PER_TOPPING_UNLOCK, LEVEL_UP_STREAK, TOPPINGS,
  type Level, type PizzaOrder,
} from '../data/pizzaTrade'
import { playChimeSound } from '../utils/sounds'

type Phase = 'playing' | 'finished'

export default function PizzaTrade() {
  const navigate = useNavigate()
  const { t } = useLang()
  const { user, loading: authLoading, loginAnonymously } = useAuth()
  const {
    unlockedToppings, highStreak, correctTowardNextTopping,
    loading: progressLoading, saveProgress,
  } = usePizzaTradeProgress(user?.uid)

  useEffect(() => {
    if (!authLoading && !user) loginAnonymously()
  }, [authLoading, user, loginAnonymously])

  const [phase, setPhase] = useState<Phase>('playing')
  const [orderIndex, setOrderIndex] = useState(0)
  const [level, setLevel] = useState<Level>(1)
  const [order, setOrder] = useState<PizzaOrder>(() => generateOrder(1))
  const [comboStreak, setComboStreak] = useState(0)
  const [ordersServed, setOrdersServed] = useState(0)
  const [bestStreakThisSession, setBestStreakThisSession] = useState(0)
  const [toppingsUnlockedThisSession, setToppingsUnlockedThisSession] = useState<string[]>([])
  const [equippedToppingId, setEquippedToppingId] = useState(() => unlockedToppings[unlockedToppings.length - 1] ?? TOPPINGS[0].id)

  if (authLoading || progressLoading) return <div className="center-page">Loading…</div>

  const equippedTopping = TOPPINGS.find(x => x.id === equippedToppingId) ?? TOPPINGS[0]

  function handleOrderComplete(correct: boolean) {
    setOrdersServed(n => n + 1)
    let nextLevel = level

    if (correct) {
      const newStreak = comboStreak + 1
      setComboStreak(newStreak)
      setBestStreakThisSession(b => Math.max(b, newStreak))
      if (newStreak % LEVEL_UP_STREAK === 0 && level < 4) {
        playChimeSound()
        nextLevel = Math.min(4, level + 1) as Level
        setLevel(nextLevel)
      }

      const patch: { highStreak?: number; unlockedToppings?: string[]; correctTowardNextTopping?: number } = {}
      if (newStreak > highStreak) patch.highStreak = newStreak

      const nextCount = correctTowardNextTopping + 1
      if (nextCount >= CORRECT_PER_TOPPING_UNLOCK && unlockedToppings.length < TOPPINGS.length) {
        const newTopping = TOPPINGS[unlockedToppings.length]
        patch.unlockedToppings = [...unlockedToppings, newTopping.id]
        patch.correctTowardNextTopping = 0
        setToppingsUnlockedThisSession(prev => [...prev, newTopping.id])
        setEquippedToppingId(newTopping.id)
      } else {
        patch.correctTowardNextTopping = nextCount
      }
      saveProgress(patch)
    } else {
      setComboStreak(0)
    }

    const nextIndex = orderIndex + 1
    if (nextIndex >= SESSION_LENGTH) {
      setPhase('finished')
    } else {
      setOrderIndex(nextIndex)
      setOrder(generateOrder(nextLevel))
    }
  }

  function playAgain() {
    setPhase('playing')
    setOrderIndex(0)
    setLevel(1)
    setOrder(generateOrder(1))
    setComboStreak(0)
    setOrdersServed(0)
    setBestStreakThisSession(0)
    setToppingsUnlockedThisSession([])
  }

  if (phase === 'finished') {
    return (
      <div className="fractions-page">
        <PizzaTradeCelebration
          ordersServed={ordersServed}
          sessionLength={SESSION_LENGTH}
          bestStreak={Math.max(bestStreakThisSession, highStreak)}
          toppingsUnlockedThisSession={toppingsUnlockedThisSession}
          totalToppingsUnlocked={unlockedToppings.length}
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
        <p className="exercise-counter">{t('ptCounter', { i: orderIndex + 1, total: SESSION_LENGTH })}</p>
        <ThemeToggle />
      </div>

      <div className="game-hud">
        <span className="game-hud-chip">
          <span className="game-hud-icon" aria-hidden="true">🔥</span>{comboStreak}
        </span>
        <span className="game-hud-chip">
          <span className="game-hud-icon" aria-hidden="true">🍕</span>{t('ptToppingsLabel', { n: unlockedToppings.length, total: TOPPINGS.length })}
        </span>
      </div>

      {unlockedToppings.length > 1 && (
        <>
          <p className="training-pick">{t('ptToppingTrayHint')}</p>
          <div className="pt-topping-tray">
            {TOPPINGS.map(topping => {
              const isUnlocked = unlockedToppings.includes(topping.id)
              return (
                <button
                  key={topping.id}
                  type="button"
                  className={`pt-topping-btn${isUnlocked ? '' : ' pt-topping-btn--locked'}${equippedToppingId === topping.id ? ' pt-topping-btn--selected' : ''}`}
                  disabled={!isUnlocked}
                  onClick={() => setEquippedToppingId(topping.id)}
                  aria-label={isUnlocked ? t(topping.labelKey) : t('ptToppingLocked')}
                >
                  {isUnlocked ? topping.emoji : '🔒'}
                </button>
              )
            })}
          </div>
        </>
      )}

      <PizzaTradeShop level={level} streak={comboStreak} />

      <PizzaTradeOrder
        key={orderIndex}
        order={order}
        toppingEmoji={equippedTopping.emoji}
        onComplete={handleOrderComplete}
      />
    </div>
  )
}
