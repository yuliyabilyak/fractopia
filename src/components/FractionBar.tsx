import { useState } from 'react'
import { Stage, Layer, Rect, Text, Group } from 'react-konva'
import { useLang } from '../i18n/LangContext'
import { useContainerWidth } from '../hooks/useContainerWidth'

interface Props {
  denominator: number
  targetNumerator: number
  onAnswer: (correct: boolean) => void
}

const BASE_W = 520
const BASE_H = 72
const FILLED_COLOR = '#f97316'
const EMPTY_COLOR = '#fff0e0'
const STROKE_COLOR = '#fdba74'

export default function FractionBar({ denominator, targetNumerator, onAnswer }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const { t } = useLang()
  const { ref, width: containerWidth } = useContainerWidth(BASE_W)

  const scale = Math.min(1, containerWidth / BASE_W)
  const stageW = BASE_W * scale
  const stageH = (BASE_H + 24) * scale
  const sliceWidth = BASE_W / denominator

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
        dangerouslySetInnerHTML={{ __html: t('shadeBar', { n: targetNumerator, d: denominator }).replace(/(\d+\/\d+)/, '<strong>$1</strong>') }}
      />
      <div ref={ref} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Stage width={stageW} height={stageH}>
          <Layer scaleX={scale} scaleY={scale}>
            {Array.from({ length: denominator }, (_, i) => (
              <Group key={i} x={i * sliceWidth} y={20} onClick={() => toggle(i)} onTap={() => toggle(i)}>
                <Rect
                  width={sliceWidth}
                  height={BASE_H}
                  fill={selected.has(i) ? FILLED_COLOR : EMPTY_COLOR}
                  stroke={STROKE_COLOR}
                  strokeWidth={2}
                  cornerRadius={i === 0 ? [8, 0, 0, 8] : i === denominator - 1 ? [0, 8, 8, 0] : 0}
                  style={{ cursor: 'pointer' }}
                />
                {selected.has(i) && (sliceWidth * scale) >= 24 && (
                  <Text
                    text="✓"
                    width={sliceWidth}
                    height={BASE_H}
                    align="center"
                    verticalAlign="middle"
                    fontSize={20}
                    fill="white"
                  />
                )}
              </Group>
            ))}
          </Layer>
        </Stage>
      </div>
      <button className="btn-check" onClick={check}>{t('check')}</button>
    </div>
  )
}
