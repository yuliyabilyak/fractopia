import { useState, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProgress } from '../hooks/useProgress'
import FractionBar from '../components/FractionBar'
import PizzaFraction from '../components/PizzaFraction'
import CompareFractions from '../components/CompareFractions'
import HexagonFraction from '../components/HexagonFraction'
import SquareGridFraction from '../components/SquareGridFraction'
import FeedbackBanner from '../components/FeedbackBanner'
import type { ExerciseResult, Fraction } from '../types'

type ExerciseType = 'bar' | 'pizza' | 'compare' | 'hexagon' | 'grid'

interface Exercise {
  type: ExerciseType
  denominator: number
  numerator: number
  cols?: number
  rows?: number
  left?: Fraction
  right?: Fraction
}

const EXERCISES: Exercise[] = [
  // warm-up: small denominators
  { type: 'bar',     denominator: 4,  numerator: 1 },
  { type: 'pizza',   denominator: 6,  numerator: 2 },
  { type: 'hexagon', denominator: 6,  numerator: 3 },
  { type: 'compare', denominator: 4,  numerator: 1, left: { numerator: 1, denominator: 2 }, right: { numerator: 1, denominator: 4 } },
  { type: 'grid',    denominator: 4,  numerator: 2, cols: 2, rows: 2 },
  { type: 'bar',     denominator: 3,  numerator: 2 },
  { type: 'pizza',   denominator: 8,  numerator: 3 },
  { type: 'hexagon', denominator: 6,  numerator: 4 },
  { type: 'grid',    denominator: 6,  numerator: 4, cols: 3, rows: 2 },
  { type: 'compare', denominator: 4,  numerator: 1, left: { numerator: 2, denominator: 6 }, right: { numerator: 1, denominator: 3 } },
  { type: 'bar',     denominator: 5,  numerator: 3 },
  { type: 'grid',    denominator: 9,  numerator: 6, cols: 3, rows: 3 },
  // 12+ parts
  { type: 'pizza',   denominator: 12, numerator: 5 },
  { type: 'bar',     denominator: 12, numerator: 7 },
  { type: 'grid',    denominator: 12, numerator: 8, cols: 4, rows: 3 },
  { type: 'pizza',   denominator: 12, numerator: 9 },
  { type: 'bar',     denominator: 10, numerator: 7 },
  { type: 'grid',    denominator: 16, numerator: 12, cols: 4, rows: 4 },
  { type: 'compare', denominator: 12, numerator: 1, left: { numerator: 3, denominator: 12 }, right: { numerator: 1, denominator: 4 } },
  { type: 'pizza',   denominator: 16, numerator: 6 },
  { type: 'bar',     denominator: 12, numerator: 11 },
  { type: 'grid',    denominator: 15, numerator: 10, cols: 5, rows: 3 },
]

function compareAnswer(ex: Exercise, answer: 'left' | 'right' | 'equal'): boolean {
  if (!ex.left || !ex.right) return false
  const lv = ex.left.numerator / ex.left.denominator
  const rv = ex.right.numerator / ex.right.denominator
  if (lv > rv) return answer === 'left'
  if (rv > lv) return answer === 'right'
  return answer === 'equal'
}

function toExerciseType(type: ExerciseType): ExerciseResult['exerciseType'] {
  if (type === 'bar') return 'fraction-bar'
  if (type === 'grid') return 'grid'
  if (type === 'hexagon') return 'hexagon'
  if (type === 'compare') return 'compare'
  return 'pizza'
}

export default function Fractions() {
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const { user } = useAuth()
  const { saveResult } = useProgress(user?.uid)

  const current = EXERCISES[index]

  const handleAnswer = useCallback((correct: boolean) => {
    setFeedback(correct)
    if (correct) setScore((s) => s + 1)
    const result: ExerciseResult = {
      exerciseType: toExerciseType(current.type),
      correct,
      timestamp: Date.now(),
      question: `${current.type} ${current.numerator}/${current.denominator}`,
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

  if (index >= EXERCISES.length) {
    return (
      <div className="center-page">
        <h2>All done! 🎉</h2>
        <p>You got <strong>{score}/{EXERCISES.length}</strong> correct.</p>
        <button className="btn-start" onClick={() => { setIndex(0); setScore(0); setFeedback(null) }}>
          Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="fractions-page">
      <div className="progress-bar-wrapper">
        <div className="progress-bar-fill" style={{ width: `${(index / EXERCISES.length) * 100}%` }} />
      </div>
      <p className="exercise-counter">Exercise {index + 1} / {EXERCISES.length} · Score: {score}</p>

      {current.type === 'bar' && feedback === null && (
        <FractionBar
          key={index}
          denominator={current.denominator}
          targetNumerator={current.numerator}
          onAnswer={handleAnswer}
        />
      )}
      {current.type === 'pizza' && feedback === null && (
        <PizzaFraction
          key={index}
          denominator={current.denominator}
          targetNumerator={current.numerator}
          onAnswer={handleAnswer}
        />
      )}
      {current.type === 'hexagon' && feedback === null && (
        <HexagonFraction
          key={index}
          targetNumerator={current.numerator}
          onAnswer={handleAnswer}
        />
      )}
      {current.type === 'grid' && feedback === null && current.cols && current.rows && (
        <SquareGridFraction
          key={index}
          cols={current.cols}
          rows={current.rows}
          targetNumerator={current.numerator}
          onAnswer={handleAnswer}
        />
      )}
      {current.type === 'compare' && feedback === null && current.left && current.right && (
        <CompareFractions
          key={index}
          left={current.left}
          right={current.right}
          onAnswer={handleCompareAnswer}
        />
      )}

      <FeedbackBanner correct={feedback} onNext={next} />
    </div>
  )
}
