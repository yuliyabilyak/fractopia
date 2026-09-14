import { useLang } from '../i18n/LangContext'
import ConfettiBurst from './ConfettiBurst'

interface Props {
  scarabs: number
  stonesPlaced: number
  totalStones: number
  mistakes: number
  onPlayAgain: () => void
  onBack: () => void
}

type RankKey = 'scribeRankApprentice' | 'scribeRankRoyal' | 'scribeRankMaster' | 'scribeRankArchitect'

interface RankDef {
  key: RankKey
  emoji: string
  earned: (mistakes: number) => boolean
}

// Checked from most to least impressive — the first one whose condition
// holds is the player's final rank.
const RANKS: RankDef[] = [
  { key: 'scribeRankArchitect', emoji: '👑', earned: m => m === 0 },
  { key: 'scribeRankMaster',    emoji: '💎', earned: m => m <= 2 },
  { key: 'scribeRankRoyal',     emoji: '🏺', earned: m => m <= 5 },
  { key: 'scribeRankApprentice', emoji: '📜', earned: () => true },
]

export default function ScribePyramidCelebration({ scarabs, stonesPlaced, totalStones, mistakes, onPlayAgain, onBack }: Props) {
  const { t } = useLang()
  const rank = RANKS.find(r => r.earned(mistakes)) ?? RANKS[RANKS.length - 1]

  return (
    <div className="se-wrapper">
      <ConfettiBurst />
      <div className="scb-capstone-glow" aria-hidden="true">✨🔺✨</div>
      <h2 className="se-done-title">{t('scribeDoneTitle')}</h2>

      <div className="dm-stats-grid">
        <div className="dm-stat">
          <p className="dm-stat-value">{scarabs}</p>
          <p className="dm-stat-label">{t('scribeScarabsLabel')}</p>
        </div>
        <div className="dm-stat">
          <p className="dm-stat-value">{stonesPlaced}/{totalStones}</p>
          <p className="dm-stat-label">{t('scribeStonesLabel')}</p>
        </div>
        <div className="dm-stat">
          <p className="dm-stat-value">{mistakes}</p>
          <p className="dm-stat-label">{t('scribeMistakesLabel')}</p>
        </div>
      </div>

      <div className="pyr-badges">
        <div className="pyr-badge">
          <span className="pyr-badge-emoji" aria-hidden="true">{rank.emoji}</span>
          <span className="pyr-badge-label">{t(rank.key)}</span>
        </div>
      </div>

      <button className="btn-start" onClick={onPlayAgain}>{t('playAgain')}</button>
      <button className="training-back-btn" onClick={onBack}>← {t('trainingBack')}</button>
    </div>
  )
}
