// TimeDetective — find the one incorrect time-unit statement among three cards.
// Same mechanic as FractionDetective but for time conversions:
// years→months (×12), weeks→days (×7), years→days (×365), and reverses.

import { useState, useEffect, useMemo } from 'react'
import { useLang } from '../i18n/LangContext'
import ConfettiBurst from './ConfettiBurst'

// ── Data type ─────────────────────────────────────────────────────────────────

export interface TimeCard {
  n:        number
  fromUnit: 'year' | 'week' | 'month' | 'day'
  toUnit:   'month' | 'day' | 'year' | 'week'
  stated:   number     // claimed result shown on card (may be wrong)
  correct:  number     // actual correct result
  isWrong:  boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const UNIT_EMOJI: Record<string, string> = {
  year: '📅', month: '📅',
  week: '📆', day:  '📆',
}

type CalcInfo = { op: '×' | '÷'; factor: number }
const CALC: Record<string, CalcInfo> = {
  'year-month': { op: '×', factor: 12 },
  'week-day':   { op: '×', factor: 7 },
  'year-day':   { op: '×', factor: 365 },
  'month-year': { op: '÷', factor: 12 },
  'day-week':   { op: '÷', factor: 7 },
}

type Phase = 'playing' | 'wrong-choice' | 'solved-anim' | 'explain'
const LABELS = ['A', 'B', 'C']

// ── Root ──────────────────────────────────────────────────────────────────────

interface Props {
  cards:    TimeCard[]
  onAnswer: (correct: boolean) => void
}

export default function TimeDetective({ cards, onAnswer }: Props) {
  const { t } = useLang()
  const [phase,  setPhase]  = useState<Phase>('playing')
  const [tapped, setTapped] = useState<number | null>(null)

  const deck     = useMemo(() => [...cards].sort(() => 0.5 - Math.random()), [])
  const wrongIdx = deck.findIndex(c => c.isWrong)

  // wrong-choice → reset after 1.3 s
  useEffect(() => {
    if (phase !== 'wrong-choice') return
    const id = setTimeout(() => { setPhase('playing'); setTapped(null) }, 1300)
    return () => clearTimeout(id)
  }, [phase])

  // solved-anim → explain after 1.7 s
  useEffect(() => {
    if (phase !== 'solved-anim') return
    const id = setTimeout(() => setPhase('explain'), 1700)
    return () => clearTimeout(id)
  }, [phase])

  function handleTap(idx: number) {
    if (phase !== 'playing') return
    setTapped(idx)
    setPhase(deck[idx].isWrong ? 'solved-anim' : 'wrong-choice')
  }

  function unitLabel(unit: TimeCard['fromUnit'] | TimeCard['toUnit'], n: number): string {
    const lookup: Record<string, [string, string]> = {
      year:  [t('tdYear'),  t('tdYears')],
      week:  [t('tdWeek'),  t('tdWeeks')],
      month: [t('tdMonth'), t('tdMonths')],
      day:   [t('tdDay'),   t('tdDays')],
    }
    const [sing, plur] = lookup[unit] ?? [unit, unit]
    return n === 1 ? sing : plur
  }

  function stmtText(card: TimeCard, useStated = true): string {
    const val = useStated ? card.stated : card.correct
    return `${card.n} ${unitLabel(card.fromUnit, card.n)} = ${val} ${unitLabel(card.toUnit, val)}`
  }

  function cardCls(idx: number): string {
    const cls = ['td-card']
    if (phase === 'wrong-choice' && tapped === idx)   cls.push('td-card--wrong-choice')
    if ((phase === 'solved-anim' || phase === 'explain') && idx === wrongIdx) cls.push('td-card--found')
    return cls.join(' ')
  }

  // ── explain ──────────────────────────────────────────────────────────────────
  if (phase === 'explain') {
    const w     = deck[wrongIdx]
    const calc  = CALC[`${w.fromUnit}-${w.toUnit}`]
    const emoji = UNIT_EMOJI[w.fromUnit] ?? '📅'

    return (
      <div className="exercise-card td-explain">
        <ConfettiBurst />
        <p className="td-solved-hd">🕵️ {t('tdSolved')}</p>

        {/* wrong statement — crossed out */}
        <div className="td-explain-stmt td-explain-stmt--wrong">
          <span className="td-strikethrough">{stmtText(w, true)}</span>
          <span className="td-wrong-mark">✗</span>
        </div>

        {/* emoji visual for source quantity */}
        <div className="td-visual td-visual--explain">
          {Array.from({ length: Math.min(w.n, 6) }, (_, i) => (
            <span key={i} className="td-emoji">{emoji}</span>
          ))}
          {w.n > 6 && <span className="td-emoji-more">+{w.n - 6}</span>}
        </div>

        {/* calculation line */}
        {calc && (
          <p className="td-calc">
            {w.n} {calc.op} {calc.factor} = <strong>{w.correct}</strong>
          </p>
        )}

        {/* correct statement */}
        <div className="td-explain-stmt td-explain-stmt--correct">
          <span>{stmtText(w, false)}</span>
          <span className="td-correct-mark">✓</span>
        </div>

        <button className="ice-btn-next" onClick={() => onAnswer(true)}>
          {t('next')} →
        </button>
      </div>
    )
  }

  // ── playing / wrong-choice / solved-anim ────────────────────────────────────
  return (
    <div className="exercise-card td-main">
      {phase === 'solved-anim' && (
        <div className="td-stamp-overlay">
          <div className="td-stamp">🕵️ {t('tdSolved')}</div>
        </div>
      )}

      <p className="exercise-prompt">{t('tdPrompt')}</p>

      <div className="td-cards">
        {deck.map((card, idx) => {
          const emoji = UNIT_EMOJI[card.fromUnit] ?? '📅'
          return (
            <button key={idx} className={cardCls(idx)} onClick={() => handleTap(idx)}>
              <div className="td-card-top">
                <span className="td-label">{LABELS[idx]}</span>
                <span className="td-stmt">{stmtText(card)}</span>
              </div>
              <div className="td-visual">
                {Array.from({ length: Math.min(card.n, 6) }, (_, i) => (
                  <span key={i} className="td-emoji">{emoji}</span>
                ))}
                {card.n > 6 && <span className="td-emoji-more">+{card.n - 6}</span>}
              </div>
            </button>
          )
        })}
      </div>

      {phase === 'wrong-choice' && (
        <p className="td-correct-msg">{t('tdCorrectPick')}</p>
      )}
    </div>
  )
}
