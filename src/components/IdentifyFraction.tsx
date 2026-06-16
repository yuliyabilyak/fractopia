import { Stage, Layer, Rect, Arc, Circle } from 'react-konva'
import type { Fraction } from '../types'
import { useLang } from '../i18n/LangContext'

interface Props {
  shape: 'bar' | 'pizza' | 'grid'
  denominator: number
  numerator: number
  cols?: number
  rows?: number
  choices: Fraction[]
  correctIndex: number
  onAnswer: (correct: boolean) => void
}

function StaticBar({ denominator, numerator }: { denominator: number; numerator: number }) {
  const W = 480, H = 72
  const sliceW = W / denominator
  return (
    <Stage width={W} height={H}>
      <Layer>
        {Array.from({ length: denominator }, (_, i) => (
          <Rect
            key={i}
            x={i * sliceW} y={0}
            width={sliceW} height={H}
            fill={i < numerator ? '#6C63FF' : '#E8E8F0'}
            stroke="#9B97D4" strokeWidth={2}
            cornerRadius={i === 0 ? [8, 0, 0, 8] : i === denominator - 1 ? [0, 8, 8, 0] : 0}
          />
        ))}
      </Layer>
    </Stage>
  )
}

function StaticPizza({ denominator, numerator }: { denominator: number; numerator: number }) {
  const SIZE = 220, CX = SIZE / 2, CY = SIZE / 2, R = 95
  const sliceDeg = 360 / denominator
  return (
    <Stage width={SIZE} height={SIZE}>
      <Layer>
        <Circle x={CX} y={CY} radius={R + 2} fill="#E06B1A" />
        {Array.from({ length: denominator }, (_, i) => (
          <Arc
            key={i}
            x={CX} y={CY}
            innerRadius={0} outerRadius={R}
            angle={sliceDeg - 1}
            rotation={i * sliceDeg - 90}
            fill={i < numerator ? '#FF8C42' : '#FFF0E0'}
            stroke="#E06B1A" strokeWidth={2}
          />
        ))}
      </Layer>
    </Stage>
  )
}

function StaticGrid({ cols, rows, numerator }: { cols: number; rows: number; numerator: number }) {
  const SIZE = 220, PAD = 16
  const denominator = cols * rows
  const cellW = (SIZE - PAD * 2) / cols
  const cellH = (SIZE - PAD * 2) / rows
  return (
    <Stage width={SIZE} height={SIZE}>
      <Layer>
        {Array.from({ length: denominator }, (_, i) => {
          const col = i % cols, row = Math.floor(i / cols)
          return (
            <Rect
              key={i}
              x={PAD + col * cellW} y={PAD + row * cellH}
              width={cellW} height={cellH}
              fill={i < numerator ? '#f59e0b' : '#fef3c7'}
              stroke="#d97706" strokeWidth={2}
              cornerRadius={4}
            />
          )
        })}
      </Layer>
    </Stage>
  )
}

export default function IdentifyFraction({ shape, denominator, numerator, cols, rows, choices, correctIndex, onAnswer }: Props) {
  const { t } = useLang()
  return (
    <div className="exercise-card">
      <p className="exercise-prompt">{t('identify')}</p>
      {shape === 'bar' && <StaticBar denominator={denominator} numerator={numerator} />}
      {shape === 'pizza' && <StaticPizza denominator={denominator} numerator={numerator} />}
      {shape === 'grid' && cols && rows && <StaticGrid cols={cols} rows={rows} numerator={numerator} />}
      <div className="compare-btns">
        {choices.map((c, i) => (
          <button key={i} className="btn-choice" onClick={() => onAnswer(i === correctIndex)}>
            {c.numerator}/{c.denominator}
          </button>
        ))}
      </div>
    </div>
  )
}
