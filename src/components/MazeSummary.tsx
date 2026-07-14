import { useLang } from '../i18n/LangContext'
import ConfettiBurst from './ConfettiBurst'

interface Props {
  stars:       number
  total:       number
  mistakes:    number
  seconds:     number
  onPlayAgain: () => void
  onBack:      () => void
}

function fmtTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function MazeSummary({ stars, total, mistakes, seconds, onPlayAgain, onBack }: Props) {
  const { t } = useLang()
  const accuracy = total > 0 ? Math.round((stars / total) * 100) : 0
  const perfect = mistakes === 0

  return (
    <div className="se-wrapper dm-summary">
      <ConfettiBurst />
      <h2 className="se-done-title">{perfect ? `🏆 ${t('mazeDoneTitle')}` : t('mazeDoneTitle')}</h2>

      <div className="se-score-box">
        <p className="se-pts">⭐ {stars}/{total}</p>
        <p className="se-pts-label">{t('mazeStarsLabel')}</p>
      </div>

      <div className="dm-stats-grid">
        <div className="dm-stat">
          <p className="dm-stat-value">{mistakes}</p>
          <p className="dm-stat-label">{t('mazeMistakesLabel')}</p>
        </div>
        <div className="dm-stat">
          <p className="dm-stat-value">{accuracy}%</p>
          <p className="dm-stat-label">{t('mazeAccuracyLabel')}</p>
        </div>
        <div className="dm-stat">
          <p className="dm-stat-value">{fmtTime(seconds)}</p>
          <p className="dm-stat-label">{t('mazeTimeLabel')}</p>
        </div>
      </div>

      <button className="btn-start" onClick={onPlayAgain}>{t('playAgain')}</button>
      <button className="training-back-btn" onClick={onBack}>← {t('trainingBack')}</button>
    </div>
  )
}
