import { useState, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLang } from '../i18n/LangContext'
import { useProgress } from '../hooks/useProgress'
import FractionBar from '../components/FractionBar'
import PizzaFraction from '../components/PizzaFraction'
import CompareFractions from '../components/CompareFractions'
import HexagonFraction from '../components/HexagonFraction'
import SquareGridFraction from '../components/SquareGridFraction'
import IdentifyFraction from '../components/IdentifyFraction'
import FeedbackBanner from '../components/FeedbackBanner'
import type { ExerciseResult, Fraction } from '../types'

type ExerciseType = 'bar' | 'pizza' | 'compare' | 'hexagon' | 'grid' | 'identify'

interface Exercise {
  type: ExerciseType
  denominator: number
  numerator: number
  cols?: number
  rows?: number
  left?: Fraction
  right?: Fraction
  shape?: 'bar' | 'pizza' | 'grid'
  choices?: Fraction[]
  correctIndex?: number
}

const SESSION_SIZE = 12

const ALL_EXERCISES: Exercise[] = [
  // --- shade the figure ---
  { type: 'bar',     denominator: 2,  numerator: 1 },
  { type: 'bar',     denominator: 3,  numerator: 1 },
  { type: 'bar',     denominator: 3,  numerator: 2 },
  { type: 'bar',     denominator: 4,  numerator: 1 },
  { type: 'bar',     denominator: 4,  numerator: 3 },
  { type: 'bar',     denominator: 5,  numerator: 2 },
  { type: 'bar',     denominator: 5,  numerator: 3 },
  { type: 'bar',     denominator: 6,  numerator: 5 },
  { type: 'bar',     denominator: 8,  numerator: 3 },
  { type: 'bar',     denominator: 10, numerator: 7 },
  { type: 'bar',     denominator: 12, numerator: 5 },
  { type: 'bar',     denominator: 12, numerator: 9 },

  { type: 'pizza',   denominator: 4,  numerator: 1 },
  { type: 'pizza',   denominator: 4,  numerator: 3 },
  { type: 'pizza',   denominator: 6,  numerator: 2 },
  { type: 'pizza',   denominator: 6,  numerator: 5 },
  { type: 'pizza',   denominator: 8,  numerator: 3 },
  { type: 'pizza',   denominator: 8,  numerator: 7 },
  { type: 'pizza',   denominator: 12, numerator: 4 },
  { type: 'pizza',   denominator: 12, numerator: 7 },
  { type: 'pizza',   denominator: 16, numerator: 6 },

  { type: 'hexagon', denominator: 6,  numerator: 1 },
  { type: 'hexagon', denominator: 6,  numerator: 2 },
  { type: 'hexagon', denominator: 6,  numerator: 3 },
  { type: 'hexagon', denominator: 6,  numerator: 4 },
  { type: 'hexagon', denominator: 6,  numerator: 5 },

  { type: 'grid', denominator: 4,  numerator: 1, cols: 2, rows: 2 },
  { type: 'grid', denominator: 4,  numerator: 3, cols: 2, rows: 2 },
  { type: 'grid', denominator: 6,  numerator: 2, cols: 3, rows: 2 },
  { type: 'grid', denominator: 6,  numerator: 5, cols: 3, rows: 2 },
  { type: 'grid', denominator: 9,  numerator: 4, cols: 3, rows: 3 },
  { type: 'grid', denominator: 9,  numerator: 7, cols: 3, rows: 3 },
  { type: 'grid', denominator: 12, numerator: 5, cols: 4, rows: 3 },
  { type: 'grid', denominator: 12, numerator: 9, cols: 4, rows: 3 },
  { type: 'grid', denominator: 16, numerator: 6, cols: 4, rows: 4 },
  { type: 'grid', denominator: 15, numerator: 10, cols: 5, rows: 3 },

  // --- identify the fraction ---
  { type: 'identify', shape: 'bar', denominator: 4, numerator: 1,
    choices: [{numerator:1,denominator:4},{numerator:2,denominator:4},{numerator:3,denominator:4},{numerator:1,denominator:2}], correctIndex: 0 },
  { type: 'identify', shape: 'bar', denominator: 4, numerator: 3,
    choices: [{numerator:1,denominator:4},{numerator:2,denominator:4},{numerator:3,denominator:4},{numerator:4,denominator:4}], correctIndex: 2 },
  { type: 'identify', shape: 'pizza', denominator: 6, numerator: 2,
    choices: [{numerator:1,denominator:6},{numerator:2,denominator:6},{numerator:3,denominator:6},{numerator:4,denominator:6}], correctIndex: 1 },
  { type: 'identify', shape: 'pizza', denominator: 8, numerator: 5,
    choices: [{numerator:3,denominator:8},{numerator:5,denominator:8},{numerator:6,denominator:8},{numerator:7,denominator:8}], correctIndex: 1 },
  { type: 'identify', shape: 'bar', denominator: 5, numerator: 2,
    choices: [{numerator:1,denominator:5},{numerator:2,denominator:5},{numerator:3,denominator:5},{numerator:4,denominator:5}], correctIndex: 1 },
  { type: 'identify', shape: 'grid', denominator: 4, numerator: 3, cols: 2, rows: 2,
    choices: [{numerator:1,denominator:4},{numerator:2,denominator:4},{numerator:3,denominator:4},{numerator:4,denominator:4}], correctIndex: 2 },
  { type: 'identify', shape: 'grid', denominator: 9, numerator: 6, cols: 3, rows: 3,
    choices: [{numerator:5,denominator:9},{numerator:6,denominator:9},{numerator:7,denominator:9},{numerator:3,denominator:9}], correctIndex: 1 },
  { type: 'identify', shape: 'pizza', denominator: 12, numerator: 4,
    choices: [{numerator:3,denominator:12},{numerator:4,denominator:12},{numerator:5,denominator:12},{numerator:6,denominator:12}], correctIndex: 1 },
  { type: 'identify', shape: 'bar', denominator: 8, numerator: 3,
    choices: [{numerator:2,denominator:8},{numerator:3,denominator:8},{numerator:5,denominator:8},{numerator:6,denominator:8}], correctIndex: 1 },
  { type: 'identify', shape: 'grid', denominator: 6, numerator: 4, cols: 3, rows: 2,
    choices: [{numerator:2,denominator:6},{numerator:3,denominator:6},{numerator:4,denominator:6},{numerator:5,denominator:6}], correctIndex: 2 },

  // --- compare ---
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 1, denominator: 2 }, right: { numerator: 1, denominator: 4 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 2, denominator: 6 }, right: { numerator: 1, denominator: 3 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 3, denominator: 4 }, right: { numerator: 2, denominator: 3 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 1, denominator: 3 }, right: { numerator: 2, denominator: 5 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 3, denominator: 12 }, right: { numerator: 1, denominator: 4 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 5, denominator: 8 }, right: { numerator: 3, denominator: 4 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 2, denominator: 5 }, right: { numerator: 3, denominator: 10 } },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

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
  if (type === 'identify') return 'identify'
  if (type === 'compare') return 'compare'
  return 'pizza'
}

export default function Fractions() {
  const [session] = useState<Exercise[]>(() => shuffle(ALL_EXERCISES).slice(0, SESSION_SIZE))
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const { user } = useAuth()
  const { saveResult } = useProgress(user?.uid)
  const { t } = useLang()

  const current = session[index]

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

  if (index >= session.length) {
    return (
      <div className="center-page">
        <h2>{t('doneTitle')}</h2>
        <p dangerouslySetInnerHTML={{ __html: t('doneScore', { score, total: session.length }).replace(/(\d+\/\d+)/, '<strong>$1</strong>') }} />
        <button className="btn-start" onClick={() => window.location.reload()}>
          {t('playAgain')}
        </button>
      </div>
    )
  }

  return (
    <div className="fractions-page">
      <div className="progress-bar-wrapper">
        <div className="progress-bar-fill" style={{ width: `${(index / session.length) * 100}%` }} />
      </div>
      <p className="exercise-counter">{t('counter', { i: index + 1, total: session.length, score })}</p>

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
      {current.type === 'compare' && feedback === null && current.left && current.right && (
        <CompareFractions key={index} left={current.left} right={current.right} onAnswer={handleCompareAnswer} />
      )}

      <FeedbackBanner correct={feedback} onNext={next} />
    </div>
  )
}
