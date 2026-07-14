import { useLang } from '../i18n/LangContext'
import ConfettiBurst from './ConfettiBurst'

interface Props {
  mistakes:    number
  seconds:     number
  onPlayAgain: () => void
  onBack:      () => void
}

interface BadgeDef {
  key:   string
  emoji: string
  earned: (mistakes: number, seconds: number) => boolean
}

const BADGES: BadgeDef[] = [
  { key: 'pyrBadgeTombExplorer',    emoji: '🏺', earned: () => true },
  { key: 'pyrBadgeScarabCollector', emoji: '🪲', earned: m => m <= 5 },
  { key: 'pyrBadgeMasterOfDecimals', emoji: '💎', earned: m => m === 0 },
  { key: 'pyrBadgeGuardian',        emoji: '⚱️', earned: (_, s) => s <= 90 },
  { key: 'pyrBadgeChampion',        emoji: '👑', earned: (m, s) => m === 0 && s <= 90 },
]

function fmtTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function TreasureCelebration({ mistakes, seconds, onPlayAgain, onBack }: Props) {
  const { t } = useLang()
  const earnedBadges = BADGES.filter(b => b.earned(mistakes, seconds))

  return (
    <div className="se-wrapper pyr-celebration">
      <ConfettiBurst />
      <div className="pyr-chest-open" aria-hidden="true">🗝️ 📦 → 💰💎👑</div>
      <h2 className="se-done-title">{t('pyrTreasureFound')}</h2>

      <div className="dm-stats-grid">
        <div className="dm-stat">
          <p className="dm-stat-value">{mistakes}</p>
          <p className="dm-stat-label">{t('pyrSlipsLabel')}</p>
        </div>
        <div className="dm-stat">
          <p className="dm-stat-value">{fmtTime(seconds)}</p>
          <p className="dm-stat-label">{t('mazeTimeLabel')}</p>
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
