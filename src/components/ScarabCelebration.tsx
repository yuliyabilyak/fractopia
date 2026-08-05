import { useLang } from '../i18n/LangContext'
import ConfettiBurst from './ConfettiBurst'

interface Props {
  xp:          number
  coins:       number
  hearts:      number
  bestCombo:   number
  mistakes:    number
  onPlayAgain: () => void
  onBack:      () => void
}

type BadgeKey =
  | 'scarabBadgeSeeker'
  | 'scarabBadgeSharpEye'
  | 'scarabBadgeFlawless'
  | 'scarabBadgeComboMaster'
  | 'scarabBadgeGuardian'

interface BadgeDef {
  key:    BadgeKey
  emoji:  string
  earned: (mistakes: number, bestCombo: number) => boolean
}

const BADGES: BadgeDef[] = [
  { key: 'scarabBadgeSeeker',      emoji: '🪲', earned: () => true },
  { key: 'scarabBadgeSharpEye',    emoji: '🔍', earned: m => m <= 4 },
  { key: 'scarabBadgeFlawless',    emoji: '💎', earned: m => m === 0 },
  { key: 'scarabBadgeComboMaster', emoji: '🔥', earned: (_, combo) => combo >= 3 },
  { key: 'scarabBadgeGuardian',    emoji: '👑', earned: (m, combo) => m <= 1 && combo >= 4 },
]

export default function ScarabCelebration({ xp, coins, hearts, bestCombo, mistakes, onPlayAgain, onBack }: Props) {
  const { t } = useLang()
  const earnedBadges = BADGES.filter(b => b.earned(mistakes, bestCombo))

  return (
    <div className="se-wrapper">
      <ConfettiBurst />
      <div className="sm-chest-open" aria-hidden="true">🗝️ 📦 → 🪲💰💎</div>
      <h2 className="se-done-title">{t('scarabTreasureFound')}</h2>

      <div className="dm-stats-grid">
        <div className="dm-stat">
          <p className="dm-stat-value">{xp}</p>
          <p className="dm-stat-label">{t('scarabXpEarnedLabel')}</p>
        </div>
        <div className="dm-stat">
          <p className="dm-stat-value">{coins}</p>
          <p className="dm-stat-label">{t('scarabCoinsEarnedLabel')}</p>
        </div>
        <div className="dm-stat">
          <p className="dm-stat-value">{hearts}</p>
          <p className="dm-stat-label">{t('scarabHeartsLeftLabel')}</p>
        </div>
        <div className="dm-stat">
          <p className="dm-stat-value">{bestCombo}</p>
          <p className="dm-stat-label">{t('scarabBestComboLabel')}</p>
        </div>
      </div>

      <div className="pyr-badges">
        {earnedBadges.map(b => (
          <div key={b.key} className="pyr-badge">
            <span className="pyr-badge-emoji" aria-hidden="true">{b.emoji}</span>
            <span className="pyr-badge-label">{t(b.key)}</span>
          </div>
        ))}
      </div>

      <button className="btn-start" onClick={onPlayAgain}>{t('playAgain')}</button>
      <button className="training-back-btn" onClick={onBack}>← {t('trainingBack')}</button>
    </div>
  )
}
