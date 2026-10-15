import { useLang } from '../i18n/LangContext'
import { LEVEL_NAME_KEY } from '../hooks/useDetectiveText'
import type { Keys } from '../i18n/translations'
import {
  DIVISORS, LEVELS, ruleStanding, rulesNeedingPractice, unlockedLevel,
  type Divisor, type LevelId, type RuleStanding, type RuleStats,
} from '../data/numberDetective'

interface Props {
  completedLevels: LevelId[]
  clues: number
  ruleStats: RuleStats
  onPlay: (level: LevelId) => void
  onPractice: (rules: Divisor[]) => void
}

const LEVEL_DESC_KEY: Record<LevelId, Keys> = {
  1: 'ndLevel1Desc', 2: 'ndLevel2Desc', 3: 'ndLevel3Desc', 4: 'ndLevel4Desc', 5: 'ndLevel5Desc',
}

const STANDING: Record<RuleStanding, { icon: string; key: Keys }> = {
  new:      { icon: '○', key: 'ndStandingNew' },
  practise: { icon: '🔁', key: 'ndStandingPractise' },
  good:     { icon: '⭐', key: 'ndStandingGood' },
}

export default function DetectiveLevelSelect({ completedLevels, clues, ruleStats, onPlay, onPractice }: Props) {
  const { t } = useLang()
  const unlocked = unlockedLevel(completedLevels)
  const practiceRules = rulesNeedingPractice(ruleStats)

  return (
    <>
      <h1 className="nd-title"><span aria-hidden="true">🔍</span> {t('ndTitle')}</h1>
      <p className="nd-intro">{t('ndIntro')}</p>

      <div className="game-hud">
        <span className="game-hud-chip">
          <span className="game-hud-icon" aria-hidden="true">🔍</span>{t('ndCluesLabel')}: {clues}
        </span>
      </div>

      <h2 className="nd-section-title">{t('ndLevelsTitle')}</h2>
      <ul className="nd-level-list">
        {LEVELS.map(level => {
          const done = completedLevels.includes(level)
          const locked = level > unlocked
          const status = done
            ? { icon: '✓', label: t('ndStatusDone') }
            : locked ? { icon: '🔒', label: t('ndStatusLocked') } : { icon: '▶', label: t('ndStatusPlay') }
          return (
            <li key={level}>
              <button
                type="button"
                className={`nd-level-card${locked ? ' nd-level-card--locked' : ''}${done ? ' nd-level-card--done' : ''}`}
                disabled={locked}
                onClick={() => onPlay(level)}
              >
                <span className="nd-level-num" aria-hidden="true">{level}</span>
                <span className="nd-level-text">
                  <span className="nd-level-name">{t('ndLevelLabel', { n: level })}: {t(LEVEL_NAME_KEY[level])}</span>
                  <span className="nd-level-desc">
                    {locked ? t('ndLockedHint', { n: level - 1 }) : t(LEVEL_DESC_KEY[level])}
                  </span>
                </span>
                <span className="nd-level-status">
                  <span aria-hidden="true">{status.icon}</span> {status.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <h2 className="nd-section-title">{t('ndNotebookTitle')}</h2>
      <ul className="nd-notebook">
        {DIVISORS.map(d => {
          const stat = ruleStats[d]
          const standing = STANDING[ruleStanding(stat)]
          const correct = stat?.correct ?? 0
          const total = stat?.total ?? 0
          return (
            <li
              key={d}
              className={`nd-rule-cell nd-rule-cell--${ruleStanding(stat)}`}
              aria-label={t('ndRuleStatAria', { d, correct, total, standing: t(standing.key) })}
            >
              <span className="nd-rule-cell-divisor" aria-hidden="true">{d}</span>
              <span className="nd-rule-cell-score" aria-hidden="true">{correct} / {total}</span>
              <span className="nd-rule-cell-standing" aria-hidden="true">{standing.icon} {t(standing.key)}</span>
            </li>
          )
        })}
      </ul>

      {practiceRules.length > 0 && (
        <>
          <p className="nd-intro">{t('ndPracticeTip', { rules: practiceRules.join(', ') })}</p>
          <button type="button" className="btn-start" onClick={() => onPractice(practiceRules)}>
            <span aria-hidden="true">🔁</span> {t('ndPracticeBtn')}
          </button>
        </>
      )}
    </>
  )
}
