import { useLang } from '../i18n/LangContext'
import type { Difficulty } from '../data/lostScroll'

interface Props {
  levelIndex:  number
  totalLevels: number
  difficulty:  Difficulty
}

const DIFF_LABEL_KEY = {
  easy:   'mazeDiffEasy',
  medium: 'mazeDiffMedium',
  hard:   'mazeDiffHard',
} as const satisfies Record<Difficulty, string>

export default function ScrollTemple({ levelIndex, totalLevels, difficulty }: Props) {
  const { t } = useLang()

  return (
    <div className="scr-scene">
      <div className="scr-sky">
        <span className="scr-decor scr-decor--sun" aria-hidden="true">☀️</span>
        <span className="scr-decor scr-decor--scroll-left" aria-hidden="true">📜</span>
        <span className="scr-decor scr-decor--scroll-right" aria-hidden="true">📜</span>
        <span className="scr-decor scr-decor--columns-left" aria-hidden="true">🏛️</span>
        <span className="scr-decor scr-decor--columns-right" aria-hidden="true">🏛️</span>
        <span className="scr-decor scr-decor--dust-1" aria-hidden="true">✨</span>
        <span className="scr-decor scr-decor--dust-2" aria-hidden="true">✨</span>
      </div>

      <div className="scr-progress-row">
        {Array.from({ length: totalLevels }, (_, i) => (
          <span
            key={i}
            className={`scr-tick${i < levelIndex ? ' scr-tick--lit' : ''}${i === levelIndex ? ' scr-tick--current' : ''}`}
          />
        ))}
      </div>

      <p className="pyr-chamber-label">
        <span aria-hidden="true">📜</span> {t(DIFF_LABEL_KEY[difficulty])}
      </p>
    </div>
  )
}
