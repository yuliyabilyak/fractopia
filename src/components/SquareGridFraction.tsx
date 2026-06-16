import { useState } from 'react'
import { Stage, Layer, Rect } from 'react-konva'

interface Props {
  cols: number
  rows: number
  targetNumerator: number
  onAnswer: (correct: boolean) => void
}

const GRID_SIZE = 280
const PAD = 20
const FILLED_COLOR = '#f59e0b'
const EMPTY_COLOR = '#fef3c7'
const STROKE_COLOR = '#d97706'

export default function SquareGridFraction({ cols, rows, targetNumerator, onAnswer }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const denominator = cols * rows
  const cellW = (GRID_SIZE - PAD * 2) / cols
  const cellH = (GRID_SIZE - PAD * 2) / rows

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
        Tap <strong>{targetNumerator}/{denominator}</strong> squares
      </p>
      <Stage width={GRID_SIZE} height={GRID_SIZE}>
        <Layer>
          {Array.from({ length: denominator }, (_, i) => {
            const col = i % cols
            const row = Math.floor(i / cols)
            const x = PAD + col * cellW
            const y = PAD + row * cellH
            return (
              <Rect
                key={i}
                x={x} y={y}
                width={cellW} height={cellH}
                fill={selected.has(i) ? FILLED_COLOR : EMPTY_COLOR}
                stroke={STROKE_COLOR}
                strokeWidth={2}
                cornerRadius={4}
                onClick={() => toggle(i)}
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
