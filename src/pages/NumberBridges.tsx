import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'
import { useAuth } from '../hooks/useAuth'
import { useDivisibilityProgress, type ProgressFields } from '../hooks/useDivisibilityProgress'
import ThemeToggle from '../components/ThemeToggle'
import DivisibilityLevelSelect, { type DivisibilityGameConfig } from '../components/DivisibilityLevelSelect'
import DivisibilityLevelComplete from '../components/DivisibilityLevelComplete'
import BridgeCrossing from '../components/BridgeCrossing'
import {
  LEVELS, addRuleResults, rulesNeedingPractice, unlockedLevel,
  type Divisor, type LevelId, type RuleResult, type RuleStats,
} from '../data/numberDetective'
import {
  BRIDGE_DIVISORS, generateChallenge, planLevel, planPractice,
  type BridgeChallenge,
} from '../data/numberBridges'
import { playChimeSound } from '../utils/sounds'

type Phase = 'levels' | 'playing' | 'finished'
type Mode = { kind: 'level'; level: LevelId } | { kind: 'practice'; rules: Divisor[] }

// One bridge per crossing, however many tries or hints it took.
const BRIDGES_PER_CROSSING = 1

const PROGRESS_FIELDS: ProgressFields = { completedLevels: 'nbCompletedLevels', points: 'nbBridges', ruleStats: 'nbRuleStats' }

const LEVEL_NAME_KEYS: DivisibilityGameConfig['levelNameKeys'] = {
  1: 'nbLevel1', 2: 'nbLevel2', 3: 'nbLevel3', 4: 'nbLevel4', 5: 'nbLevel5',
}

const GAME: DivisibilityGameConfig = {
  icon: '🌉',
  titleKey: 'nbTitle',
  introKey: 'nbIntro',
  pointsKey: 'nbBridgesLabel',
  pointsEarnedKey: 'nbBridgesEarned',
  levelNameKeys: LEVEL_NAME_KEYS,
  levelDescKeys: { 1: 'nbLevel1Desc', 2: 'nbLevel2Desc', 3: 'nbLevel3Desc', 4: 'nbLevel4Desc', 5: 'nbLevel5Desc' },
  divisors: BRIDGE_DIVISORS,
  badge: '🏝️',
  doneTitleKey: 'nbDoneTitle',
  solvedKey: 'nbCrossingsLabel',
  masterKey: 'nbMasterMsg',
}

interface RoundStats {
  crossed: number
  firstTry: number
  ruleStats: RuleStats
}

const EMPTY_ROUND: RoundStats = { crossed: 0, firstTry: 0, ruleStats: {} }

function challengesFor(mode: Mode): BridgeChallenge[] {
  const plans = mode.kind === 'level' ? planLevel(mode.level) : planPractice(mode.rules)
  return plans.map(p => generateChallenge(p))
}

export default function NumberBridges() {
  const navigate = useNavigate()
  const { t } = useLang()
  const { user, loading: authLoading, loginAnonymously } = useAuth()
  const {
    completedLevels, points: bridges, ruleStats, loading: progressLoading, recordChallenge, completeLevel,
  } = useDivisibilityProgress(user?.uid, PROGRESS_FIELDS)

  useEffect(() => {
    if (!authLoading && !user) loginAnonymously()
  }, [authLoading, user, loginAnonymously])

  const [phase, setPhase] = useState<Phase>('levels')
  const [mode, setMode] = useState<Mode>({ kind: 'level', level: 1 })
  const [challenges, setChallenges] = useState<BridgeChallenge[]>([])
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

  function handleDone(results: RuleResult[]) {
    recordChallenge(results, BRIDGES_PER_CROSSING)
    setRound(r => ({
      crossed: r.crossed + 1,
      firstTry: r.firstTry + (results.every(x => x.correct) ? 1 : 0),
      ruleStats: addRuleResults(r.ruleStats, results),
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

  if (phase === 'levels') {
    return (
      <div className="fractions-page nd-page">
        <div className="fractions-header">
          <button type="button" className="training-back-btn" onClick={() => navigate('/')}>← {t('trainingBack')}</button>
          <ThemeToggle />
        </div>
        <DivisibilityLevelSelect
          game={GAME}
          completedLevels={completedLevels}
          points={bridges}
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
    const fromRound = rulesNeedingPractice(round.ruleStats)
    const practiceRules = fromRound.length > 0 ? fromRound : rulesNeedingPractice(ruleStats)
    return (
      <div className="fractions-page nd-page">
        <DivisibilityLevelComplete
          game={GAME}
          level={level}
          solved={round.crossed}
          firstTry={round.firstTry}
          pointsEarned={round.crossed * BRIDGES_PER_CROSSING}
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
    ? `${t('ndLevelLabel', { n: mode.level })}: ${t(LEVEL_NAME_KEYS[mode.level])}`
    : t('ndPracticeTitle')
  const counter = t('nbCrossingCounter', { i: index + 1, total: challenges.length })

  return (
    <div className="fractions-page nd-page">
      <div className="fractions-header">
        <button type="button" className="training-back-btn" onClick={backToLevels}>← {t('ndAllLevels')}</button>
        <ThemeToggle />
      </div>

      <div className="nd-play-header">
        <p className="nd-level-title"><span aria-hidden="true">🌉</span> {t('nbTitle')} · {title}</p>
        <div className="nd-progress-row">
          <div
            className="progress-bar-wrapper"
            role="progressbar"
            aria-label={counter}
            aria-valuemin={0}
            aria-valuemax={challenges.length}
            aria-valuenow={index}
          >
            <div className="progress-bar-fill" style={{ width: `${(index / challenges.length) * 100}%` }} />
          </div>
          <p className="nd-case-counter">{counter}</p>
        </div>
        <span className="game-hud-chip nd-clue-chip">
          <span className="game-hud-icon" aria-hidden="true">🌉</span>{t('nbBridgesLabel')}: {bridges}
        </span>
      </div>

      <BridgeCrossing
        key={index}
        challenge={challenges[index]}
        isLast={index + 1 === challenges.length}
        onDone={handleDone}
      />
    </div>
  )
}
