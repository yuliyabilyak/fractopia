// TimeMachineQuest — multiplication / time-conversion exercise.
// Child works out how many energy crystals (1 crystal = 1 day) a time
// machine needs for N years of travel.  Multiple-choice, 4 options.
// Wrong answer reveals a step-by-step addition hint.

import { useState, useMemo } from 'react'
import { useLang } from '../i18n/LangContext'

const DESTINATIONS: Record<string, string> = {
  '🔺': 'Ancient Egypt',
  '🦕': 'Dinosaur Age',
  '🏰': 'Medieval Castle',
  '🚀': 'Future City',
  '⚓': 'Pirate Era',
  '🌙': 'Moon Colony',
  '🗿': 'Easter Island',
  '🏛️': 'Ancient Rome',
  '🌋': 'Pompeii',
  '🤖': 'Robot World',
  '🦄': 'Unicorn Land',
  '🐉': 'Dragon Kingdom',
}

type Phase = 'question' | 'wrong' | 'correct'

interface Props {
  numerator: number
  denominator: number
  emoji?: string
  answer: number
  onAnswer: (correct: boolean) => void
}

export default function TimeMachineQuest({ numerator, emoji = '🚀', answer, onAnswer }: Props) {
  const { t } = useLang()
  const years = numerator
  const correct = answer
  const destination = DESTINATIONS[emoji] ?? 'Unknown World'

  const [phase, setPhase] = useState<Phase>('question')

  const choices = useMemo(() => {
    const arr = [correct, years * 360, correct + 30, (years + 1) * 365]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [years, correct])

  function handleChoice(val: number) {
    if (phase !== 'question') return
    setPhase(val === correct ? 'correct' : 'wrong')
  }

  // ── correct screen ──────────────────────────────────────────────────────────
  if (phase === 'correct') {
    return (
      <div className="exercise-card tmq-success-card">
        <div className="tmq-success-icon">⚡</div>
        <p className="tmq-success-msg">
          {years} {years === 1 ? t('tmqYear') : t('tmqYears')} × 365 = <strong>{correct}</strong> {t('tmqCrystals')}!
        </p>
        <div className="tmq-hint-box">
          {years <= 6
            ? Array.from({ length: years }, (_, i) => (
                <div key={i} className="tmq-hint-row">
                  <span className="tmq-hint-label">{t('tmqYear')} {i + 1}:</span>
                  <span className="tmq-hint-val">365 ⚡</span>
                </div>
              ))
            : (
              <div className="tmq-hint-row">
                <span className="tmq-hint-label">365 × {years}:</span>
                <span className="tmq-hint-val">{correct} ⚡</span>
              </div>
            )
          }
          <div className="tmq-hint-row tmq-hint-row--sum">
            <span className="tmq-hint-label">= {correct} ⚡</span>
          </div>
        </div>
        <button className="ice-btn-next" onClick={() => onAnswer(true)}>
          {t('next')} →
        </button>
      </div>
    )
  }

  // ── question + wrong screen ─────────────────────────────────────────────────
  return (
    <div className="exercise-card">
      <p className="exercise-prompt">{t('tmqPrompt')}</p>

      {/* Mission briefing card */}
      <div className="tmq-mission">
        <div className="tmq-dest">
          <span className="tmq-dest-emoji">{emoji}</span>
          <div className="tmq-dest-info">
            <span className="tmq-dest-name">{destination}</span>
            <span className="tmq-dest-dur">
              {years} {years === 1 ? t('tmqYear') : t('tmqYears')}
            </span>
          </div>
        </div>
        <p className="tmq-rule">1 ⚡ = 1 day &nbsp;·&nbsp; 1 {t('tmqYear')} = 365 days</p>
      </div>

      {/* Year-by-year energy breakdown */}
      <div className="tmq-breakdown">
        {years <= 5
          ? Array.from({ length: years }, (_, i) => (
              <div key={i} className="tmq-year-row">
                <span className="tmq-year-label">📅 {t('tmqYear')} {i + 1}</span>
                <span className="tmq-year-val">= 365 ⚡</span>
              </div>
            ))
          : (
            <>
              <div className="tmq-year-row">
                <span className="tmq-year-label">📅 {t('tmqYear')} 1</span>
                <span className="tmq-year-val">= 365 ⚡</span>
              </div>
              <div className="tmq-year-row tmq-year-row--dots">⋮</div>
              <div className="tmq-year-row">
                <span className="tmq-year-label">📅 {t('tmqYear')} {years}</span>
                <span className="tmq-year-val">= 365 ⚡</span>
              </div>
            </>
          )
        }
        <div className="tmq-year-row tmq-year-row--total">
          <span className="tmq-year-label">⚡ Total?</span>
          <span className="tmq-year-val tmq-year-val--q">? ⚡</span>
        </div>
      </div>

      {/* 2×2 choice grid (hidden when hint showing) */}
      {phase === 'question' && (
        <div className="tmq-choices">
          {choices.map((c, i) => (
            <button key={`${c}-${i}`} className="tmq-choice-btn" onClick={() => handleChoice(c)}>
              {c} ⚡
            </button>
          ))}
        </div>
      )}

      {/* Hint panel revealed after wrong answer */}
      {phase === 'wrong' && (
        <div className="tmq-hint-panel">
          <p className="tmq-hint-title">{t('tmqHint')}</p>
          <div className="tmq-hint-box">
            {years <= 6
              ? Array.from({ length: years }, (_, i) => (
                  <div key={i} className="tmq-hint-row">
                    <span className="tmq-hint-label">{t('tmqYear')} {i + 1}:</span>
                    <span className="tmq-hint-val">365</span>
                  </div>
                ))
              : (
                <div className="tmq-hint-row">
                  <span className="tmq-hint-label">365 × {years} =</span>
                  <span className="tmq-hint-val">{correct}</span>
                </div>
              )
            }
            <div className="tmq-hint-row tmq-hint-row--sum">
              <span className="tmq-hint-label">= {correct} ⚡</span>
            </div>
          </div>
          <button className="tmq-retry-btn" onClick={() => setPhase('question')}>
            {t('tmqTryAgain')}
          </button>
        </div>
      )}
    </div>
  )
}
