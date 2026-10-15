import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TOPIC_PATH } from '../data/topics'
import { useLang } from '../i18n/LangContext'
import { useAuth } from '../hooks/useAuth'
import { useDivisibilityProgress, type ProgressFields } from '../hooks/useDivisibilityProgress'
import { LEVEL_NAME_KEY } from '../hooks/useDetectiveText'
import ThemeToggle from '../components/ThemeToggle'
import DivisibilityLevelSelect, { type DivisibilityGameConfig } from '../components/DivisibilityLevelSelect'
import DetectiveYesNo from '../components/DetectiveYesNo'
import DetectiveAllDivisors from '../components/DetectiveAllDivisors'
import DivisibilityLevelComplete from '../components/DivisibilityLevelComplete'
import {
  DIVISORS, LEVELS, generateLevel, generatePractice, rulesNeedingPractice, unlockedLevel, addRuleResults,
  type Challenge, type Divisor, type LevelId, type RuleResult, type RuleStats,
} from '../data/numberDetective'
import { playChimeSound } from '../utils/sounds'

type Phase = 'levels' | 'playing' | 'finished'
type Mode = { kind: 'level'; level: LevelId } | { kind: 'practice'; rules: Divisor[] }

// Every solved case earns the same reward — no deductions for mistakes or hints.
const CLUES_PER_CASE = 1

const PROGRESS_FIELDS: ProgressFields = { completedLevels: 'ndCompletedLevels', points: 'ndClues', ruleStats: 'ndRuleStats' }

const GAME: DivisibilityGameConfig = {
  icon: '🔍',
  titleKey: 'ndTitle',
  introKey: 'ndIntro',
  pointsKey: 'ndCluesLabel',
  pointsEarnedKey: 'ndCluesEarned',
  levelNameKeys: LEVEL_NAME_KEY,
  levelDescKeys: { 1: 'ndLevel1Desc', 2: 'ndLevel2Desc', 3: 'ndLevel3Desc', 4: 'ndLevel4Desc', 5: 'ndLevel5Desc' },
  divisors: DIVISORS,
  badge: '🕵️',
  doneTitleKey: 'ndCaseClosed',
  solvedKey: 'ndCasesSolved',
  masterKey: 'ndMasterMsg',
}

interface RoundStats {
  solved: number
  firstTry: number
  ruleStats: RuleStats
}

const EMPTY_ROUND: RoundStats = { solved: 0, firstTry: 0, ruleStats: {} }

function challengesFor(mode: Mode): Challenge[] {
  return mode.kind === 'level' ? generateLevel(mode.level) : generatePractice(mode.rules)
}

export default function NumberDetective() {
  const navigate = useNavigate()
  const { t } = useLang()
  const { user, loading: authLoading, loginAnonymously } = useAuth()
  const { completedLevels, points: clues, ruleStats, loading: progressLoading, recordChallenge, completeLevel } = useDivisibilityProgress(user?.uid, PROGRESS_FIELDS)

  useEffect(() => {
    if (!authLoading && !user) loginAnonymously()
  }, [authLoading, user, loginAnonymously])

  const [phase, setPhase] = useState<Phase>('levels')
  const [mode, setMode] = useState<Mode>({ kind: 'level', level: 1 })
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [index, setIndex] = useState(0)
  const [round, setRound] = useState<RoundStats>(EMPTY_ROUND)
  const [newLevel, setNewLevel] = useState<LevelId | null>(null)

  if (authLoading || progressLoading) return <div className="center-page">Loading…</div>

  function start(next: Mode) {
    setMode(next)
    setChallenges(challengesFor(next))
    setIndex(0)
    setRound(EMPTY_ROUND)
    setNewLevel(null)
    setPhase('playing')
  }

  function handleDone(firstAttempt: RuleResult[]) {
    recordChallenge(firstAttempt, CLUES_PER_CASE)
    setRound(r => ({
      solved: r.solved + 1,
      firstTry: r.firstTry + (firstAttempt.every(x => x.correct) ? 1 : 0),
      ruleStats: addRuleResults(r.ruleStats, firstAttempt),
    }))

    if (index + 1 < challenges.length) {
      setIndex(index + 1)
      return
    }
    if (mode.kind === 'level') {
      const before = unlockedLevel(completedLevels)
      const after = unlockedLevel([...completedLevels, mode.level])
      completeLevel(mode.level)
      if (after > before) {
        setNewLevel(after)
        playChimeSound()
      }
    }
    setPhase('finished')
  }

  const backToLevels = () => setPhase('levels')
  const current = challenges[index]

  if (phase === 'levels') {
    return (
      <div className="fractions-page nd-page">
        <div className="fractions-header">
          <button type="button" className="training-back-btn" onClick={() => navigate(TOPIC_PATH.divisibility)}>← {t('trainingBack')}</button>
          <ThemeToggle />
        </div>
        <DivisibilityLevelSelect
          game={GAME}
          completedLevels={completedLevels}
          points={clues}
          ruleStats={ruleStats}
          onPlay={level => start({ kind: 'level', level })}
          onPractice={rules => start({ kind: 'practice', rules })}
        />
      </div>
    )
  }

  if (phase === 'finished') {
    const level = mode.kind === 'level' ? mode.level : null
    const nextLevel = level !== null && level < LEVELS.length ? (level + 1) as LevelId : null
    // rules this round showed need work, falling back to the all-time picture
    const practiceRules = rulesNeedingPractice(round.ruleStats).length > 0
      ? rulesNeedingPractice(round.ruleStats)
      : rulesNeedingPractice(ruleStats)
    return (
      <div className="fractions-page nd-page">
        <DivisibilityLevelComplete
          game={GAME}
          level={level}
          solved={round.solved}
          firstTry={round.firstTry}
          pointsEarned={round.solved * CLUES_PER_CASE}
          newLevel={newLevel}
          allLevelsDone={level === LEVELS.length}
          practiceRules={practiceRules}
          onNextLevel={nextLevel !== null && nextLevel <= unlockedLevel(completedLevels) ? () => start({ kind: 'level', level: nextLevel }) : null}
          onReplay={() => start(mode)}
          onPractice={() => start({ kind: 'practice', rules: practiceRules })}
          onLevels={backToLevels}
        />
      </div>
    )
  }

  const title = mode.kind === 'level'
    ? `${t('ndLevelLabel', { n: mode.level })}: ${t(LEVEL_NAME_KEY[mode.level])}`
    : t('ndPracticeTitle')

  return (
    <div className="fractions-page nd-page">
      <div className="fractions-header">
        <button type="button" className="training-back-btn" onClick={backToLevels}>← {t('ndAllLevels')}</button>
        <ThemeToggle />
      </div>

      <div className="nd-play-header">
        <p className="nd-level-title">{title}</p>
        <div className="nd-progress-row">
          <div
            className="progress-bar-wrapper"
            role="progressbar"
            aria-label={t('ndCaseCounter', { i: index + 1, total: challenges.length })}
            aria-valuemin={0}
            aria-valuemax={challenges.length}
            aria-valuenow={index}
          >
            <div className="progress-bar-fill" style={{ width: `${(index / challenges.length) * 100}%` }} />
          </div>
          <p className="nd-case-counter">{t('ndCaseCounter', { i: index + 1, total: challenges.length })}</p>
        </div>
        <span className="game-hud-chip nd-clue-chip">
          <span className="game-hud-icon" aria-hidden="true">🔍</span>{t('ndCluesLabel')}: {clues}
        </span>
      </div>

      {current.kind === 'all-divisors'
        ? <DetectiveAllDivisors key={index} challenge={current} onDone={handleDone} />
        : <DetectiveYesNo key={index} challenge={current} onDone={handleDone} />}
    </div>
  )
}
