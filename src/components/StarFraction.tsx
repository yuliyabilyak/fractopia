import { useState } from 'react'
import { Stage, Layer, Line } from 'react-konva'
import { useLang } from '../i18n/LangContext'
import { useContainerWidth } from '../hooks/useContainerWidth'

interface Props {
  targetNumerator: number
  onAnswer: (correct: boolean) => void
}

const DENOMINATOR = 5
const BASE_SIZE = 280
const CX = BASE_SIZE / 2
const CY = BASE_SIZE / 2
const OUTER_R = 105
const INNER_R = 40  // ≈ OUTER_R × 0.382 (golden star ratio)

const FILLED_COLOR = '#f97316'
const EMPTY_COLOR  = '#fff7ed'
const STROKE_COLOR = '#fdba74'

function outerPt(i: number) {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / DENOMINATOR
  return { x: CX + OUTER_R * Math.cos(a), y: CY + OUTER_R * Math.sin(a) }
}

function innerPt(i: number) {
  const a = -Math.PI / 2 + Math.PI / DENOMINATOR + (i * 2 * Math.PI) / DENOMINATOR
  return { x: CX + INNER_R * Math.cos(a), y: CY + INNER_R * Math.sin(a) }
}

export default function StarFraction({ targetNumerator, onAnswer }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const { t } = useLang()
  const { ref, width: containerWidth } = useContainerWidth(BASE_SIZE)

  const scale = Math.min(1, containerWidth / BASE_SIZE)
  const stageSize = BASE_SIZE * scale

  const toggle = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const check = () => onAnswer(selected.size === targetNumerator)

  return (
    <div className="exercise-card">
      <p className="exercise-prompt"
        dangerouslySetInnerHTML={{ __html: t('tapStar', { n: targetNumerator, d: DENOMINATOR }).replace(/(\d+\/\d+)/, '<strong>$1</strong>') }}
      />
      <div ref={ref} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Stage width={stageSize} height={stageSize}>
          <Layer scaleX={scale} scaleY={scale}>
            {/* Each sector is a kite from center through two inner vertices and one outer tip.
                Together the 5 kites tile the entire star, so stroke forms both the outer
                zigzag boundary and the interior dividing lines. */}
            {Array.from({ length: DENOMINATOR }, (_, i) => {
              const prev = innerPt((i - 1 + DENOMINATOR) % DENOMINATOR)
              const out  = outerPt(i)
              const next = innerPt(i)
              return (
                <Line
                  key={i}
                  points={[CX, CY, prev.x, prev.y, out.x, out.y, next.x, next.y]}
                  closed
                  fill={selected.has(i) ? FILLED_COLOR : EMPTY_COLOR}
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
      <button className="btn-check" onClick={check}>{t('check')}</button>
    </div>
  )
}
