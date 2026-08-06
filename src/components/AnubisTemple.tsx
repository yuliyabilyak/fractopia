import { useLang } from '../i18n/LangContext'
import type { Difficulty } from '../data/anubisScales'

interface Props {
  levelIndex: number
  totalLevels: number
  difficulty: Difficulty
}

const DIFF_LABEL_KEY = {
  easy: 'mazeDiffEasy',
  medium: 'mazeDiffMedium',
  hard: 'mazeDiffHard',
} as const satisfies Record<Difficulty, string>

export default function AnubisTemple({ levelIndex, totalLevels, difficulty }: Props) {
  const { t } = useLang()

  return (
    <div className="anb-scene">
      <div className="anb-sky">
        <span className="anb-decor anb-decor--sun" aria-hidden="true">✨</span>
        <span className="anb-decor anb-decor--pillar-left" aria-hidden="true">🏛️</span>
        <span className="anb-decor anb-decor--pillar-right" aria-hidden="true">🏛️</span>
        <span className="anb-decor anb-decor--torch-left" aria-hidden="true">🔥</span>
        <span className="anb-decor anb-decor--torch-right" aria-hidden="true">🔥</span>
        <span className="anb-decor anb-decor--anubis" aria-hidden="true">🐺</span>
        <span className="anb-decor anb-decor--gem-left" aria-hidden="true">💎</span>
        <span className="anb-decor anb-decor--gem-right" aria-hidden="true">💎</span>
      </div>

      <div className="anb-progress-row">
        {Array.from({ length: totalLevels }, (_, i) => (
          <span
            key={i}
            className={`anb-tick${i < levelIndex ? ' anb-tick--lit' : ''}${i === levelIndex ? ' anb-tick--current' : ''}`}
          />
        ))}
      </div>

      <p className="pyr-chamber-label">
        <span aria-hidden="true">⚖️</span> {t(DIFF_LABEL_KEY[difficulty])}
      </p>
    </div>
  )
}
