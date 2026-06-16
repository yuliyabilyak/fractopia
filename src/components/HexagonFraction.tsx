import { useState } from 'react'
import { Stage, Layer, Line, RegularPolygon } from 'react-konva'

interface Props {
  targetNumerator: number
  onAnswer: (correct: boolean) => void
}

const SIZE = 280
const CX = SIZE / 2
const CY = SIZE / 2
const R = 110
const DENOMINATOR = 6
const FILLED_COLOR = '#10b981'
const EMPTY_COLOR = '#d1fae5'
const STROKE_COLOR = '#059669'

function hexVertex(i: number) {
  const angle = ((i * 60 - 90) * Math.PI) / 180
  return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) }
}

export default function HexagonFraction({ targetNumerator, onAnswer }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())

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
      <p className="exercise-prompt">
        Tap <strong>{targetNumerator}/{DENOMINATOR}</strong> parts of the hexagon
      </p>
      <Stage width={SIZE} height={SIZE}>
        <Layer>
          <RegularPolygon
            x={CX} y={CY}
            sides={6} radius={R + 2}
            fill={STROKE_COLOR}
          />
          {Array.from({ length: DENOMINATOR }, (_, i) => {
            const v1 = hexVertex(i)
            const v2 = hexVertex(i + 1)
            return (
              <Line
                key={i}
                points={[CX, CY, v1.x, v1.y, v2.x, v2.y]}
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
      <button className="btn-check" onClick={check}>Check</button>
    </div>
  )
}
