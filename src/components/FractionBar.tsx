import { useState } from 'react'
import { Stage, Layer, Rect, Text, Group, Line } from 'react-konva'
import { useLang } from '../i18n/LangContext'

interface Props {
  denominator: number
  targetNumerator: number
  onAnswer: (correct: boolean) => void
}

const BAR_WIDTH = 520
const BAR_HEIGHT = 72
const FILLED_COLOR = '#6C63FF'
const EMPTY_COLOR = '#E8E8F0'
const STROKE_COLOR = '#9B97D4'

export default function FractionBar({ denominator, targetNumerator, onAnswer }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const { t } = useLang()

  const sliceWidth = BAR_WIDTH / denominator

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
        dangerouslySetInnerHTML={{ __html: t('shadeBar', { n: targetNumerator, d: denominator }).replace(/(\d+\/\d+)/, '<strong>$1</strong>') }}
      />
      <Stage width={BAR_WIDTH} height={BAR_HEIGHT + 24}>
        <Layer>
          {Array.from({ length: denominator }, (_, i) => (
            <Group key={i} x={i * sliceWidth} y={20} onClick={() => toggle(i)} onTap={() => toggle(i)}>
              <Rect
                width={sliceWidth}
                height={BAR_HEIGHT}
                fill={selected.has(i) ? FILLED_COLOR : EMPTY_COLOR}
                stroke={STROKE_COLOR}
                strokeWidth={2}
                cornerRadius={i === 0 ? [8, 0, 0, 8] : i === denominator - 1 ? [0, 8, 8, 0] : 0}
                style={{ cursor: 'pointer' }}
              />
              {selected.has(i) && sliceWidth >= 36 && (
                <Text
                  text="✓"
                  width={sliceWidth}
                  height={BAR_HEIGHT}
                  align="center"
                  verticalAlign="middle"
                  fontSize={20}
                  fill="white"
                />
              )}
            </Group>
          ))}
          <Line points={[0, BAR_HEIGHT + 20 + 10, BAR_WIDTH, BAR_HEIGHT + 20 + 10]} stroke="transparent" />
        </Layer>
      </Stage>
      <button className="btn-check" onClick={check}>{t('check')}</button>
    </div>
  )
}
