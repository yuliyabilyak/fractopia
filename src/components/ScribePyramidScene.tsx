import { useLang } from '../i18n/LangContext'
import type { Keys } from '../i18n/translations'
import type { Level } from '../data/scribePyramid'

interface Props {
  stepIndex: number
  totalSteps: number
  level: Level
}

const LEVEL_LABEL_KEY: Record<Level, Keys> = {
  1: 'scribeLevelApprentice',
  2: 'scribeLevelRoyal',
  3: 'scribeLevelMaster',
  4: 'scribeLevelArchitect',
}

// Five stone tiers, bottom (widest) to top (capstone). Capacities sum to
// TOTAL_STEPS (12) so the pyramid finishes exactly as the session does.
const TIER_CAPACITIES = [3, 3, 2, 2, 2]

export default function ScribePyramidScene({ stepIndex, totalSteps, level }: Props) {
  const { t } = useLang()
  const progressPct = Math.min(100, Math.round((stepIndex / totalSteps) * 100))

  const tierFill = TIER_CAPACITIES.reduce<{ capacity: number; filled: number }[]>((acc, capacity) => {
    const cumulative = acc.reduce((sum, t) => sum + t.capacity, 0)
    const filled = Math.max(0, Math.min(capacity, stepIndex - cumulative))
    return [...acc, { capacity, filled }]
  }, [])

  return (
    <div className="scb-scene">
      <div className="scb-sky">
        <span className="scb-decor scb-decor--sun" aria-hidden="true">☀️</span>
        <span className="scb-decor scb-decor--palm-left" aria-hidden="true">🌴</span>
        <span className="scb-decor scb-decor--palm-right" aria-hidden="true">🌴</span>
        <span className="scb-decor scb-decor--scribe" aria-hidden="true">🧑‍💼</span>
      </div>

      <p className="pyr-chamber-label">
        <span aria-hidden="true">📜</span> {t(LEVEL_LABEL_KEY[level])}
      </p>

      <div className="scb-pyramid">
        {tierFill.slice().reverse().map((tier, reversedI) => {
          const tierIndex = tierFill.length - 1 - reversedI
          return (
            <div key={tierIndex} className={`scb-tier scb-tier--${tierIndex}`}>
              {Array.from({ length: tier.capacity }, (_, i) => (
                <span key={i} className={`scb-stone${i < tier.filled ? ' scb-stone--placed' : ''}`} aria-hidden="true" />
              ))}
            </div>
          )
        })}
        <div className="scb-builder" style={{ bottom: `${progressPct}%` }} aria-hidden="true">🧑‍🌾</div>
        {stepIndex >= totalSteps && <div className="scb-capstone-glow" aria-hidden="true">✨🔺✨</div>}
      </div>
    </div>
  )
}
