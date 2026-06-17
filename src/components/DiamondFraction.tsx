import { useState } from 'react'
import { Stage, Layer, Line } from 'react-konva'
import { useLang } from '../i18n/LangContext'
import { useContainerWidth } from '../hooks/useContainerWidth'

interface Props {
  targetNumerator: number
  onAnswer: (correct: boolean) => void
}

const DENOMINATOR = 4
const BASE_SIZE = 280
const CX = BASE_SIZE / 2
const CY = BASE_SIZE / 2
const VR = 115  // vertical radius (taller)
const HR = 85   // horizontal radius

const CORNERS = [
  { x: CX,      y: CY - VR },  // top
  { x: CX + HR, y: CY      },  // right
  { x: CX,      y: CY + VR },  // bottom
  { x: CX - HR, y: CY      },  // left
]

const FILLED_COLOR = '#16a34a'
const EMPTY_COLOR  = '#dcfce7'
const STROKE_COLOR = '#86efac'

export default function DiamondFraction({ targetNumerator, onAnswer }: Props) {
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
        dangerouslySetInnerHTML={{ __html: t('shadeDiamond', { n: targetNumerator, d: DENOMINATOR }).replace(/(\d+\/\d+)/, '<strong>$1</strong>') }}
      />
      <div ref={ref} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Stage width={stageSize} height={stageSize}>
          <Layer scaleX={scale} scaleY={scale}>
            {Array.from({ length: DENOMINATOR }, (_, i) => {
              const c1 = CORNERS[i]
              const c2 = CORNERS[(i + 1) % DENOMINATOR]
              return (
                <Line
                  key={i}
                  points={[CX, CY, c1.x, c1.y, c2.x, c2.y]}
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
