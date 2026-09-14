import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'
import ThemeToggle from '../components/ThemeToggle'
import ScribeDoublingTable from '../components/ScribeDoublingTable'
import ScribeEgyptianBuilder from '../components/ScribeEgyptianBuilder'
import ScribePyramidScene from '../components/ScribePyramidScene'
import ScribePyramidCelebration from '../components/ScribePyramidCelebration'
import {
  SEQUENCE, TOTAL_STEPS, formatFraction, scarabsForStep,
  generateMultiplyPuzzle, generateEgyptianPuzzle, generateCombinedPuzzle, generateGrandChallenge,
  type StepDef, type MultiplyPuzzle, type EgyptianPuzzle, type CombinedPuzzle, type GrandChallenge,
} from '../data/scribePyramid'
import { playChimeSound } from '../utils/sounds'

type Phase = 'playing' | 'finished'
type SubStage = 'doubling' | 'decompose' | 'stones'

type CurrentPuzzle =
  | { kind: 'multiply'; data: MultiplyPuzzle }
  | { kind: 'decompose'; data: EgyptianPuzzle }
  | { kind: 'combined'; data: CombinedPuzzle; subStage: SubStage }
  | { kind: 'grand'; data: GrandChallenge; subStage: SubStage }

function makeCurrent(step: StepDef): CurrentPuzzle {
  if (step.kind === 'multiply') return { kind: 'multiply', data: generateMultiplyPuzzle(step.level as 1 | 2) }
  if (step.kind === 'decompose') return { kind: 'decompose', data: generateEgyptianPuzzle(3) }
  if (step.kind === 'combined') return { kind: 'combined', data: generateCombinedPuzzle(), subStage: 'doubling' }
  return { kind: 'grand', data: generateGrandChallenge(), subStage: 'doubling' }
}

function GrandStonesReveal({ data, onNext }: { data: GrandChallenge; onNext: () => void }) {
  const { t } = useLang()
  return (
    <div className="exercise-card scb-board">
      <p className="exercise-prompt">{t('scribeStonesPrompt', { cart: data.cartSize })}</p>
      <p className="scb-caption">
        {formatFraction(data.multiply.result)} × {data.cartSize} = {data.stonesNeeded}
      </p>
      <div className="scb-stone-pile" aria-hidden="true">
        {Array.from({ length: Math.min(data.stonesNeeded, 24) }, (_, i) => <span key={i} className="scb-stone scb-stone--placed" />)}
      </div>
      <p className="scb-reveal-title">{t('scribeStonesReveal', { n: data.stonesNeeded })}</p>
      <button type="button" className="ice-btn-next" onClick={onNext}>{t('next')} →</button>
    </div>
  )
}

export default function ScribePyramid() {
  const navigate = useNavigate()
  const { t } = useLang()

  const [phase, setPhase] = useState<Phase>('playing')
  const [stepIndex, setStepIndex] = useState(0)
  const [current, setCurrent] = useState<CurrentPuzzle>(() => makeCurrent(SEQUENCE[0]))
  const [scarabs, setScarabs] = useState(0)
  const [stonesPlaced, setStonesPlaced] = useState(0)
  const [mistakes, setMistakes] = useState(0)

  const stepDef = SEQUENCE[stepIndex]

  function handleMistake() {
    setMistakes(m => m + 1)
  }

  function advanceStep() {
    setScarabs(s => s + scarabsForStep(stepDef.kind))
    setStonesPlaced(s => s + 1)

    const nextIndex = stepIndex + 1
    if (nextIndex >= TOTAL_STEPS) {
      setPhase('finished')
      return
    }
    const nextStep = SEQUENCE[nextIndex]
    if (nextStep.level !== stepDef.level) playChimeSound()
    setStepIndex(nextIndex)
    setCurrent(makeCurrent(nextStep))
  }

  function advanceSubStage(subStage: SubStage) {
    setCurrent(prev => (prev.kind === 'combined' || prev.kind === 'grand') ? { ...prev, subStage } : prev)
  }

  function playAgain() {
    setPhase('playing')
    setStepIndex(0)
    setCurrent(makeCurrent(SEQUENCE[0]))
    setScarabs(0)
    setStonesPlaced(0)
    setMistakes(0)
  }

  if (phase === 'finished') {
    return (
      <div className="fractions-page">
        <ScribePyramidCelebration
          scarabs={scarabs}
          stonesPlaced={stonesPlaced}
          totalStones={TOTAL_STEPS}
          mistakes={mistakes}
          onPlayAgain={playAgain}
          onBack={() => navigate('/')}
        />
      </div>
    )
  }

  const puzzleKey = `${stepIndex}-${current.kind === 'combined' || current.kind === 'grand' ? current.subStage : ''}`

  return (
    <div className="fractions-page">
      <div className="fractions-header">
        <button className="training-back-btn" onClick={() => navigate('/')}>← {t('trainingBack')}</button>
        <p className="exercise-counter">{t('scribeCounter', { i: stepIndex + 1, total: TOTAL_STEPS })}</p>
        <ThemeToggle />
      </div>

      <div className="game-hud">
        <span className="game-hud-chip">
          <span className="game-hud-icon" aria-hidden="true">🪲</span>{scarabs}
        </span>
        <span className="game-hud-chip">
          <span className="game-hud-icon" aria-hidden="true">🧱</span>{stonesPlaced}/{TOTAL_STEPS}
        </span>
      </div>

      <ScribePyramidScene stepIndex={stepIndex} totalSteps={TOTAL_STEPS} level={stepDef.level} />

      {current.kind === 'multiply' && (
        <ScribeDoublingTable key={puzzleKey} puzzle={current.data} onMistake={handleMistake} onSolved={advanceStep} />
      )}
      {current.kind === 'decompose' && (
        <ScribeEgyptianBuilder key={puzzleKey} puzzle={current.data} onMistake={handleMistake} onSolved={advanceStep} />
      )}
      {current.kind === 'combined' && current.subStage === 'doubling' && (
        <ScribeDoublingTable key={puzzleKey} puzzle={current.data.multiply} onMistake={handleMistake} onSolved={() => advanceSubStage('decompose')} />
      )}
      {current.kind === 'combined' && current.subStage === 'decompose' && (
        <ScribeEgyptianBuilder key={puzzleKey} puzzle={current.data.egyptian} onMistake={handleMistake} onSolved={advanceStep} />
      )}
      {current.kind === 'grand' && current.subStage === 'doubling' && (
        <ScribeDoublingTable key={puzzleKey} puzzle={current.data.multiply} onMistake={handleMistake} onSolved={() => advanceSubStage('decompose')} />
      )}
      {current.kind === 'grand' && current.subStage === 'decompose' && (
        <ScribeEgyptianBuilder key={puzzleKey} puzzle={current.data.egyptian} onMistake={handleMistake} onSolved={() => advanceSubStage('stones')} />
      )}
      {current.kind === 'grand' && current.subStage === 'stones' && (
        <GrandStonesReveal key={puzzleKey} data={current.data} onNext={advanceStep} />
      )}
    </div>
  )
}
