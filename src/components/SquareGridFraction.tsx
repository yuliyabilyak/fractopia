import { useState } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import { useLang } from '../i18n/LangContext'
import { useContainerWidth } from '../hooks/useContainerWidth'
import SpeakPrompt from './SpeakPrompt'
import ShadeProgress from './ShadeProgress'

interface Props {
  cols: number
  rows: number
  targetNumerator: number
  onAnswer: (correct: boolean) => void
}

const BASE_GRID_SIZE = 280
const PAD = 20
const FILLED_COLOR = '#f59e0b'
const EMPTY_COLOR = '#fef3c7'
const STROKE_COLOR = '#d97706'
const REVEAL_COLOR = '#22c55e'
const REVEAL_MS = 1400

export default function SquareGridFraction({ cols, rows, targetNumerator, onAnswer }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [revealing, setRevealing] = useState(false)
  const { t } = useLang()
  const { ref, width: containerWidth } = useContainerWidth(BASE_GRID_SIZE)

  const scale = Math.min(1, containerWidth / BASE_GRID_SIZE)
  const stageSize = BASE_GRID_SIZE * scale
  const denominator = cols * rows
  const cellW = (BASE_GRID_SIZE - PAD * 2) / cols
  const cellH = (BASE_GRID_SIZE - PAD * 2) / rows

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

  const promptText = t('tapGrid', { n: targetNumerator, d: denominator })
  const promptHtml = promptText.replace(/(\d+\/\d+)/, '<strong>$1</strong>')

  return (
    <div className="exercise-card">
      <SpeakPrompt html={promptHtml} text={promptText} />
      <div ref={ref} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Stage width={stageSize} height={stageSize}>
          <Layer scaleX={scale} scaleY={scale}>
            {Array.from({ length: denominator }, (_, i) => {
              const col = i % cols
              const row = Math.floor(i / cols)
              const shaded = revealing ? i < targetNumerator : selected.has(i)
              return (
                <Rect
                  key={i}
                  x={PAD + col * cellW} y={PAD + row * cellH}
                  width={cellW} height={cellH}
                  fill={shaded ? (revealing ? REVEAL_COLOR : FILLED_COLOR) : EMPTY_COLOR}
                  stroke={STROKE_COLOR}
                  strokeWidth={2}
                  cornerRadius={4}
                  onClick={() => toggle(i)}
                  onTap={() => toggle(i)}
                  style={{ cursor: 'pointer' }}
                />
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
