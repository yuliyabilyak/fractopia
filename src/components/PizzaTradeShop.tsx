import { useLang } from '../i18n/LangContext'
import { MAX_LEVEL, type Level } from '../data/pizzaTrade'

interface Props {
  level: Level
  streak: number
}

export default function PizzaTradeShop({ level, streak }: Props) {
  const { t } = useLang()

  return (
    <div className="pt-shop-scene">
      <div className="pt-shop-sky">
        <span className="pt-shop-decor pt-shop-decor--awning" aria-hidden="true">🍕</span>
        <span className="pt-shop-decor pt-shop-decor--chef" aria-hidden="true">👨‍🍳</span>
        <span className="pt-shop-decor pt-shop-decor--oven" aria-hidden="true">🔥</span>
      </div>

      <div className="pt-progress-row">
        {Array.from({ length: MAX_LEVEL }, (_, i) => (
          <span
            key={i}
            className={`pt-tick${i < level - 1 ? ' pt-tick--lit' : ''}${i === level - 1 ? ' pt-tick--current' : ''}`}
          />
        ))}
      </div>

      {streak > 0 && (
        <div className="pt-streak-bar" aria-label={t('ptStreakLabel', { n: streak })}>
          {Array.from({ length: Math.min(streak, 10) }, (_, i) => (
            <span key={i} className="pt-streak-flame" aria-hidden="true">🔥</span>
          ))}
        </div>
      )}
    </div>
  )
}
