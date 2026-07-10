import { useState } from 'react'
import { Stage, Layer, Line } from 'react-konva'
import { useLang } from '../i18n/LangContext'
import { useContainerWidth } from '../hooks/useContainerWidth'
import SpeakPrompt from './SpeakPrompt'
import ShadeProgress from './ShadeProgress'

interface Props {
  denominator: number
  targetNumerator: number
  onAnswer: (correct: boolean) => void
}

const BASE_SIZE = 280
const CX = BASE_SIZE / 2
const CY = BASE_SIZE / 2
const SIDE = 210
const H = SIDE * Math.sqrt(3) / 2

// Centroid placed at canvas center
const TOP   = { x: CX,            y: CY - (2 * H) / 3 }
const BOT_R = { x: CX + SIDE / 2, y: CY + H / 3 }
const BOT_L = { x: CX - SIDE / 2, y: CY + H / 3 }
const EDGES = [[TOP, BOT_R], [BOT_R, BOT_L], [BOT_L, TOP]] as const

// N evenly-spaced points around the triangle perimeter starting at TOP
function perimeterPoints(N: number) {
  return Array.from({ length: N }, (_, i) => {
    const dist = (i / N) * 3 * SIDE
    const edgeIdx = Math.min(2, Math.floor(dist / SIDE))
    const t = (dist - edgeIdx * SIDE) / SIDE
    const [s, e] = EDGES[edgeIdx]
    return { x: s.x + t * (e.x - s.x), y: s.y + t * (e.y - s.y) }
  })
}

const FILLED_COLOR = '#dc2626'
const EMPTY_COLOR  = '#fee2e2'
const STROKE_COLOR = '#fca5a5'
const REVEAL_COLOR = '#22c55e'
const REVEAL_MS = 1400

export default function TriangleFraction({ denominator, targetNumerator, onAnswer }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [revealing, setRevealing] = useState(false)
  const { t } = useLang()
  const { ref, width: containerWidth } = useContainerWidth(BASE_SIZE)

  const scale = Math.min(1, containerWidth / BASE_SIZE)
  const stageSize = BASE_SIZE * scale
  const pts = perimeterPoints(denominator)

  const toggle = (i: number) => {
    if (revealing) return
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const check = () => {
    if (revealing) return
    const correct = selected.size === targetNumerator
    if (correct) { onAnswer(true); return }
    setRevealing(true)
    setTimeout(() => onAnswer(false), REVEAL_MS)
  }

  const promptText = t('shadeTriangle', { n: targetNumerator, d: denominator })
  const promptHtml = promptText.replace(/(\d+\/\d+)/, '<strong>$1</strong>')

  return (
    <div className="exercise-card">
      <SpeakPrompt html={promptHtml} text={promptText} />
      <div ref={ref} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Stage width={stageSize} height={stageSize}>
          <Layer scaleX={scale} scaleY={scale}>
            {Array.from({ length: denominator }, (_, i) => {
              const p1 = pts[i]
              const p2 = pts[(i + 1) % denominator]
              const shaded = revealing ? i < targetNumerator : selected.has(i)
              return (
                <Line
                  key={i}
                  points={[CX, CY, p1.x, p1.y, p2.x, p2.y]}
                  closed
                  fill={shaded ? (revealing ? REVEAL_COLOR : FILLED_COLOR) : EMPTY_COLOR}
                  stroke={STROKE_COLOR}
                  strokeWidth={2}
                  onClick={() => toggle(i)}
                  onTap={() => toggle(i)}
                  style={{ cursor: 'pointer' }}
                />
              )
            })}
          </Layer>
        </Stage>
      </div>
      <ShadeProgress shaded={selected.size} total={denominator} />
      <button className="btn-check" onClick={check} disabled={revealing}>{t('check')}</button>
    </div>
  )
}
