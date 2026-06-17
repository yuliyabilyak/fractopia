import { useState } from 'react'
import { Stage, Layer, Arc, Circle, Text } from 'react-konva'
import { useLang } from '../i18n/LangContext'
import { useContainerWidth } from '../hooks/useContainerWidth'

const BASE_W = 560
const BASE_H = 265
const R = 100
const CY = 118
const CX_L = 118
const CX_R = 442

const FILLED  = '#FF8C42'
const EMPTY   = '#FFF0E0'
const STROKE  = '#E06B1A'
const BORDER_INTERACTIVE = '#d1d5db'

interface Props {
  leftNumerator: number
  leftDenominator: number
  rightDenominator: number
  onAnswer: (correct: boolean) => void
}

export default function EquivalentFractions({
  leftNumerator,
  leftDenominator,
  rightDenominator,
  onAnswer,
}: Props) {
  const { t } = useLang()
  const { ref, width: containerWidth } = useContainerWidth(BASE_W)
  const scale = Math.min(1, containerWidth / BASE_W)
  const stageW = Math.round(BASE_W * scale)
  const stageH = Math.round(BASE_H * scale)

  const [selected, setSelected] = useState<Set<number>>(new Set())

  const targetNumerator = (leftNumerator * rightDenominator) / leftDenominator

  const toggle = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const isCorrect = selected.size === targetNumerator

  const leftSliceDeg  = 360 / leftDenominator
  const rightSliceDeg = 360 / rightDenominator

  return (
    <div className="exercise-card">
      <p className="exercise-prompt">{t('matchEquivalent')}</p>
      <div ref={ref} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Stage width={stageW} height={stageH}>
          <Layer scaleX={scale} scaleY={scale}>

            {/* ── Left pie (static reference) ── */}
            <Circle x={CX_L} y={CY} radius={R + 2} fill={STROKE} />
            {Array.from({ length: leftDenominator }, (_, i) => (
              <Arc
                key={`L${i}`}
                x={CX_L} y={CY}
                innerRadius={0}
                outerRadius={R}
                angle={leftSliceDeg - 1}
                rotation={i * leftSliceDeg - 90}
                fill={i < leftNumerator ? FILLED : EMPTY}
                stroke={STROKE}
                strokeWidth={1.5}
              />
            ))}
            {/* Left fraction label */}
            <Text
              x={CX_L - 36}
              y={CY + R + 12}
              width={72}
              text={`${leftNumerator}/${leftDenominator}`}
              fontSize={18}
              fontStyle="bold"
              fill="#374151"
              align="center"
              fontFamily="OpenDyslexic, sans-serif"
            />

            {/* ── Equals sign ── */}
            <Text
              x={BASE_W / 2 - 16}
              y={CY - 16}
              text="="
              fontSize={32}
              fontStyle="bold"
              fill="#9ca3af"
              fontFamily="OpenDyslexic, sans-serif"
            />

            {/* ── Right pie (interactive) ── */}
            {/* Grey border circle signals interactivity */}
            <Circle x={CX_R} y={CY} radius={R + 2} fill={BORDER_INTERACTIVE} />
            {Array.from({ length: rightDenominator }, (_, i) => (
              <Arc
                key={`R${i}`}
                x={CX_R} y={CY}
                innerRadius={0}
                outerRadius={R}
                angle={rightSliceDeg - 1}
                rotation={i * rightSliceDeg - 90}
                fill={selected.has(i) ? FILLED : EMPTY}
                stroke={selected.has(i) ? STROKE : '#e5e7eb'}
                strokeWidth={1.5}
                onClick={() => toggle(i)}
                onTap={() => toggle(i)}
                style={{ cursor: 'pointer' }}
              />
            ))}
            {/* Right fraction label — shows progress, turns green when correct */}
            <Text
              x={CX_R - 36}
              y={CY + R + 12}
              width={72}
              text={`${selected.size}/${rightDenominator}`}
              fontSize={18}
              fontStyle="bold"
              fill={isCorrect ? '#16a34a' : '#9ca3af'}
              align="center"
              fontFamily="OpenDyslexic, sans-serif"
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
