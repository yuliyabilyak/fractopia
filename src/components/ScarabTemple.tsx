import { useLang } from '../i18n/LangContext'
import { LEVELS, type Difficulty } from '../data/scarabMatch'

interface Props {
  levelIndex: number
  totalLevels: number
}

const DIFF_LABEL_KEY = {
  easy:   'mazeDiffEasy',
  medium: 'mazeDiffMedium',
  hard:   'mazeDiffHard',
} as const satisfies Record<Difficulty, string>

export default function ScarabTemple({ levelIndex, totalLevels }: Props) {
  const { t } = useLang()
  const difficulty = LEVELS[levelIndex].difficulty

  return (
    <div className="sm-scene">
      <div className="sm-sky">
        <span className="sm-decor sm-decor--sun" aria-hidden="true">☀️</span>
        <span className="sm-decor sm-decor--scroll" aria-hidden="true">📜</span>
        <span className="sm-decor sm-decor--columns-left" aria-hidden="true">🏛️</span>
        <span className="sm-decor sm-decor--columns-right" aria-hidden="true">🏛️</span>
        <span className="sm-decor sm-decor--eye" aria-hidden="true">👁️</span>
        <span className="sm-decor sm-decor--bug1" aria-hidden="true">🪲</span>
        <span className="sm-decor sm-decor--bug2" aria-hidden="true">🪲</span>
      </div>

      <div className="sm-dunes" aria-hidden="true" />

      <div className="sm-progress-row">
        {Array.from({ length: totalLevels }, (_, i) => (
          <span
            key={i}
            className={`sm-tick${i < levelIndex ? ' sm-tick--lit' : ''}${i === levelIndex ? ' sm-tick--current' : ''}`}
          />
        ))}
      </div>

      <p className="pyr-chamber-label">
        <span aria-hidden="true">🪲</span> {t(DIFF_LABEL_KEY[difficulty])}
      </p>
    </div>
  )
}
