import { useEffect, useRef } from 'react'
import { useLang } from '../i18n/LangContext'
import type { Divisor, LevelId } from '../data/numberDetective'
import { LEVEL_NAME_KEY } from '../hooks/useDetectiveText'

interface Props {
  /** null for a practice round */
  level: LevelId | null
  solved: number
  firstTry: number
  cluesEarned: number
  newLevel: LevelId | null
  allLevelsDone: boolean
  practiceRules: Divisor[]
  onNextLevel: (() => void) | null
  onReplay: () => void
  onPractice: () => void
  onLevels: () => void
}

/** End of a level: a calm badge and a few numbers — no ranks, no timers. */
export default function DetectiveCaseClosed({
  level, solved, firstTry, cluesEarned, newLevel, allLevelsDone, practiceRules,
  onNextLevel, onReplay, onPractice, onLevels,
}: Props) {
  const { t } = useLang()
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => { titleRef.current?.focus() }, [])

  return (
    <div className="se-wrapper">
      <div className="nd-badge" aria-hidden="true">🕵️</div>
      <h2 className="se-done-title" tabIndex={-1} ref={titleRef}>{t('ndCaseClosed')}</h2>
      <p className="nd-intro">
        {level !== null ? t('ndLevelDone', { n: level, name: t(LEVEL_NAME_KEY[level]) }) : t('ndPracticeDone')}
      </p>

      <div className="dm-stats-grid">
        <div className="dm-stat">
          <p className="dm-stat-value">{solved}</p>
          <p className="dm-stat-label">{t('ndCasesSolved')}</p>
        </div>
        <div className="dm-stat">
          <p className="dm-stat-value">{firstTry}</p>
          <p className="dm-stat-label">{t('ndFirstTry')}</p>
        </div>
        <div className="dm-stat">
          <p className="dm-stat-value">{cluesEarned}</p>
          <p className="dm-stat-label">{t('ndCluesEarned')}</p>
        </div>
      </div>

      {newLevel !== null && (
        <div className="pyr-badges">
          <div className="pyr-badge">
            <span className="pyr-badge-emoji" aria-hidden="true">🔓</span>
            <span className="pyr-badge-label">{t('ndNewLevel', { name: t(LEVEL_NAME_KEY[newLevel]) })}</span>
          </div>
        </div>
      )}
      {allLevelsDone && <p className="nd-intro"><span aria-hidden="true">🏅</span> {t('ndMasterMsg')}</p>}

      {practiceRules.length > 0 && <p className="nd-intro">{t('ndPracticeTip', { rules: practiceRules.join(', ') })}</p>}

      <div className="nd-end-actions">
        {onNextLevel && <button type="button" className="btn-start" onClick={onNextLevel}>{t('ndNextLevelBtn')} <span aria-hidden="true">→</span></button>}
        {practiceRules.length > 0 && (
          <button type="button" className="nd-hint-btn" onClick={onPractice}>
            <span aria-hidden="true">🔁</span> {t('ndPracticeBtn')}
          </button>
        )}
        <button type="button" className="nd-hint-btn" onClick={onReplay}>{t('playAgain')}</button>
        <button type="button" className="training-back-btn" onClick={onLevels}>← {t('ndAllLevels')}</button>
      </div>
    </div>
  )
}
