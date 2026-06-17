import { useEffect, useRef } from 'react'
import { useLang } from '../i18n/LangContext'
import { playVictorySound } from '../utils/sounds'
import ConfettiBurst from './ConfettiBurst'

const SVG_W = 260
const SVG_H = 300
const CX = 130
const CY = 120
const R = 90
const N = 6
const USER_SLICE = 2
// OFFSET = π/6 rotates so slice USER_SLICE midAngle lands at π/2 (pointing down)
const OFFSET = Math.PI / 6
const SPREAD = 22
const USER_SPREAD = 62
const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

function slicePath(i: number, cx: number, cy: number): string {
  const start = (i / N) * 2 * Math.PI - Math.PI / 2 + OFFSET
  const end = ((i + 1) / N) * 2 * Math.PI - Math.PI / 2 + OFFSET
  const x1 = cx + R * Math.cos(start)
  const y1 = cy + R * Math.sin(start)
  const x2 = cx + R * Math.cos(end)
  const y2 = cy + R * Math.sin(end)
  return `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`
}

function sliceOffset(i: number): { dx: number; dy: number } {
  const mid = ((i + 0.5) / N) * 2 * Math.PI - Math.PI / 2 + OFFSET
  const dist = i === USER_SLICE ? USER_SPREAD : SPREAD
  return { dx: Math.cos(mid) * dist, dy: Math.sin(mid) * dist }
}

const SLICE_COLORS = [
  '#fdba74', '#fca5a5', '#86efac', '#FF8C42', '#fde68a', '#c4b5fd',
]
const STROKE_COLORS = [
  '#f97316', '#dc2626', '#16a34a', '#c2410c', '#d97706', '#7c3aed',
]

export default function PerfectScoreAnimation() {
  const { t } = useLang()
  const played = useRef(false)

  useEffect(() => {
    if (!played.current) {
      played.current = true
      playVictorySound()
    }
  }, [])

  // Toppings on user slice — placed roughly inside the slice wedge
  const userMid = ((USER_SLICE + 0.5) / N) * 2 * Math.PI - Math.PI / 2 + OFFSET
  const { dx: udx, dy: udy } = sliceOffset(USER_SLICE)
  const ucx = CX + udx
  const ucy = CY + udy
  const toppingAngle = userMid
  const toppings = [
    { x: ucx + Math.cos(toppingAngle) * 28 - Math.sin(toppingAngle) * 10, y: ucy + Math.sin(toppingAngle) * 28 + Math.cos(toppingAngle) * 10 },
    { x: ucx + Math.cos(toppingAngle) * 28 + Math.sin(toppingAngle) * 10, y: ucy + Math.sin(toppingAngle) * 28 - Math.cos(toppingAngle) * 10 },
    { x: ucx + Math.cos(toppingAngle) * 50, y: ucy + Math.sin(toppingAngle) * 50 },
  ]

  return (
    <div className="perfect-animation-wrapper" aria-live="polite">
      <ConfettiBurst />
      <h2 className="perfect-title">{t('perfectTitle')}</h2>
      <svg
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        aria-hidden="true"
      >
        {Array.from({ length: N }, (_, i) => {
          const { dx, dy } = sliceOffset(i)
          const isUser = i === USER_SLICE
          return (
            <g
              key={i}
              style={{
                transform: `translate(${dx}px, ${dy}px)`,
                transition: `transform 0.55s ${SPRING} ${i * 0.06}s`,
                filter: isUser ? 'drop-shadow(0 4px 10px rgba(194,65,12,0.40))' : undefined,
              }}
            >
              <path
                d={slicePath(i, CX, CY)}
                fill={SLICE_COLORS[i]}
                stroke={STROKE_COLORS[i]}
                strokeWidth={2.5}
              />
              {isUser && toppings.map((tp, ti) => (
                <circle
                  key={ti}
                  cx={tp.x - dx}
                  cy={tp.y - dy}
                  r={4.5}
                  fill="#c2410c"
                  opacity={0.85}
                />
              ))}
            </g>
          )
        })}
      </svg>
      <p
        className="perfect-your-slice"
        style={{ animationDelay: '0.7s' }}
      >
        {t('yourSlice')}
      </p>
    </div>
  )
}
