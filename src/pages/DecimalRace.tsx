import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'
import ThemeToggle from '../components/ThemeToggle'
import FeedbackBanner from '../components/FeedbackBanner'
import FractionToDecimal from '../components/FractionToDecimal'
import { DECIMAL_POOL } from '../data/decimalRace'
import { shuffle } from '../data/exercises'

const RACE_SIZE = 20

export default function DecimalRace() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [raceKey, setRaceKey] = useState(0)
  const session = useMemo(() => shuffle(DECIMAL_POOL).slice(0, RACE_SIZE), [raceKey])
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  const current = session[index]

  const handleAnswer = useCallback((correct: boolean) => {
    setFeedback(correct)
    if (correct) setCorrectCount(c => c + 1)
  }, [])

  const next = () => {
    setFeedback(null)
    setIndex(i => i + 1)
  }

  const playAgain = () => {
    setRaceKey(k => k + 1)
    setIndex(0)
    setCorrectCount(0)
    setFeedback(null)
  }

  if (index >= session.length) {
    return (
      <div className="fractions-page">
        <div className="se-wrapper">
          <h2 className="se-done-title">{t('raceDoneTitle')}</h2>
          <div className="se-score-box">
            <p className="se-pts">{correctCount}/{session.length}</p>
            <p className="se-pts-label">{t('raceScoreLabel')}</p>
          </div>
          <button className="btn-start" onClick={playAgain}>{t('playAgain')}</button>
          <button className="training-back-btn" onClick={() => navigate('/')}>← {t('trainingBack')}</button>
        </div>
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
        <p className="exercise-counter">{t('raceCounter', { i: index + 1, total: session.length, score: correctCount })}</p>
        <ThemeToggle />
      </div>

      {feedback === null && (
        <FractionToDecimal
          key={index}
          numerator={current.numerator}
          denominator={current.denominator}
          answer={current.answer}
          onAnswer={handleAnswer}
        />
      )}

      <FeedbackBanner correct={feedback} onNext={next} />
    </div>
  )
}
