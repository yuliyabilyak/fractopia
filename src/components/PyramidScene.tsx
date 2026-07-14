import { useLang } from '../i18n/LangContext'
import { CHAMBERS, STEPS_PER_CHAMBER, TOTAL_STEPS } from '../data/pyramidClimb'

interface Props {
  level:        number
  chamberIndex: number
}

const CHAMBER_NAME_KEY = {
  entrance:     'pyrChamberEntrance',
  columns:      'pyrChamberColumns',
  hieroglyphs:  'pyrChamberHieroglyphs',
  anubisGate:   'pyrChamberAnubisGate',
  treasureRoom: 'pyrChamberTreasureRoom',
} as const

export default function PyramidScene({ level, chamberIndex }: Props) {
  const { t } = useLang()
  const chamber = CHAMBERS[chamberIndex]
  const progressPct = Math.min(100, Math.round((level / TOTAL_STEPS) * 100))

  return (
    <div className="pyr-scene">
      <div className="pyr-sky">
        <span className="pyr-sun" aria-hidden="true">☀️</span>
        <span className="pyr-palm pyr-palm--left" aria-hidden="true">🌴</span>
        <span className="pyr-palm pyr-palm--right" aria-hidden="true">🌴</span>
        <span className="pyr-torch pyr-torch--left" aria-hidden="true">🔥</span>
        <span className="pyr-torch pyr-torch--right" aria-hidden="true">🔥</span>
        <span className="pyr-statue pyr-statue--left" aria-hidden="true">🐺</span>
        <span className="pyr-statue pyr-statue--right" aria-hidden="true">🦅</span>
        <span className="pyr-scarab pyr-scarab--1" aria-hidden="true">🪲</span>
        <span className="pyr-scarab pyr-scarab--2" aria-hidden="true">🪲</span>
      </div>

      <div className="pyr-dunes" aria-hidden="true" />

      <p className="pyr-chamber-label">
        <span aria-hidden="true">{chamber.emoji}</span> {t(CHAMBER_NAME_KEY[chamber.key])}
      </p>

      <div className="pyr-structure">
        {CHAMBERS.map((c, tierIndex) => {
          const reversedIndex = CHAMBERS.length - 1 - tierIndex
          const tierBaseLevel = reversedIndex * STEPS_PER_CHAMBER
          return (
            <div key={c.key} className={`pyr-tier pyr-tier--${reversedIndex}`}>
              <div className="pyr-tier-ticks">
                {Array.from({ length: STEPS_PER_CHAMBER }, (_, i) => (
                  <span
                    key={i}
                    className={`pyr-tick${level > tierBaseLevel + i ? ' pyr-tick--lit' : ''}`}
                  />
                ))}
              </div>
            </div>
          )
        })}

        <div className="pyr-explorer" style={{ bottom: `${progressPct}%` }} aria-hidden="true">
          🧑‍🎓
        </div>

        {level >= TOTAL_STEPS && (
          <div className="pyr-chest" aria-hidden="true">🗝️📦</div>
        )}
      </div>
    </div>
  )
}
