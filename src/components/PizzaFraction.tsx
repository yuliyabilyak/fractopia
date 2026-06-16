import { useState } from 'react'
import { Stage, Layer, Arc, Circle } from 'react-konva'
import { useLang } from '../i18n/LangContext'

interface Props {
  denominator: number
  targetNumerator: number
  onAnswer: (correct: boolean) => void
}

const SIZE = 280
const CX = SIZE / 2
const CY = SIZE / 2
const RADIUS = 110
const FILLED_COLOR = '#FF8C42'
const EMPTY_COLOR = '#FFF0E0'
const STROKE_COLOR = '#E06B1A'

export default function PizzaFraction({ denominator, targetNumerator, onAnswer }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const { t } = useLang()

  const sliceDeg = 360 / denominator

  const toggle = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const check = () => {
    onAnswer(selected.size === targetNumerator)
  }

  return (
    <div className="exercise-card">
      <p className="exercise-prompt"
        dangerouslySetInnerHTML={{ __html: t('tapPizza', { n: targetNumerator, d: denominator }).replace(/(\d+\/\d+)/, '<strong>$1</strong>') }}
      />
      <Stage width={SIZE} height={SIZE}>
        <Layer>
          <Circle x={CX} y={CY} radius={RADIUS + 2} fill={STROKE_COLOR} />
          {Array.from({ length: denominator }, (_, i) => {
            const startAngle = i * sliceDeg - 90
            return (
              <Arc
                key={i}
                x={CX}
                y={CY}
                innerRadius={0}
                outerRadius={RADIUS}
                angle={sliceDeg - 1}
                rotation={startAngle}
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
      <button className="btn-check" onClick={check}>{t('check')}</button>
    </div>
  )
}
