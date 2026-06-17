import { useState } from 'react'
import { Stage, Layer, Arc, Circle } from 'react-konva'
import { useLang } from '../i18n/LangContext'
import { useContainerWidth } from '../hooks/useContainerWidth'

interface Props {
  denominator: number
  targetNumerator: number
  onAnswer: (correct: boolean) => void
}

const BASE_SIZE = 280
const CX = BASE_SIZE / 2
const CY = BASE_SIZE / 2
const RADIUS = 110
const FILLED_COLOR = '#FF8C42'
const EMPTY_COLOR = '#FFF0E0'
const STROKE_COLOR = '#E06B1A'

export default function PizzaFraction({ denominator, targetNumerator, onAnswer }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const { t } = useLang()
  const { ref, width: containerWidth } = useContainerWidth(BASE_SIZE)

  const scale = Math.min(1, containerWidth / BASE_SIZE)
  const stageSize = BASE_SIZE * scale
  const sliceDeg = 360 / denominator

  const toggle = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const check = () => onAnswer(selected.size === targetNumerator)

  return (
    <div className="exercise-card">
      <p className="exercise-prompt"
        dangerouslySetInnerHTML={{ __html: t('tapPizza', { n: targetNumerator, d: denominator }).replace(/(\d+\/\d+)/, '<strong>$1</strong>') }}
      />
      <div ref={ref} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Stage width={stageSize} height={stageSize}>
          <Layer scaleX={scale} scaleY={scale}>
            <Circle x={CX} y={CY} radius={RADIUS + 2} fill={STROKE_COLOR} />
            {Array.from({ length: denominator }, (_, i) => (
              <Arc
                key={i}
                x={CX} y={CY}
                innerRadius={0}
                outerRadius={RADIUS}
                angle={sliceDeg - 1}
                rotation={i * sliceDeg - 90}
                fill={selected.has(i) ? FILLED_COLOR : EMPTY_COLOR}
                stroke={STROKE_COLOR}
                strokeWidth={2}
                onClick={() => toggle(i)}
                onTap={() => toggle(i)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </Layer>
        </Stage>
      </div>
      <button className="btn-check" onClick={check}>{t('check')}</button>
    </div>
  )
}
