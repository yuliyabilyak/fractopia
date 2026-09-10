import { useLang } from '../i18n/LangContext'
import ConfettiBurst from './ConfettiBurst'
import { TOPPINGS } from '../data/pizzaTrade'

interface Props {
  ordersServed: number
  sessionLength: number
  bestStreak: number
  toppingsUnlockedThisSession: string[]
  totalToppingsUnlocked: number
  onPlayAgain: () => void
  onBack: () => void
}

export default function PizzaTradeCelebration({
  ordersServed,
  sessionLength,
  bestStreak,
  toppingsUnlockedThisSession,
  totalToppingsUnlocked,
  onPlayAgain,
  onBack,
}: Props) {
  const { t } = useLang()

  return (
    <div className="se-wrapper">
      <ConfettiBurst />
      <div className="pt-shop-close" aria-hidden="true">🍕🎉</div>
      <h2 className="se-done-title">{t('ptDoneTitle')}</h2>

      <div className="dm-stats-grid">
        <div className="dm-stat">
          <p className="dm-stat-value">{ordersServed}/{sessionLength}</p>
          <p className="dm-stat-label">{t('ptOrdersServedSummary')}</p>
        </div>
        <div className="dm-stat">
          <p className="dm-stat-value">{bestStreak}</p>
          <p className="dm-stat-label">{t('ptBestStreakLabel')}</p>
        </div>
        <div className="dm-stat">
          <p className="dm-stat-value">{totalToppingsUnlocked}/{TOPPINGS.length}</p>
          <p className="dm-stat-label">{t('ptToppingsThisSessionLabel')}</p>
        </div>
      </div>

      {toppingsUnlockedThisSession.length > 0 && (
        <div className="pt-topping-tray">
          {toppingsUnlockedThisSession.map(id => {
            const topping = TOPPINGS.find(x => x.id === id)
            if (!topping) return null
            return (
              <span key={id} className="pt-topping-btn pt-topping-btn--selected" aria-hidden="true">
                {topping.emoji}
              </span>
            )
          })}
        </div>
      )}

      <button className="btn-start" onClick={onPlayAgain}>{t('playAgain')}</button>
      <button className="training-back-btn" onClick={onBack}>← {t('trainingBack')}</button>
    </div>
  )
}
