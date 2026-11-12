import { STARS_PER_PART } from '../../data/numberWorkshop'
import { useLang } from '../../i18n/LangContext'

/** Stars toward the next robot part. */
export default function StarMeter({ stars }: { stars: number }) {
  const { t } = useLang()
  return (
    <span className="ws-star-meter" role="img" aria-label={t('wsStarsLabel', { n: stars, total: STARS_PER_PART })}>
      {Array.from({ length: STARS_PER_PART }, (_, i) => (
        <span key={i} className={`ws-star${i < stars ? ' ws-star--on' : ''}`} aria-hidden="true">★</span>
      ))}
    </span>
  )
}
