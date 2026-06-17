import { useState } from 'react'
import { Stage, Layer, Line, Circle, Text } from 'react-konva'
import { useLang } from '../i18n/LangContext'
import { useContainerWidth } from '../hooks/useContainerWidth'

const BASE_W = 520
const BASE_H = 170
const LINE_START = 54   // x coordinate for value 0
const LINE_END = 466    // x coordinate for value 2
const LINE_Y = 96
const LINE_LEN = LINE_END - LINE_START

function valueToX(v: number) {
  return LINE_START + (v / 2) * LINE_LEN
}

function xToValue(x: number) {
  return ((x - LINE_START) / LINE_LEN) * 2
}

function snapX(x: number, denominator: number): number {
  const step = 1 / denominator
  const snapped = Math.round(xToValue(x) / step) * step
  return valueToX(Math.max(0, Math.min(2, snapped)))
}

function snappedNum(x: number, denominator: number): number {
  const step = 1 / denominator
  return Math.round(xToValue(x) / step)
}


interface Props {
  numerator: number
  denominator: number
  onAnswer: (correct: boolean) => void
}

export default function NumberLineFraction({ numerator, denominator, onAnswer }: Props) {
  const { t } = useLang()
  const { ref, width: containerWidth } = useContainerWidth(520)
  const scale = Math.min(1, containerWidth / BASE_W)
  const stageW = Math.round(BASE_W * scale)
  const stageH = Math.round(BASE_H * scale)

  const [markerX, setMarkerX] = useState(() => valueToX(1))
  const [isDragging, setIsDragging] = useState(false)

  const sx = snapX(markerX, denominator)
  const sn = snappedNum(markerX, denominator)
  const displayX = isDragging ? markerX : sx

  const targetValue = numerator / denominator
  const isCorrect = Math.abs(sn / denominator - targetValue) < 0.001

  // Ticks: 0 through 2*denominator
  const tickCount = 2 * denominator
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => ({
    i,
    x: valueToX(i / denominator),
    isMajor: i % denominator === 0,
  }))

  return (
    <div className="exercise-card">
      <p className="exercise-prompt">{t('dragMarker', { n: numerator, d: denominator })}</p>
      <div ref={ref} style={{ width: '100%' }}>
        <Stage width={stageW} height={stageH}>
          <Layer scaleX={scale} scaleY={scale}>

            {/* Track: unfilled portion */}
            <Line
              points={[LINE_START, LINE_Y, LINE_END, LINE_Y]}
              stroke="#e5e7eb"
              strokeWidth={8}
              lineCap="round"
            />
            {/* Track: filled portion 0 → snap position */}
            <Line
              points={[LINE_START, LINE_Y, sx, LINE_Y]}
              stroke="#fdba74"
              strokeWidth={8}
              lineCap="round"
            />

            {/* Minor ticks */}
            {ticks.filter(t => !t.isMajor).map(({ i, x }) => (
              <Line
                key={`tick-${i}`}
                points={[x, LINE_Y - 7, x, LINE_Y + 7]}
                stroke="#d1d5db"
                strokeWidth={1.5}
              />
            ))}

            {/* Major ticks + labels */}
            {ticks.filter(t => t.isMajor).map(({ i, x }) => (
              [
                <Line
                  key={`maj-${i}`}
                  points={[x, LINE_Y - 16, x, LINE_Y + 16]}
                  stroke="#6b7280"
                  strokeWidth={2.5}
                />,
                <Text
                  key={`lbl-${i}`}
                  x={x - 8}
                  y={LINE_Y + 22}
                  width={16}
                  text={String(i / denominator)}
                  fontSize={15}
                  fill="#374151"
                  align="center"
                  fontFamily="OpenDyslexic, sans-serif"
                />,
              ]
            ))}

            {/* Snap ghost shown while dragging */}
            {isDragging && sx !== displayX && (
              <Circle
                x={sx}
                y={LINE_Y}
                radius={15}
                fill="#fdba74"
                opacity={0.55}
              />
            )}

            {/* Draggable marker */}
            <Circle
              x={displayX}
              y={LINE_Y}
              radius={17}
              fill="#f97316"
              stroke="#c2410c"
              strokeWidth={3}
              shadowColor="rgba(0,0,0,0.22)"
              shadowBlur={isDragging ? 12 : 5}
              shadowOffsetY={isDragging ? 4 : 2}
              draggable
              dragBoundFunc={(pos) => ({
                x: Math.max(LINE_START * scale, Math.min(LINE_END * scale, pos.x)),
                y: LINE_Y * scale,
              })}
              onDragStart={() => setIsDragging(true)}
              onDragMove={(e) => setMarkerX(e.target.x())}
              onDragEnd={(e) => {
                const snapped = snapX(e.target.x(), denominator)
                e.target.x(snapped)
                setMarkerX(snapped)
                setIsDragging(false)
              }}
            />

          </Layer>
        </Stage>
      </div>
      <button className="btn-check" onClick={() => onAnswer(isCorrect)}>
        {t('check')}
      </button>
    </div>
  )
}
