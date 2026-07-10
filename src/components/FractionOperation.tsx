import { useMemo, useState } from 'react'
import { Stage, Layer, Rect, Arc, Circle } from 'react-konva'
import type { Fraction } from '../types'
import { useLang } from '../i18n/LangContext'
import { useContainerWidth } from '../hooks/useContainerWidth'
import SpeakPrompt from './SpeakPrompt'
import ShadeProgress from './ShadeProgress'

interface Props {
  shape: 'bar' | 'pizza'
  operation: 'add' | 'subtract'
  left: Fraction
  right: Fraction
  result: Fraction
  mode: 'select' | 'generate'
  choices?: Fraction[]
  correctIndex?: number
  onAnswer: (correct: boolean) => void
}

type Step = 'intro' | 'convert' | 'combine' | 'question'

const COLORS: Record<'bar' | 'pizza', { filled: string; empty: string; stroke: string }> = {
  bar:   { filled: '#f97316', empty: '#fff0e0', stroke: '#fdba74' },
  pizza: { filled: '#FF8C42', empty: '#FFF0E0', stroke: '#E06B1A' },
}
const REVEAL_COLOR = '#22c55e'
const REVEAL_MS = 1400

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b) }
function lcm(a: number, b: number): number { return (a * b) / gcd(a, b) }

function shadedCountInCopy(copyIdx: number, denominator: number, totalShaded: number): number {
  return Math.min(denominator, Math.max(0, totalShaded - copyIdx * denominator))
}

interface ShapeGroupProps {
  shape: 'bar' | 'pizza'
  denominator: number
  totalShaded: number
  size: number
  color?: string
  interactiveSelected?: Set<number>
  onToggle?: (globalIndex: number) => void
}

function ShapeGroup({ shape, denominator, totalShaded, size, color, interactiveSelected, onToggle }: ShapeGroupProps) {
  const palette = COLORS[shape]
  const copies = Math.max(1, Math.ceil(totalShaded / denominator))
  return (
    <div className="fo-shape-group">
      {Array.from({ length: copies }, (_, c) => (
        <ShapeThumb
          key={c}
          shape={shape}
          denominator={denominator}
          shadedCount={interactiveSelected ? undefined : shadedCountInCopy(c, denominator, totalShaded)}
          selected={interactiveSelected}
          size={size}
          filled={color ?? palette.filled}
          empty={palette.empty}
          stroke={palette.stroke}
          onToggle={onToggle ? (i) => onToggle(c * denominator + i) : undefined}
          copyOffset={c * denominator}
        />
      ))}
    </div>
  )
}

interface ShapeThumbProps {
  shape: 'bar' | 'pizza'
  denominator: number
  shadedCount?: number
  selected?: Set<number>
  size: number
  filled: string
  empty: string
  stroke: string
  onToggle?: (localIndex: number) => void
  copyOffset?: number
}

function ShapeThumb({ shape, denominator, shadedCount, selected, size, filled, empty, stroke, onToggle, copyOffset = 0 }: ShapeThumbProps) {
  const isShaded = (i: number) => selected ? selected.has(copyOffset + i) : i < (shadedCount ?? 0)

  if (shape === 'bar') {
    const h = size * 0.36
    const sliceW = size / denominator
    return (
      <Stage width={size} height={h}>
        <Layer>
          {Array.from({ length: denominator }, (_, i) => (
            <Rect
              key={i}
              x={i * sliceW} y={0}
              width={sliceW} height={h}
              fill={isShaded(i) ? filled : empty}
              stroke={stroke}
              strokeWidth={1.5}
              cornerRadius={i === 0 ? [6, 0, 0, 6] : i === denominator - 1 ? [0, 6, 6, 0] : 0}
              onClick={onToggle ? () => onToggle(i) : undefined}
              onTap={onToggle ? () => onToggle(i) : undefined}
              style={onToggle ? { cursor: 'pointer' } : undefined}
            />
          ))}
        </Layer>
      </Stage>
    )
  }

  const cx = size / 2, cy = size / 2, r = size / 2 - 4
  const sliceDeg = 360 / denominator
  return (
    <Stage width={size} height={size}>
      <Layer>
        <Circle x={cx} y={cy} radius={r + 2} fill={stroke} />
        {Array.from({ length: denominator }, (_, i) => (
          <Arc
            key={i}
            x={cx} y={cy}
            innerRadius={0} outerRadius={r}
            angle={sliceDeg - 1}
            rotation={i * sliceDeg - 90}
            fill={isShaded(i) ? filled : empty}
            stroke={stroke}
            strokeWidth={1.5}
            onClick={onToggle ? () => onToggle(i) : undefined}
            onTap={onToggle ? () => onToggle(i) : undefined}
            style={onToggle ? { cursor: 'pointer' } : undefined}
          />
        ))}
      </Layer>
    </Stage>
  )
}

function ChoiceButton({ shape, frac, onClick, disabled, highlight }: { shape: 'bar' | 'pizza'; frac: Fraction; onClick: () => void; disabled: boolean; highlight?: boolean }) {
  const palette = COLORS[shape]
  return (
    <button
      type="button"
      className={`fo-choice-btn${highlight ? ' fo-choice-btn--correct' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <ShapeThumb
        shape={shape}
        denominator={frac.denominator}
        shadedCount={frac.numerator}
        size={72}
        filled={highlight ? REVEAL_COLOR : palette.filled}
        empty={palette.empty}
        stroke={palette.stroke}
      />
    </button>
  )
}

export default function FractionOperation({ shape, operation, left, right, result, mode, choices, correctIndex, onAnswer }: Props) {
  const { t } = useLang()
  const { ref, width: containerWidth } = useContainerWidth(320)
  const [step, setStep] = useState<Step>('intro')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [revealing, setRevealing] = useState(false)

  const commonD = useMemo(() => lcm(left.denominator, right.denominator), [left.denominator, right.denominator])
  const needsConvert = left.denominator !== right.denominator
  const leftScaled = left.numerator * (commonD / left.denominator)
  const rightScaled = right.numerator * (commonD / right.denominator)

  const opSymbol = operation === 'add' ? '+' : '−'
  const opKey = operation === 'add' ? 'foAddPrompt' : 'foSubtractPrompt'
  const combineKey = operation === 'add' ? 'foCombineAdd' : 'foCombineSubtract'
  const questionKey = operation === 'add' ? 'foQuestionAdd' : 'foQuestionSubtract'

  const thumbSize = Math.min(120, Math.max(72, containerWidth / 3))

  const goNext = () => {
    if (step === 'intro') setStep(needsConvert ? 'convert' : 'combine')
    else if (step === 'convert') setStep('combine')
    else if (step === 'combine') setStep('question')
  }

  const toggle = (i: number) => {
    if (revealing) return
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const finish = (correct: boolean) => {
    if (correct) { onAnswer(true); return }
    setRevealing(true)
    setTimeout(() => onAnswer(false), REVEAL_MS)
  }

  const submitGenerate = () => {
    if (revealing) return
    finish(selected.size === result.numerator)
  }

  const promptText = t(opKey)

  return (
    <div className="exercise-card">
      <SpeakPrompt html={promptText} text={promptText} />

      {step !== 'question' && (
        <div ref={ref} key={step} className="fo-row">
          {step === 'intro' && (
            <>
              <ShapeThumb shape={shape} denominator={left.denominator} shadedCount={left.numerator} size={thumbSize}
                filled={COLORS[shape].filled} empty={COLORS[shape].empty} stroke={COLORS[shape].stroke} />
              <span className="fo-op-symbol">{opSymbol}</span>
              <ShapeThumb shape={shape} denominator={right.denominator} shadedCount={right.numerator} size={thumbSize}
                filled={COLORS[shape].filled} empty={COLORS[shape].empty} stroke={COLORS[shape].stroke} />
            </>
          )}

          {step === 'convert' && (
            <>
              <div className="fo-convert-col">
                <ShapeThumb shape={shape} denominator={commonD} shadedCount={leftScaled} size={thumbSize}
                  filled={COLORS[shape].filled} empty={COLORS[shape].empty} stroke={COLORS[shape].stroke} />
                {left.denominator !== commonD && (
                  <p className="fo-caption">{t('foConvertCaption', { n: left.numerator, d: left.denominator, n2: leftScaled, d2: commonD })}</p>
                )}
              </div>
              <span className="fo-op-symbol">{opSymbol}</span>
              <div className="fo-convert-col">
                <ShapeThumb shape={shape} denominator={commonD} shadedCount={rightScaled} size={thumbSize}
                  filled={COLORS[shape].filled} empty={COLORS[shape].empty} stroke={COLORS[shape].stroke} />
                {right.denominator !== commonD && (
                  <p className="fo-caption">{t('foConvertCaption', { n: right.numerator, d: right.denominator, n2: rightScaled, d2: commonD })}</p>
                )}
              </div>
            </>
          )}

          {step === 'combine' && (
            <div className="fo-convert-col">
              <ShapeGroup shape={shape} denominator={commonD} totalShaded={result.numerator} size={thumbSize} />
              <p className="fo-caption">{t(combineKey)}</p>
            </div>
          )}
        </div>
      )}

      {step !== 'question' && (
        <button type="button" className="btn-check" onClick={goNext}>{t('foContinue')}</button>
      )}

      {step === 'question' && (
        <>
          <p className="exercise-prompt">{t(questionKey)}</p>

          {mode === 'select' && choices && (
            <div className="fo-choices">
              {choices.map((c, i) => (
                <ChoiceButton
                  key={i}
                  shape={shape}
                  frac={c}
                  disabled={revealing}
                  highlight={revealing && i === correctIndex}
                  onClick={() => finish(i === correctIndex)}
                />
              ))}
            </div>
          )}

          {mode === 'generate' && (
            <>
              <ShapeGroup
                shape={shape}
                denominator={result.denominator}
                totalShaded={revealing ? result.numerator : 0}
                size={thumbSize}
                color={revealing ? REVEAL_COLOR : undefined}
                interactiveSelected={revealing ? undefined : selected}
                onToggle={revealing ? undefined : toggle}
              />
              <ShadeProgress shaded={selected.size} total={result.denominator} />
              <button type="button" className="btn-check" onClick={submitGenerate} disabled={revealing}>{t('check')}</button>
            </>
          )}
        </>
      )}
    </div>
  )
}
