// FractionDetective — spot the one incorrect comparison among three cards.
// Child taps the wrong one; correct choices flash "actually correct, try again".

import { useState, useEffect, useMemo } from 'react'
import { useLang } from '../i18n/LangContext'
import ConfettiBurst from './ConfettiBurst'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DetectiveCard {
  leftN:  number
  leftD:  number
  op:     '>' | '<'
  rightN: number
  rightD: number
  isWrong: boolean
}

type Phase = 'playing' | 'wrong-choice' | 'solved-anim' | 'explain'

// ── Mini fraction bar ─────────────────────────────────────────────────────────

function MiniBar({ n, d }: { n: number; d: number }) {
  const groups = Math.max(1, Math.ceil(n / d))
  return (
    <div className="fd-bar-wrap">
      {Array.from({ length: groups }, (_, gi) => (
        <div key={gi} className="fd-bar-group">
          {Array.from({ length: d }, (_, si) => (
            <div
              key={si}
              className={`fd-seg${gi * d + si < n ? ' fd-seg--on' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Fraction token (stacked) ──────────────────────────────────────────────────

function FracToken({ n, d }: { n: number; d: number }) {
  if (d === 1) return <span className="fd-whole">{n}</span>
  return (
    <span className="fd-frac">
      <span className="fd-frac-n">{n}</span>
      <span className="fd-frac-line" />
      <span className="fd-frac-d">{d}</span>
    </span>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

interface Props {
  cards:    DetectiveCard[]
  onAnswer: (correct: boolean) => void
}

const LABELS = ['A', 'B', 'C']

export default function FractionDetective({ cards, onAnswer }: Props) {
  const { t } = useLang()
  const [phase,  setPhase]  = useState<Phase>('playing')
  const [tapped, setTapped] = useState<number | null>(null)

  // shuffle once so the wrong card isn't always in the same slot
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

  function cardCls(idx: number) {
    const cls = ['fd-card']
    if (phase === 'wrong-choice' && tapped === idx)   cls.push('fd-card--wrong-choice')
    if ((phase === 'solved-anim' || phase === 'explain') && idx === wrongIdx) cls.push('fd-card--found')
    return cls.join(' ')
  }

  // ── explain ──
  if (phase === 'explain') {
    const w         = deck[wrongIdx]
    const leftVal   = w.leftN  / w.leftD
    const rightVal  = w.rightN / w.rightD
    const actualOp  = leftVal > rightVal ? '>' : leftVal < rightVal ? '<' : '='

    return (
      <div className="exercise-card fd-explain">
        <ConfettiBurst />
        <p className="fd-solved-hd">🕵️ {t('fdSolved')}</p>

        {/* the wrong comparison, crossed out */}
        <div className="fd-explain-wrong">
          <FracToken n={w.leftN} d={w.leftD} />
          <span className="fd-op fd-op--wrong">{w.op}</span>
          <FracToken n={w.rightN} d={w.rightD} />
          <span className="fd-wrong-mark">✗</span>
        </div>

        {/* visual bars for both sides */}
        <div className="fd-explain-bars">
          <div className="fd-explain-bar-row">
            <span className="fd-bar-lbl"><FracToken n={w.leftN} d={w.leftD} /></span>
            <MiniBar n={w.leftN} d={w.leftD} />
          </div>
          <div className="fd-explain-bar-row">
            <span className="fd-bar-lbl"><FracToken n={w.rightN} d={w.rightD} /></span>
            <MiniBar n={w.rightN} d={w.rightD} />
          </div>
        </div>

        {/* correct relationship */}
        <div className="fd-explain-correct">
          <FracToken n={w.leftN} d={w.leftD} />
          <span className="fd-op fd-op--correct">{actualOp}</span>
          <FracToken n={w.rightN} d={w.rightD} />
          <span className="fd-correct-mark">✓</span>
        </div>

        <button className="ice-btn-next" onClick={() => onAnswer(true)}>
          {t('next')} →
        </button>
      </div>
    )
  }

  // ── playing / wrong-choice / solved-anim ──
  return (
    <div className="exercise-card fd-main">
      {phase === 'solved-anim' && (
        <div className="fd-stamp-overlay">
          <div className="fd-stamp">{t('fdSolved')} 🕵️</div>
        </div>
      )}

      <p className="exercise-prompt">{t('fdPrompt')}</p>

      <div className="fd-cards">
        {deck.map((card, idx) => (
          <button
            key={idx}
            className={cardCls(idx)}
            onClick={() => handleTap(idx)}
          >
            <span className="fd-label">{LABELS[idx]}</span>
            <div className="fd-comparison">
              <FracToken n={card.leftN} d={card.leftD} />
              <span className="fd-op">{card.op}</span>
              <FracToken n={card.rightN} d={card.rightD} />
            </div>
            <div className="fd-card-bars">
              <MiniBar n={card.leftN}  d={card.leftD} />
              <MiniBar n={card.rightN} d={card.rightD} />
            </div>
          </button>
        ))}
      </div>

      {phase === 'wrong-choice' && (
        <p className="fd-correct-msg">{t('fdCorrectPick')}</p>
      )}
    </div>
  )
}
