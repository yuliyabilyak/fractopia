import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TOPIC_PATH } from '../data/topics'
import { useLang } from '../i18n/LangContext'
import { useAuth } from '../hooks/useAuth'
import { useWorkshopProgress } from '../hooks/useWorkshopProgress'
import ThemeToggle from '../components/ThemeToggle'
import WorkshopHub from '../components/NumberWorkshop/WorkshopHub'
import PartUnlocked from '../components/NumberWorkshop/PartUnlocked'
import AnswerFeedback from '../components/NumberWorkshop/AnswerFeedback'
import StarMeter from '../components/NumberWorkshop/StarMeter'
import StreakBattery from '../components/NumberWorkshop/StreakBattery'
import TilePress from '../components/NumberWorkshop/TilePress'
import FactorTree from '../components/NumberWorkshop/FactorTree'
import MissingMultiplier from '../components/NumberWorkshop/MissingMultiplier'
import DecimalScaler from '../components/NumberWorkshop/DecimalScaler'
import FractionCancel from '../components/NumberWorkshop/FractionCancel'
import { STATION_META } from '../components/NumberWorkshop/stations'
import {
  NEW_SESSION, PARTS, applyAnswer, generateProblem,
  type AnswerEvents, type SessionState, type StationId, type WorkshopProblem,
} from '../data/numberWorkshop'
import { playChimeSound, playFeedbackSound, playVictorySound } from '../utils/sounds'

type Phase =
  | { kind: 'hub' }
  | { kind: 'play'; station: StationId }
  | { kind: 'unlocked'; station: StationId; part: string }

interface Feedback {
  correct: boolean
  events: AnswerEvents
}

export default function NumberWorkshopPage() {
  const navigate = useNavigate()
  const { t } = useLang()
  const { user, loading: authLoading, loginAnonymously } = useAuth()
  const { save, loading: progressLoading, persist } = useWorkshopProgress(user?.uid)

  useEffect(() => {
    if (!authLoading && !user) loginAnonymously()
  }, [authLoading, user, loginAnonymously])

  const [phase, setPhase] = useState<Phase>({ kind: 'hub' })
  const [problem, setProblem] = useState<WorkshopProblem | null>(null)
  // bumps per problem so each station mounts fresh (state reset, prompt re-spoken)
  const [problemCount, setProblemCount] = useState(0)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  // streaks are per visit; stars, parts, levels and the best streak are saved
  const [session, setSession] = useState<SessionState>(NEW_SESSION)

  if (authLoading || progressLoading) return <div className="center-page">Loading…</div>

  function nextProblem(station: StationId, previous: WorkshopProblem | null) {
    setProblem(generateProblem(station, save.stationLevels[station], Math.random, previous))
    setProblemCount(c => c + 1)
    setFeedback(null)
  }

  function enterStation(station: StationId) {
    setPhase({ kind: 'play', station })
    nextProblem(station, null)
  }

  function handleAnswer(station: StationId, correct: boolean) {
    const result = applyAnswer(save, session, station, correct)
    persist(result.save)
    setSession(result.session)
    setFeedback({ correct, events: result.events })
    // wrong answers stay quiet — no buzzer
    if (!correct) return
    if (result.events.partUnlocked) playVictorySound()
    else if (result.events.levelUp || result.events.batteryFull) playChimeSound()
    else playFeedbackSound(true)
  }

  function handleNext(station: StationId) {
    const part = feedback?.events.partUnlocked
    if (part) {
      setPhase({ kind: 'unlocked', station, part })
      return
    }
    nextProblem(station, problem)
  }

  const header = (onBack: () => void, backLabel: string) => (
    <div className="fractions-header">
      <button type="button" className="training-back-btn" onClick={onBack}>← {backLabel}</button>
      <ThemeToggle />
    </div>
  )

  if (phase.kind === 'hub') {
    return (
      <div className="fractions-page ws-page">
        {header(() => navigate(TOPIC_PATH.fractions), t('trainingBack'))}
        <WorkshopHub save={save} onPick={enterStation} />
      </div>
    )
  }

  if (phase.kind === 'unlocked') {
    return (
      <div className="fractions-page ws-page">
        <PartUnlocked
          save={save}
          part={phase.part}
          onContinue={() => {
            setPhase({ kind: 'play', station: phase.station })
            nextProblem(phase.station, problem)
          }}
          onWorkshop={() => setPhase({ kind: 'hub' })}
        />
      </div>
    )
  }

  const { station } = phase
  const meta = STATION_META[station]

  return (
    <div className="fractions-page ws-page">
      {header(() => setPhase({ kind: 'hub' }), t('wsBackToWorkshop'))}

      <div className="ws-play-head">
        <p className="ws-play-title">
          <span aria-hidden="true">{meta.icon} </span>{t(meta.nameKey)} · {t('wsLevel', { n: save.stationLevels[station] })}
        </p>
        <div className="game-hud">
          <span className="game-hud-chip"><StarMeter stars={save.stars} /></span>
          <span className="game-hud-chip"><StreakBattery streak={session.streak} /></span>
          <span className="game-hud-chip">
            <span className="game-hud-icon" aria-hidden="true">🤖</span>
            {t('wsPartsLabel', { n: save.unlockedParts.length, total: PARTS.length })}
          </span>
        </div>
      </div>

      {problem && feedback && (
        <AnswerFeedback
          key={`fb-${problemCount}`}
          problem={problem}
          correct={feedback.correct}
          events={feedback.events}
          onNext={() => handleNext(station)}
        />
      )}
      {problem && !feedback && (
        <StationView key={problemCount} problem={problem} onAnswer={correct => handleAnswer(station, correct)} />
      )}
    </div>
  )
}

function StationView({ problem, onAnswer }: { problem: WorkshopProblem; onAnswer: (correct: boolean) => void }) {
  switch (problem.station) {
    case 'tile-press': return <TilePress problem={problem} onAnswer={onAnswer} />
    case 'factor-tree': return <FactorTree problem={problem} onAnswer={onAnswer} />
    case 'missing-multiplier': return <MissingMultiplier problem={problem} onAnswer={onAnswer} />
    case 'decimal-scaler': return <DecimalScaler problem={problem} onAnswer={onAnswer} />
    case 'fraction-cancel': return <FractionCancel problem={problem} onAnswer={onAnswer} />
  }
}
