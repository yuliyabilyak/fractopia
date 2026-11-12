import { BATTERY_SIZE, batteryCharge } from '../../data/numberWorkshop'
import { useLang } from '../../i18n/LangContext'

/** Consecutive correct answers charge the battery; a full one gilds a part. */
export default function StreakBattery({ streak }: { streak: number }) {
  const { t } = useLang()
  const charge = batteryCharge(streak)
  return (
    <span
      className={`ws-battery${charge === BATTERY_SIZE ? ' ws-battery--full' : ''}`}
      role="img"
      aria-label={t('wsBatteryLabel', { n: charge, total: BATTERY_SIZE })}
    >
      <span className="ws-battery-icon" aria-hidden="true">🔋</span>
      <span className="ws-battery-body" aria-hidden="true">
        {Array.from({ length: BATTERY_SIZE }, (_, i) => (
          <span key={i} className={`ws-battery-cell${i < charge ? ' ws-battery-cell--on' : ''}`} />
        ))}
      </span>
    </span>
  )
}
