import { useState, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'
import LangSwitcher from '../components/LangSwitcher'
import ThemeToggle from '../components/ThemeToggle'
import FeedbackBanner from '../components/FeedbackBanner'
import FractionBar from '../components/FractionBar'
import PizzaFraction from '../components/PizzaFraction'
import CompareFractions from '../components/CompareFractions'
import HexagonFraction from '../components/HexagonFraction'
import SquareGridFraction from '../components/SquareGridFraction'
import IdentifyFraction from '../components/IdentifyFraction'
import TriangleFraction from '../components/TriangleFraction'
import StarFraction from '../components/StarFraction'
import DiamondFraction from '../components/DiamondFraction'
import NumberLineFraction from '../components/NumberLineFraction'
import EquivalentFractions from '../components/EquivalentFractions'
import FractionSort from '../components/FractionSort'
import HitTarget from '../components/HitTarget'
import TimeFraction from '../components/TimeFraction'
import TimeOperation from '../components/TimeOperation'
import FractionQuantity from '../components/FractionQuantity'
import MatchingFractions from '../components/MatchingFractions'
import FractionTower from '../components/FractionTower'
import IceCreamShop from '../components/IceCreamShop'
import TrainBuilder from '../components/TrainBuilder'
import RocketLaunch from '../components/RocketLaunch'
import MonsterBattle from '../components/MonsterBattle'
import FractionDetective from '../components/FractionDetective'
import BalanceScale from '../components/BalanceScale'
import TimeMachineQuest from '../components/TimeMachineQuest'
import TimeDetective from '../components/TimeDetective'
import FractionOperation from '../components/FractionOperation'
import { ALL_EXERCISES, type Exercise, type ExerciseType } from '../data/exercises'

interface Topic {
  id: string
  emoji: string
  label: string
  types: ExerciseType[]
}

const TOPICS: Topic[] = [
  { id: 'shapes',           emoji: '🎨', label: 'Colour Shapes',    types: ['bar', 'pizza', 'hexagon', 'grid', 'triangle', 'star', 'diamond'] },
  { id: 'identify',         emoji: '🔍', label: 'Identify',         types: ['identify'] },
  { id: 'compare',          emoji: '⚖️', label: 'Compare',          types: ['compare'] },
  { id: 'compare-same',     emoji: '🟰', label: 'Same Denominator',  types: ['compare-same'] },
  { id: 'compare-same-num', emoji: '🔢', label: 'Same Numerator',    types: ['compare-same-num'] },
  { id: 'number-line',      emoji: '📏', label: 'Number Line',      types: ['number-line'] },
  { id: 'equivalent',       emoji: '🔄', label: 'Equivalent',       types: ['equivalent'] },
  { id: 'sort',             emoji: '📊', label: 'Sort',             types: ['sort'] },
  { id: 'hit-target',       emoji: '🎯', label: 'Hit Target',       types: ['hit-target'] },
  { id: 'time-fraction',    emoji: '⏰', label: 'Time',             types: ['time-fraction'] },
  { id: 'time-operation',   emoji: '🧮', label: 'Time Math',        types: ['time-operation'] },
  { id: 'time-machine',    emoji: '⏳', label: 'Time Quest',        types: ['time-machine'] },
  { id: 'time-detective',  emoji: '🕵️', label: 'Time Detective',    types: ['time-detective'] },
  { id: 'fraction-quantity',emoji: '🔢', label: 'Quantity',         types: ['fraction-quantity'] },
  { id: 'matching',         emoji: '🃏', label: 'Matching',         types: ['matching'] },
  { id: 'fraction-tower',   emoji: '🏗️', label: 'Tower',            types: ['fraction-tower'] },
  { id: 'ice-cream',        emoji: '🍦', label: 'Ice Cream',        types: ['ice-cream'] },
  { id: 'train',            emoji: '🚂', label: 'Train',            types: ['train'] },
  { id: 'rocket',           emoji: '🚀', label: 'Rocket',           types: ['rocket'] },
  { id: 'monster',          emoji: '👾', label: 'Monster',          types: ['monster'] },
  { id: 'detective',        emoji: '🔎', label: 'Detective',        types: ['detective'] },
  { id: 'balance',          emoji: '🪨', label: 'Balance',          types: ['balance'] },
  { id: 'fraction-operation', emoji: '➕', label: 'Adding & Subtracting', types: ['fraction-operation'] },
]

function compareAnswer(ex: Exercise, answer: 'left' | 'right' | 'equal'): boolean {
  if (!ex.left || !ex.right) return false
  const lv = ex.left.numerator / ex.left.denominator
  const rv = ex.right.numerator / ex.right.denominator
  if (lv > rv) return answer === 'left'
  if (rv > lv) return answer === 'right'
  return answer === 'equal'
}

export default function TrainingCentre() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [current, setCurrent] = useState<Exercise | null>(null)
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [exKey, setExKey] = useState(0)
  // track last 3 exercises per topic to prevent repeats
  const recentByTopic = useRef<Map<string, Exercise[]>>(new Map())

  const poolByType = useMemo(() => {
    const map = new Map<ExerciseType, Exercise[]>()
    for (const ex of ALL_EXERCISES) {
      const arr = map.get(ex.type)
      if (arr) arr.push(ex)
      else map.set(ex.type, [ex])
    }
    return map
  }, [])

  const pickExercise = useCallback((topic: Topic) => {
    const pool = topic.types.flatMap(t => poolByType.get(t) ?? [])
    const recent = recentByTopic.current.get(topic.id) ?? []
    const candidates = pool.filter(ex => !recent.includes(ex))
    const source = candidates.length > 0 ? candidates : pool
    const ex = source[Math.floor(Math.random() * source.length)]
    recentByTopic.current.set(topic.id, [...recent, ex].slice(-3))
    setSelectedTopic(topic)
    setCurrent(ex)
    setFeedback(null)
    setExKey(k => k + 1)
  }, [poolByType])

  const handleAnswer = useCallback((correct: boolean) => {
    setFeedback(correct)
  }, [])

  const handleNext = useCallback(() => {
    if (selectedTopic) pickExercise(selectedTopic)
  }, [selectedTopic, pickExercise])

  const handleBack = () => {
    setSelectedTopic(null)
    setCurrent(null)
    setFeedback(null)
  }

  return (
    <div className="training-page">
      <div className="training-header">
        <button className="training-back-btn" onClick={selectedTopic ? handleBack : () => navigate('/')}>
          ← {t('trainingBack')}
        </button>
        <h1 className="training-title">{t('trainingTitle')}</h1>
        <div className="training-header-right">
          <LangSwitcher />
          <ThemeToggle />
        </div>
      </div>

      {!selectedTopic && (
        <>
          <p className="training-pick">{t('trainingPick')}</p>
          <div className="training-grid">
            {TOPICS.map((topic) => (
              <button
                key={topic.id}
                className="training-type-btn"
                onClick={() => pickExercise(topic)}
              >
                <span className="training-type-emoji">{topic.emoji}</span>
                <span className="training-type-label">{topic.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {selectedTopic && current && (
        <div className="training-exercise">
          {current.type === 'bar' && feedback === null && (
            <FractionBar key={exKey} denominator={current.denominator} targetNumerator={current.numerator} onAnswer={handleAnswer} />
          )}
          {current.type === 'pizza' && feedback === null && (
            <PizzaFraction key={exKey} denominator={current.denominator} targetNumerator={current.numerator} onAnswer={handleAnswer} />
          )}
          {current.type === 'hexagon' && feedback === null && (
            <HexagonFraction key={exKey} targetNumerator={current.numerator} onAnswer={handleAnswer} />
          )}
          {current.type === 'grid' && feedback === null && current.cols && current.rows && (
            <SquareGridFraction key={exKey} cols={current.cols} rows={current.rows} targetNumerator={current.numerator} onAnswer={handleAnswer} />
          )}
          {current.type === 'triangle' && feedback === null && (
            <TriangleFraction key={exKey} denominator={current.denominator} targetNumerator={current.numerator} onAnswer={handleAnswer} />
          )}
          {current.type === 'star' && feedback === null && (
            <StarFraction key={exKey} targetNumerator={current.numerator} onAnswer={handleAnswer} />
          )}
          {current.type === 'diamond' && feedback === null && (
            <DiamondFraction key={exKey} targetNumerator={current.numerator} onAnswer={handleAnswer} />
          )}
          {current.type === 'identify' && feedback === null && current.shape && current.choices && current.correctIndex !== undefined && (
            <IdentifyFraction
              key={exKey}
              shape={current.shape}
              denominator={current.denominator}
              numerator={current.numerator}
              cols={current.cols}
              rows={current.rows}
              choices={current.choices}
              correctIndex={current.correctIndex}
              onAnswer={handleAnswer}
            />
          )}
          {current.type === 'time-fraction' && feedback === null && current.unit && current.answer !== undefined && (
            <TimeFraction key={exKey} numerator={current.numerator} denominator={current.denominator} unit={current.unit} answer={current.answer} onAnswer={handleAnswer} />
          )}
          {current.type === 'hit-target' && feedback === null && current.target && current.tiles && (
            <HitTarget key={exKey} target={current.target} tiles={current.tiles} onAnswer={handleAnswer} />
          )}
          {current.type === 'sort' && feedback === null && current.fractions && (
            <FractionSort key={exKey} fractions={current.fractions} onAnswer={handleAnswer} />
          )}
          {current.type === 'equivalent' && feedback === null && current.leftN !== undefined && current.leftD !== undefined && current.rightD !== undefined && (
            <EquivalentFractions key={exKey} leftNumerator={current.leftN} leftDenominator={current.leftD} rightDenominator={current.rightD} onAnswer={handleAnswer} />
          )}
          {current.type === 'number-line' && feedback === null && (
            <NumberLineFraction key={exKey} numerator={current.numerator} denominator={current.denominator} onAnswer={handleAnswer} />
          )}
          {current.type === 'time-operation' && feedback === null && current.operation && current.answer !== undefined && (
            <TimeOperation key={exKey} numerator={current.numerator} denominator={current.denominator} operation={current.operation} n2={current.n2} d2={current.d2} divisor={current.divisor} answer={current.answer} onAnswer={handleAnswer} />
          )}
          {current.type === 'fraction-quantity' && feedback === null && current.quantity !== undefined && current.itemKey && current.emoji && current.answer !== undefined && (
            <FractionQuantity key={exKey} numerator={current.numerator} denominator={current.denominator} quantity={current.quantity} itemKey={current.itemKey} emoji={current.emoji} answer={current.answer} onAnswer={handleAnswer} />
          )}
          {current.type === 'matching' && feedback === null && current.pairs && (
            <MatchingFractions key={exKey} pairs={current.pairs} onAnswer={handleAnswer} />
          )}
          {current.type === 'fraction-tower' && feedback === null && current.towerTiles && (
            <FractionTower key={exKey} tiles={current.towerTiles} onAnswer={handleAnswer} />
          )}
          {current.type === 'ice-cream' && feedback === null && (
            <IceCreamShop key={exKey} numerator={current.numerator} denominator={current.denominator} onAnswer={handleAnswer} />
          )}
          {current.type === 'train' && feedback === null && (
            <TrainBuilder key={exKey} numerator={current.numerator} denominator={current.denominator} onAnswer={handleAnswer} />
          )}
          {current.type === 'rocket' && feedback === null && (
            <RocketLaunch key={exKey} numerator={current.numerator} denominator={current.denominator} onAnswer={handleAnswer} />
          )}
          {current.type === 'monster' && feedback === null && current.left && current.right && (
            <MonsterBattle key={exKey} left={current.left} right={current.right} onAnswer={handleAnswer} />
          )}
          {current.type === 'detective' && feedback === null && current.detectives && (
            <FractionDetective key={exKey} cards={current.detectives} onAnswer={handleAnswer} />
          )}
          {current.type === 'balance' && feedback === null && current.answer !== undefined && (
            <BalanceScale key={exKey} numerator={current.numerator} denominator={current.denominator} answer={current.answer} onAnswer={handleAnswer} />
          )}
          {current.type === 'time-machine' && feedback === null && current.answer !== undefined && (
            <TimeMachineQuest key={exKey} numerator={current.numerator} denominator={current.denominator} emoji={current.emoji} answer={current.answer} onAnswer={handleAnswer} />
          )}
          {current.type === 'time-detective' && feedback === null && current.timeCards && (
            <TimeDetective key={exKey} cards={current.timeCards} onAnswer={handleAnswer} />
          )}
          {current.type === 'fraction-operation' && feedback === null
            && (current.shape === 'bar' || current.shape === 'pizza')
            && (current.operation === 'add' || current.operation === 'subtract')
            && current.left && current.right && current.result && current.mode && (
            <FractionOperation
              key={exKey}
              shape={current.shape}
              operation={current.operation}
              left={current.left}
              right={current.right}
              result={current.result}
              mode={current.mode}
              choices={current.choices}
              correctIndex={current.correctIndex}
              onAnswer={handleAnswer}
            />
          )}
          {current.type === 'compare' && feedback === null && current.left && current.right && (
            <CompareFractions
              key={exKey}
              left={current.left}
              right={current.right}
              onAnswer={(answer) => handleAnswer(compareAnswer(current, answer))}
            />
          )}
          {current.type === 'compare-same' && feedback === null && current.left && current.right && (
            <CompareFractions
              key={exKey}
              left={current.left}
              right={current.right}
              onAnswer={(answer) => handleAnswer(compareAnswer(current, answer))}
            />
          )}
          {current.type === 'compare-same-num' && feedback === null && current.left && current.right && (
            <CompareFractions
              key={exKey}
              left={current.left}
              right={current.right}
              onAnswer={(answer) => handleAnswer(compareAnswer(current, answer))}
            />
          )}

          <FeedbackBanner correct={feedback} onNext={handleNext} />
        </div>
      )}
    </div>
  )
}
