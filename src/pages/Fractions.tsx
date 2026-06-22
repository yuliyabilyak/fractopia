import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLang } from '../i18n/LangContext'
import { useProgress } from '../hooks/useProgress'
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
import SessionEnd from '../components/SessionEnd'
import FractionDetective from '../components/FractionDetective'
import BalanceScale from '../components/BalanceScale'
import TimeMachineQuest from '../components/TimeMachineQuest'
import TimeDetective from '../components/TimeDetective'
import FeedbackBanner from '../components/FeedbackBanner'
import ThemeToggle from '../components/ThemeToggle'
import type { ExerciseResult } from '../types'
import { ALL_EXERCISES, shuffle, type Exercise, type ExerciseType } from '../data/exercises'

const SESSION_SIZE = 12


function compareAnswer(ex: Exercise, answer: 'left' | 'right' | 'equal'): boolean {
  if (!ex.left || !ex.right) return false
  const lv = ex.left.numerator / ex.left.denominator
  const rv = ex.right.numerator / ex.right.denominator
  if (lv > rv) return answer === 'left'
  if (rv > lv) return answer === 'right'
  return answer === 'equal'
}

function exercisePoints(type: ExerciseType): number {
  if (['bar', 'pizza', 'hexagon', 'grid', 'triangle', 'star', 'diamond'].includes(type)) return 10
  if (['time-operation', 'train', 'rocket', 'detective', 'balance'].includes(type)) return 20
  return 15
}

function timeBonus(ms: number): number {
  if (ms < 10_000) return 10
  if (ms < 20_000) return 5
  return 0
}

function toExerciseType(type: ExerciseType): ExerciseResult['exerciseType'] {
  if (type === 'bar')      return 'fraction-bar'
  if (type === 'grid')     return 'grid'
  if (type === 'hexagon')  return 'hexagon'
  if (type === 'identify') return 'identify'
  if (type === 'compare')  return 'compare'
  if (type === 'triangle')    return 'triangle'
  if (type === 'star')        return 'star'
  if (type === 'diamond')     return 'diamond'
  if (type === 'number-line') return 'number-line'
  if (type === 'equivalent')  return 'equivalent'
  if (type === 'sort')        return 'sort'
  if (type === 'hit-target')   return 'hit-target'
  if (type === 'time-fraction')     return 'time-fraction'
  if (type === 'fraction-quantity') return 'fraction-quantity'
  if (type === 'time-operation')    return 'time-operation'
  if (type === 'matching')          return 'matching'
  if (type === 'fraction-tower')    return 'fraction-tower'
  if (type === 'ice-cream')         return 'ice-cream'
  if (type === 'train')             return 'train'
  if (type === 'rocket')            return 'rocket'
  if (type === 'monster')           return 'monster'
  if (type === 'detective')         return 'detective'
  if (type === 'balance')           return 'balance'
  if (type === 'time-machine')      return 'time-machine'
  if (type === 'time-detective')    return 'time-detective'
  if (type === 'compare-same')      return 'compare-same'
  if (type === 'compare-same-num')  return 'compare-same-num'
  return 'pizza'
}

export default function Fractions() {
  const [sessionKey, setSessionKey] = useState(0)
  const session = useMemo(() => shuffle(ALL_EXERCISES).slice(0, SESSION_SIZE), [sessionKey])
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const exerciseStartRef = useRef<number>(Date.now())
  const navigate = useNavigate()
  const { user } = useAuth()
  const { saveResult } = useProgress(user?.uid)
  const { t } = useLang()

  useEffect(() => {
    exerciseStartRef.current = Date.now()
  }, [index])

  const current = session[index]

  const handleAnswer = useCallback((correct: boolean) => {
    const elapsed = Date.now() - exerciseStartRef.current
    const pts = correct ? exercisePoints(current.type) + timeBonus(elapsed) : 0
    setFeedback(correct)
    if (correct) setScore((s) => s + 1)
    setTotalScore(s => s + pts)
    const result: ExerciseResult = {
      exerciseType: toExerciseType(current.type),
      correct,
      timestamp: Date.now(),
      question: current.type === 'time-fraction' && current.unit
        ? `time-fraction ${current.numerator}/${current.denominator} of ${current.unit}`
        : current.type === 'hit-target' && current.target
        ? `hit-target ${current.target.n}/${current.target.d}`
        : current.type === 'sort' && current.fractions
        ? `sort ${current.fractions.map(f => `${f.n}/${f.d}`).join(' ')}`
        : current.type === 'fraction-quantity' && current.quantity !== undefined
        ? `fraction-quantity ${current.numerator}/${current.denominator} of ${current.quantity}`
        : current.type === 'time-operation' && current.operation
        ? current.operation === 'divide'
          ? `time-op-divide ${current.numerator}/${current.denominator} / ${current.divisor}`
          : `time-op-${current.operation} ${current.numerator}/${current.denominator} ${current.n2}/${current.d2}`
        : current.type === 'matching' && current.pairs
        ? `matching ${current.pairs.map(p => `${p.left.n}/${p.left.d}`).join(' ')}`
        : current.type === 'fraction-tower' && current.towerTiles
        ? `fraction-tower ${current.towerTiles.map(t => `${t.n}/${t.d}`).join(' ')}`
        : `${current.type} ${current.numerator}/${current.denominator}`,
    }
    saveResult(result)
  }, [current, saveResult])

  const handleCompareAnswer = useCallback((answer: 'left' | 'right' | 'equal') => {
    handleAnswer(compareAnswer(current, answer))
  }, [current, handleAnswer])

  const next = () => {
    setFeedback(null)
    setIndex((i) => i + 1)
  }

  if (index >= session.length) {
    return (
      <div className="fractions-page">
        <SessionEnd
          totalScore={totalScore}
          correctCount={score}
          totalCount={session.length}
          onPlayAgain={() => {
            setSessionKey(k => k + 1)
            setIndex(0)
            setScore(0)
            setTotalScore(0)
            setFeedback(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="fractions-page">
      <div className="progress-bar-wrapper">
        <div className="progress-bar-fill" style={{ width: `${(index / session.length) * 100}%` }} />
      </div>
      <div className="fractions-header">
        <button className="training-back-btn" onClick={() => navigate('/')}>← {t('trainingBack')}</button>
        <p className="exercise-counter">{t('counter', { i: index + 1, total: session.length, score })}</p>
        <ThemeToggle />
      </div>

      {current.type === 'bar' && feedback === null && (
        <FractionBar key={index} denominator={current.denominator} targetNumerator={current.numerator} onAnswer={handleAnswer} />
      )}
      {current.type === 'pizza' && feedback === null && (
        <PizzaFraction key={index} denominator={current.denominator} targetNumerator={current.numerator} onAnswer={handleAnswer} />
      )}
      {current.type === 'hexagon' && feedback === null && (
        <HexagonFraction key={index} targetNumerator={current.numerator} onAnswer={handleAnswer} />
      )}
      {current.type === 'grid' && feedback === null && current.cols && current.rows && (
        <SquareGridFraction key={index} cols={current.cols} rows={current.rows} targetNumerator={current.numerator} onAnswer={handleAnswer} />
      )}
      {current.type === 'triangle' && feedback === null && (
        <TriangleFraction key={index} denominator={current.denominator} targetNumerator={current.numerator} onAnswer={handleAnswer} />
      )}
      {current.type === 'star' && feedback === null && (
        <StarFraction key={index} targetNumerator={current.numerator} onAnswer={handleAnswer} />
      )}
      {current.type === 'diamond' && feedback === null && (
        <DiamondFraction key={index} targetNumerator={current.numerator} onAnswer={handleAnswer} />
      )}
      {current.type === 'identify' && feedback === null && current.shape && current.choices && current.correctIndex !== undefined && (
        <IdentifyFraction
          key={index}
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
        <TimeFraction key={index} numerator={current.numerator} denominator={current.denominator} unit={current.unit} answer={current.answer} onAnswer={handleAnswer} />
      )}
      {current.type === 'hit-target' && feedback === null && current.target && current.tiles && (
        <HitTarget key={index} target={current.target} tiles={current.tiles} onAnswer={handleAnswer} />
      )}
      {current.type === 'sort' && feedback === null && current.fractions && (
        <FractionSort key={index} fractions={current.fractions} onAnswer={handleAnswer} />
      )}
      {current.type === 'equivalent' && feedback === null && current.leftN !== undefined && current.leftD !== undefined && current.rightD !== undefined && (
        <EquivalentFractions key={index} leftNumerator={current.leftN} leftDenominator={current.leftD} rightDenominator={current.rightD} onAnswer={handleAnswer} />
      )}
      {current.type === 'number-line' && feedback === null && (
        <NumberLineFraction key={index} numerator={current.numerator} denominator={current.denominator} onAnswer={handleAnswer} />
      )}
      {current.type === 'time-operation' && feedback === null && current.operation && current.answer !== undefined && (
        <TimeOperation key={index} numerator={current.numerator} denominator={current.denominator} operation={current.operation} n2={current.n2} d2={current.d2} divisor={current.divisor} answer={current.answer} onAnswer={handleAnswer} />
      )}
      {current.type === 'fraction-quantity' && feedback === null && current.quantity !== undefined && current.itemKey && current.emoji && current.answer !== undefined && (
        <FractionQuantity key={index} numerator={current.numerator} denominator={current.denominator} quantity={current.quantity} itemKey={current.itemKey} emoji={current.emoji} answer={current.answer} onAnswer={handleAnswer} />
      )}
      {current.type === 'matching' && feedback === null && current.pairs && (
        <MatchingFractions key={index} pairs={current.pairs} onAnswer={handleAnswer} />
      )}
      {current.type === 'fraction-tower' && feedback === null && current.towerTiles && (
        <FractionTower key={index} tiles={current.towerTiles} onAnswer={handleAnswer} />
      )}
      {current.type === 'ice-cream' && feedback === null && (
        <IceCreamShop key={index} numerator={current.numerator} denominator={current.denominator} onAnswer={handleAnswer} />
      )}
      {current.type === 'train' && feedback === null && (
        <TrainBuilder key={index} numerator={current.numerator} denominator={current.denominator} onAnswer={handleAnswer} />
      )}
      {current.type === 'rocket' && feedback === null && (
        <RocketLaunch key={index} numerator={current.numerator} denominator={current.denominator} onAnswer={handleAnswer} />
      )}
      {current.type === 'monster' && feedback === null && current.left && current.right && (
        <MonsterBattle key={index} left={current.left} right={current.right} onAnswer={handleAnswer} />
      )}
      {current.type === 'detective' && feedback === null && current.detectives && (
        <FractionDetective key={index} cards={current.detectives} onAnswer={handleAnswer} />
      )}
      {current.type === 'balance' && feedback === null && current.answer !== undefined && (
        <BalanceScale key={index} numerator={current.numerator} denominator={current.denominator} answer={current.answer} onAnswer={handleAnswer} />
      )}
      {current.type === 'compare' && feedback === null && current.left && current.right && (
        <CompareFractions key={index} left={current.left} right={current.right} onAnswer={handleCompareAnswer} />
      )}
      {current.type === 'compare-same' && feedback === null && current.left && current.right && (
        <CompareFractions key={index} left={current.left} right={current.right} onAnswer={handleCompareAnswer} />
      )}
      {current.type === 'compare-same-num' && feedback === null && current.left && current.right && (
        <CompareFractions key={index} left={current.left} right={current.right} onAnswer={handleCompareAnswer} />
      )}
      {current.type === 'time-machine' && feedback === null && current.answer !== undefined && (
        <TimeMachineQuest key={index} numerator={current.numerator} denominator={current.denominator} emoji={current.emoji} answer={current.answer} onAnswer={handleAnswer} />
      )}
      {current.type === 'time-detective' && feedback === null && current.timeCards && (
        <TimeDetective key={index} cards={current.timeCards} onAnswer={handleAnswer} />
      )}

      <FeedbackBanner correct={feedback} onNext={next} />
    </div>
  )
}
