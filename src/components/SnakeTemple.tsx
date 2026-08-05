import { useLang } from '../i18n/LangContext'
import { LEVELS, type Difficulty } from '../data/fractionSnake'

interface Props {
  levelIndex:    number
  totalLevels:   number
  junctionIndex: number
  numJunctions:  number
}

const DIFF_LABEL_KEY = {
  easy:   'mazeDiffEasy',
  medium: 'mazeDiffMedium',
  hard:   'mazeDiffHard',
} as const satisfies Record<Difficulty, string>

export default function SnakeTemple({ levelIndex, totalLevels, junctionIndex, numJunctions }: Props) {
  const { t } = useLang()
  const difficulty = LEVELS[levelIndex].difficulty
  const trailPct = Math.min(100, Math.round((junctionIndex / numJunctions) * 100))

  return (
    <div className="sn-scene">
      <div className="sn-sky">
        <span className="sn-decor sn-decor--sun" aria-hidden="true">☀️</span>
        <span className="sn-decor sn-decor--scroll" aria-hidden="true">📜</span>
        <span className="sn-decor sn-decor--columns-left" aria-hidden="true">🏛️</span>
        <span className="sn-decor sn-decor--columns-right" aria-hidden="true">🏛️</span>
        <span className="sn-decor sn-decor--torch-left" aria-hidden="true">🔥</span>
        <span className="sn-decor sn-decor--torch-right" aria-hidden="true">🔥</span>
      </div>

      <div className="sn-corridor">
        <div className="sn-corridor-track" aria-hidden="true" />
        <span className="sn-snake" style={{ left: `${trailPct}%` }} aria-hidden="true">🐍</span>
        <span className="sn-chest" aria-hidden="true">🗝️📦</span>
      </div>

      <div className="sn-progress-row">
        {Array.from({ length: totalLevels }, (_, i) => (
          <span
            key={i}
            className={`sn-tick${i < levelIndex ? ' sn-tick--lit' : ''}${i === levelIndex ? ' sn-tick--current' : ''}`}
          />
        ))}
      </div>

      <p className="pyr-chamber-label">
        <span aria-hidden="true">🐍</span> {t(DIFF_LABEL_KEY[difficulty])}
      </p>
    </div>
  )
}
