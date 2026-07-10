import { useState } from 'react'
import { Stage, Layer, Rect, Text, Group } from 'react-konva'
import { useLang } from '../i18n/LangContext'
import { useContainerWidth } from '../hooks/useContainerWidth'
import SpeakPrompt from './SpeakPrompt'
import ShadeProgress from './ShadeProgress'

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
const REVEAL_COLOR = '#22c55e'
const REVEAL_MS = 1400

export default function FractionBar({ denominator, targetNumerator, onAnswer }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [revealing, setRevealing] = useState(false)
  const { t } = useLang()
  const { ref, width: containerWidth } = useContainerWidth(BASE_W)

  const scale = Math.min(1, containerWidth / BASE_W)
  const stageW = BASE_W * scale
  const stageH = (BASE_H + 24) * scale
  const sliceWidth = BASE_W / denominator

  const toggle = (i: number) => {
    if (revealing) return
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const check = () => {
    if (revealing) return
    const correct = selected.size === targetNumerator
    if (correct) { onAnswer(true); return }
    setRevealing(true)
    setTimeout(() => onAnswer(false), REVEAL_MS)
  }

  const promptText = t('shadeBar', { n: targetNumerator, d: denominator })
  const promptHtml = promptText.replace(/(\d+\/\d+)/, '<strong>$1</strong>')

  return (
    <div className="exercise-card">
      <SpeakPrompt html={promptHtml} text={promptText} />
      <div ref={ref} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Stage width={stageW} height={stageH}>
          <Layer scaleX={scale} scaleY={scale}>
            {Array.from({ length: denominator }, (_, i) => {
              const shaded = revealing ? i < targetNumerator : selected.has(i)
              return (
                <Group key={i} x={i * sliceWidth} y={20} onClick={() => toggle(i)} onTap={() => toggle(i)}>
                  <Rect
                    width={sliceWidth}
                    height={BASE_H}
                    fill={shaded ? (revealing ? REVEAL_COLOR : FILLED_COLOR) : EMPTY_COLOR}
                    stroke={STROKE_COLOR}
                    strokeWidth={2}
                    cornerRadius={i === 0 ? [8, 0, 0, 8] : i === denominator - 1 ? [0, 8, 8, 0] : 0}
                    style={{ cursor: 'pointer' }}
                  />
                  {shaded && (sliceWidth * scale) >= 24 && (
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
              )
            })}
          </Layer>
        </Stage>
      </div>
      <ShadeProgress shaded={selected.size} total={denominator} />
      <button className="btn-check" onClick={check} disabled={revealing}>{t('check')}</button>
    </div>
  )
}
