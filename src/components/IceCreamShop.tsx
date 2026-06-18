// IceCreamShop — improper-fraction-to-whole-number exercise
// Child acts as an ice cream shop worker stacking scoops onto a cone.
// The discovery: an improper fraction that divides evenly IS a whole number.

import { useState, useEffect, useRef } from 'react'
import { useLang } from '../i18n/LangContext'
import ConfettiBurst from './ConfettiBurst'

// ── Colours ───────────────────────────────────────────────────────────────────

const SCOOP_FILLS   = ['#F9A8C9', '#A8E6CF', '#FFF3B0', '#C4956A', '#B8A4E8', '#FDE68A']
const SCOOP_STROKES = ['#E5689A', '#3D9970', '#DBA600', '#8B5E3C', '#7C4DBC', '#F59E0B']
// Pre-determined horizontal wobbles so the stack looks hand-built, not mechanical
const WOBBLES = [-3, 4, -2, 5, -4, 2, -5, 3, -1, 4, -3, 2]

// ── SVG layout constants ──────────────────────────────────────────────────────

const CONE_CX      = 100   // horizontal centre of cone in viewBox
const SCOOP_BASE_Y = 228   // cy of the bottom scoop
const SCOOP_GAP    = 50    // vertical distance between consecutive scoop centres

// ── Web Audio helpers ─────────────────────────────────────────────────────────

function _tone(
  ctx: AudioContext,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = 'sine',
  vol = 0.25,
) {
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = type; osc.frequency.value = freq
  gain.gain.setValueAtTime(vol, ctx.currentTime + start)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur)
  osc.start(ctx.currentTime + start)
  osc.stop(ctx.currentTime + start + dur + 0.05)
}

// Hook encapsulating all sounds for this exercise
function useScoopSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  function ac() {
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    return ctxRef.current
  }

  return {
    // Soft thud when a scoop lands
    playThud: () => {
      try { const c = ac(); _tone(c, 220, 0, 0.14, 'triangle', 0.3); _tone(c, 155, 0.06, 0.12, 'triangle', 0.15) } catch { /* no audio */ }
    },
    // Light pop when a scoop is removed
    playPop: () => {
      try { const c = ac(); _tone(c, 700, 0, 0.05, 'sine', 0.22); _tone(c, 450, 0.04, 0.09, 'sine', 0.14) } catch { /* no audio */ }
    },
  }
}

// ── Puzzle state hook ─────────────────────────────────────────────────────────

// Manages scoop count and phase for one puzzle instance.
// Component is remounted per exercise (key={index} in Fractions.tsx), so no reset logic needed.
type Phase = 'playing' | 'settling' | 'done'

function useIceCreamPuzzle(targetResult: number) {
  const [scoops, setScoops] = useState(0)
  const [phase,  setPhase]  = useState<Phase>('playing')

  // Brief settling pause after the last scoop so the bounce animation completes
  useEffect(() => {
    if (phase !== 'settling') return
    const t = setTimeout(() => setPhase('done'), 420)
    return () => clearTimeout(t)
  }, [phase])

  function addScoop(): boolean {
    if (phase !== 'playing' || scoops >= targetResult) return false
    const next = scoops + 1
    setScoops(next)
    if (next === targetResult) setPhase('settling')
    return true
  }

  function removeScoop() {
    if (phase !== 'playing' || scoops === 0) return
    setScoops(s => s - 1)
  }

  return { scoops, phase, addScoop, removeScoop }
}

// ── FractionLabel ─────────────────────────────────────────────────────────────

// Dyslexia-friendly stacked fraction: uses existing .frac-display / .frac-n etc.
function FractionLabel({ n, d, cls = '' }: { n: number; d: number; cls?: string }) {
  return (
    <span className={`frac-display ${cls}`}>
      <span className="frac-n">{n}</span>
      <span className="frac-bar-line" />
      <span className="frac-d">{d}</span>
    </span>
  )
}

// ── Scoop ─────────────────────────────────────────────────────────────────────

// Single SVG scoop with a unique horizontal wobble and specular highlight.
// `fresh` triggers the CSS bounce-in animation.
function Scoop({ idx, cx, cy, fresh }: { idx: number; cx: number; cy: number; fresh: boolean }) {
  const fill   = SCOOP_FILLS[idx % SCOOP_FILLS.length]
  const stroke = SCOOP_STROKES[idx % SCOOP_STROKES.length]
  const wx     = cx + WOBBLES[idx % WOBBLES.length]
  return (
    <g className={fresh ? 'ice-scoop--new' : undefined}>
      <ellipse cx={wx} cy={cy} rx={44} ry={26} fill={fill} stroke={stroke} strokeWidth="2" />
      <ellipse cx={wx - 11} cy={cy - 8} rx={13} ry={8} fill="white" opacity="0.38" />
    </g>
  )
}

// ── IceCreamCone SVG ──────────────────────────────────────────────────────────

// Renders the waffle cone with scoops stacked above it.
// Scoops are drawn before the cone so the rim naturally overlaps the bottom scoop.
function IceCreamCone({ count, wiggle }: { count: number; wiggle: boolean }) {
  const [freshIdx, setFreshIdx] = useState<number | null>(null)
  const prevCount = useRef(0)

  useEffect(() => {
    if (count > prevCount.current) {
      setFreshIdx(count - 1)
      const t = setTimeout(() => setFreshIdx(null), 520)
      prevCount.current = count
      return () => clearTimeout(t)
    }
    prevCount.current = count
  }, [count])

  return (
    <svg
      viewBox="0 0 200 380"
      className={`ice-cone-svg${wiggle ? ' ice-cone--wiggle' : ''}`}
      aria-hidden
    >
      <defs>
        <pattern id="ice-waffle" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="14" y2="14" stroke="#996633" strokeWidth="0.85" opacity="0.5" />
          <line x1="14" y1="0" x2="0" y2="14" stroke="#996633" strokeWidth="0.85" opacity="0.5" />
        </pattern>
        <clipPath id="ice-cone-clip">
          <polygon points="100,372 30,240 170,240" />
        </clipPath>
      </defs>

      {/* Scoops first so cone rim overlaps lowest scoop */}
      {Array.from({ length: count }, (_, i) => (
        <Scoop
          key={i}
          idx={i}
          cx={CONE_CX}
          cy={SCOOP_BASE_Y - i * SCOOP_GAP}
          fresh={i === freshIdx}
        />
      ))}

      {/* Cone body */}
      <polygon points="100,372 30,240 170,240" fill="#D4956A" />
      <rect x="0" y="240" width="200" height="132" fill="url(#ice-waffle)" clipPath="url(#ice-cone-clip)" />
      <polygon points="100,372 30,240 170,240" fill="none" stroke="#A0643A" strokeWidth="2" />
      {/* Rim — sits on top, partially hiding the bottom scoop for a "sitting in cone" look */}
      <ellipse cx="100" cy="240" rx="70" ry="12" fill="#E8A878" stroke="#A0643A" strokeWidth="2" />
    </svg>
  )
}

// ── OrderTicket ───────────────────────────────────────────────────────────────

// Chalkboard-style order card showing the fraction target and live scoop count.
function OrderTicket({ n, d, scoops, result }: { n: number; d: number; scoops: number; result: number }) {
  return (
    <div className="ice-ticket">
      <span className="ice-ticket-header">📋 Order</span>
      <div className="ice-ticket-frac-row">
        <FractionLabel n={n} d={d} cls="ice-frac--order" />
        <span className="ice-ticket-unit">scoops</span>
      </div>
      <p className="ice-ticket-counter">
        <strong className="ice-ticket-count">{scoops}</strong>
        <span className="ice-ticket-sep"> / {result} scoops so far</span>
      </p>
    </div>
  )
}

// ── DiscoveryReveal ───────────────────────────────────────────────────────────

// The celebration moment: fraction slides into an equation, whole number counts up,
// confetti bursts, C5-E5-G5 chime plays.
function DiscoveryReveal({ n, d, result, onNext }: {
  n: number; d: number; result: number; onNext: () => void
}) {
  const [count, setBurst] = useState(0)
  const [showBurst, setShowBurst] = useState(false)

  useEffect(() => {
    let iv: ReturnType<typeof setInterval>

    const start = setTimeout(() => {
      // Play C5 → E5 → G5 chime inline — avoids hook dependency issues in effect
      try {
        const c = new AudioContext()
        _tone(c, 523.25, 0,    0.15)
        _tone(c, 659.25, 0.08, 0.15)
        _tone(c, 783.99, 0.16, 0.35)
      } catch { /* no audio */ }

      setShowBurst(true)
      let cur = 0
      iv = setInterval(() => {
        cur++
        setBurst(cur)
        if (cur >= result) clearInterval(iv)
      }, 190)
    }, 340)

    return () => { clearTimeout(start); clearInterval(iv) }
  // result is a stable integer prop for this component's lifetime
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="ice-discovery">
      {showBurst && <ConfettiBurst />}
      <div className="ice-discovery-eq">
        <FractionLabel n={n} d={d} cls="ice-frac--reveal" />
        <span className="ice-eq-sign">=</span>
        <span className="ice-eq-whole">{count}</span>
      </div>
      <p className="ice-discovery-msg">🎉 A perfect whole number!</p>
      <button className="ice-btn-next" onClick={onNext}>
        Next Order →
      </button>
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────

interface Props {
  numerator:   number
  denominator: number
  onAnswer: (correct: boolean) => void
}

export default function IceCreamShop({ numerator, denominator, onAnswer }: Props) {
  const { t }    = useLang()
  const result   = numerator / denominator   // always a whole number for these puzzles
  const { scoops, phase, addScoop, removeScoop } = useIceCreamPuzzle(result)
  const sound    = useScoopSound()

  function handleAdd() {
    if (addScoop()) sound.playThud()
  }

  function handleRemove() {
    removeScoop()
    sound.playPop()
  }

  const isSettling = phase === 'settling'
  const isDone     = phase === 'done'

  return (
    <div className="exercise-card">
      <p className="exercise-prompt">
        {t('iceCreamPrompt', { n: numerator, d: denominator })}
      </p>

      <OrderTicket n={numerator} d={denominator} scoops={scoops} result={result} />

      <div className="ice-cone-scene">
        <IceCreamCone count={scoops} wiggle={isSettling || isDone} />
      </div>

      {!isDone ? (
        <div className="ice-controls">
          <button
            className="ice-btn-add"
            onClick={handleAdd}
            disabled={scoops >= result || isSettling}
            aria-label="Add one scoop of ice cream"
          >
            🍦 Add Scoop
          </button>
          {scoops > 0 && !isSettling && (
            <button
              className="ice-btn-remove"
              onClick={handleRemove}
              aria-label="Remove the top scoop"
            >
              ↩ Remove top scoop
            </button>
          )}
        </div>
      ) : (
        <DiscoveryReveal
          n={numerator}
          d={denominator}
          result={result}
          onNext={() => onAnswer(true)}
        />
      )}
    </div>
  )
}
