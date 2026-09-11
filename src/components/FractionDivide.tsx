// FractionDivide — dividing fractions with concrete-before-abstract visuals.
//
//   measure    whole ÷ unit fraction  ("how many 1/2 fit in 3 wholes?")  → whole-number answer
//   partition  fraction ÷ whole       ("split 1/2 into 4 equal parts")   → fraction answer
//   grouping   fraction ÷ fraction    (stretch tier)                     → whole-number answer
//
// The measure and grouping models are the only exercises in the app whose answer
// is a plain count rather than a fraction, so they deliberately render big digits
// with no numerator/denominator layout.

import { useMemo, useState } from 'react'
import { Stage, Layer, Rect, Arc, Circle } from 'react-konva'
import type { Fraction } from '../types'
import { useLang } from '../i18n/LangContext'
import { useContainerWidth } from '../hooks/useContainerWidth'
import SpeakPrompt from './SpeakPrompt'
import ShadeProgress from './ShadeProgress'

type Model = 'measure' | 'partition' | 'grouping'
type Step = 'intro' | 'split' | 'question'

interface Props {
  model: Model
  shape: 'bar' | 'pizza'
  mode: 'select' | 'generate'
  // measure: dividendWhole ÷ 1/divisorD
  dividendWhole?: number
  // partition: dividendN/dividendD ÷ divisor
  dividendN?: number
  dividendD?: number
  divisor?: number
  // grouping: dividendN/dividendD ÷ divisorN/divisorD
  divisorN?: number
  divisorD?: number
  // answers
  answer?: number
  result?: Fraction
  numChoices?: number[]
  choices?: Fraction[]
  correctIndex?: number
  onAnswer: (correct: boolean) => void
}

const COLORS: Record<'bar' | 'pizza', { filled: string; empty: string; stroke: string }> = {
  bar:   { filled: '#f97316', empty: '#fff0e0', stroke: '#fdba74' },
  pizza: { filled: '#FF8C42', empty: '#FFF0E0', stroke: '#E06B1A' },
}
const REVEAL_COLOR = '#22c55e'
const COUNTED_COLOR = '#0ea5e9'
const REVEAL_MS = 1600

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b) }
function lcm(a: number, b: number): number { return (a * b) / gcd(a, b) }

/**
 * Width that keeps each slice at or above the 44px tap-target guideline when the
 * container allows it.  A pizza wedge is much wider than its arc, so it needs less.
 */
function sizeForPieces(shape: 'bar' | 'pizza', pieces: number, containerWidth: number): number {
  const perPiece = shape === 'bar' ? 44 : 24
  return Math.min(Math.max(140, pieces * perPiece), Math.max(140, containerWidth - 16))
}

interface ShapeThumbProps {
  shape: 'bar' | 'pizza'
  denominator: number
  size: number
  /** colour for slice i, or undefined to leave it empty */
  fillFor: (i: number) => string | undefined
  onToggle?: (i: number) => void
}

function ShapeThumb({ shape, denominator, size, fillFor, onToggle }: ShapeThumbProps) {
  const palette = COLORS[shape]

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
              fill={fillFor(i) ?? palette.empty}
              stroke={palette.stroke}
              strokeWidth={1.5}
              cornerRadius={i === 0 ? [6, 0, 0, 6] : i === denominator - 1 ? [0, 6, 6, 0] : 0}
              onClick={onToggle ? () => onToggle(i) : undefined}
              onTap={onToggle ? () => onToggle(i) : undefined}
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
        <Circle x={cx} y={cy} radius={r + 2} fill={palette.stroke} />
        {Array.from({ length: denominator }, (_, i) => (
          <Arc
            key={i}
            x={cx} y={cy}
            innerRadius={0} outerRadius={r}
            angle={sliceDeg - 1}
            rotation={i * sliceDeg - 90}
            fill={fillFor(i) ?? palette.empty}
            stroke={palette.stroke}
            strokeWidth={1.5}
            onClick={onToggle ? () => onToggle(i) : undefined}
            onTap={onToggle ? () => onToggle(i) : undefined}
          />
        ))}
      </Layer>
    </Stage>
  )
}

function FractionChoiceButton({ shape, frac, size, onClick, disabled, highlight }: {
  shape: 'bar' | 'pizza'; frac: Fraction; size: number
  onClick: () => void; disabled: boolean; highlight?: boolean
}) {
  return (
    <button
      type="button"
      className={`fd-choice-btn${highlight ? ' fd-choice-btn--correct' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={`${frac.numerator}/${frac.denominator}`}
    >
      <ShapeThumb
        shape={shape}
        denominator={frac.denominator}
        size={size}
        fillFor={(i) => i < frac.numerator ? (highlight ? REVEAL_COLOR : COLORS[shape].filled) : undefined}
      />
    </button>
  )
}

function NumberChoiceButton({ value, onClick, disabled, highlight }: {
  value: number; onClick: () => void; disabled: boolean; highlight?: boolean
}) {
  return (
    <button
      type="button"
      className={`fd-number-btn${highlight ? ' fd-number-btn--correct' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {value}
    </button>
  )
}

export default function FractionDivide({
  model, shape, mode,
  dividendWhole, dividendN, dividendD, divisor, divisorN, divisorD,
  answer, result, numChoices, choices, correctIndex,
  onAnswer,
}: Props) {
  const { t } = useLang()
  const { ref, width: containerWidth } = useContainerWidth(320)
  const [step, setStep] = useState<Step>('intro')
  const [counted, setCounted] = useState<Set<number>>(new Set())
  const [shaded, setShaded] = useState<Set<number>>(new Set())
  const [revealing, setRevealing] = useState(false)

  const palette = COLORS[shape]

  // ── derived geometry ───────────────────────────────────────────────────────
  const wholes = dividendWhole ?? 1
  const pieces = divisorD ?? 2               // slices per whole (measure model)

  // partition: (n/d) ÷ k = n/(d·k)
  const partD = (dividendD ?? 2) * (divisor ?? 2)
  const partResult = result ?? { numerator: dividendN ?? 1, denominator: partD }

  // grouping: line both fractions up on a common denominator, then count groups
  const commonD = useMemo(
    () => lcm(dividendD ?? 2, divisorD ?? 2),
    [dividendD, divisorD],
  )
  const dividendPieces = (dividendN ?? 1) * (commonD / (dividendD ?? 2))
  const divisorPieces = (divisorN ?? 1) * (commonD / (divisorD ?? 2))
  const groupCount = answer ?? Math.round(dividendPieces / divisorPieces)

  /** number of things the child taps/counts in generate mode */
  const countTarget = model === 'grouping' ? groupCount : (answer ?? wholes * pieces)

  // every shape is sized by its own slice count so taps stay comfortably large
  const measureSize = sizeForPieces(shape, pieces, containerWidth)
  const groupSize = sizeForPieces(shape, commonD, containerWidth)
  const partIntroSize = sizeForPieces(shape, dividendD ?? 2, containerWidth)
  const partSplitSize = sizeForPieces(shape, partD, containerWidth)
  const partAnswerSize = sizeForPieces(shape, partResult.denominator, containerWidth)

  // ── prompt ─────────────────────────────────────────────────────────────────
  const promptText =
    model === 'measure'
      ? t('fdMeasurePrompt', { d: pieces, w: wholes })
      : model === 'partition'
      ? t('fdPartitionPrompt', { n: dividendN ?? 1, d: dividendD ?? 2, k: divisor ?? 2 })
      : t('fdGroupingPrompt', { n2: divisorN ?? 1, d2: divisorD ?? 2, n: dividendN ?? 1, d: dividendD ?? 2 })
  const promptHtml = promptText.replace(/(\d+\/\d+)/g, '<strong>$1</strong>')

  const questionKey =
    model === 'measure' ? 'fdMeasureQuestion'
    : model === 'partition' ? 'fdPartitionQuestion'
    : 'fdGroupingQuestion'

  // ── interaction ────────────────────────────────────────────────────────────
  const goNext = () => setStep(step === 'intro' ? 'split' : 'question')

  const toggleCounted = (i: number) => {
    if (revealing) return
    setCounted(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const toggleShaded = (i: number) => {
    if (revealing) return
    setShaded(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const finish = (correct: boolean) => {
    if (correct) { onAnswer(true); return }
    setRevealing(true)
    setTimeout(() => onAnswer(false), REVEAL_MS)
  }

  // ── shape rendering helpers ────────────────────────────────────────────────

  /** measure model: `wholes` shapes, each cut into `pieces`, tappable in generate mode */
  const renderWholes = (split: boolean, tappable: boolean) => (
    <div className="fd-shape-row">
      {Array.from({ length: wholes }, (_, w) => (
        <ShapeThumb
          key={w}
          shape={shape}
          denominator={split ? pieces : 1}
          size={measureSize}
          fillFor={(i) => {
            if (!split || !tappable) return palette.filled
            return counted.has(w * pieces + i) ? COUNTED_COLOR : palette.filled
          }}
          onToggle={tappable && split ? (i) => toggleCounted(w * pieces + i) : undefined}
        />
      ))}
    </div>
  )

  /** grouping model: the dividend, then one chunk per group the divisor carves out */
  const renderGroups = (tappable: boolean) => (
    <div className="fd-group-row">
      {Array.from({ length: groupCount }, (_, g) => (
        <ShapeThumb
          key={g}
          shape={shape}
          denominator={commonD}
          size={groupSize}
          fillFor={(i) => {
            const inGroup = i >= g * divisorPieces && i < (g + 1) * divisorPieces
            if (!inGroup) return undefined
            return tappable && counted.has(g) ? COUNTED_COLOR : palette.filled
          }}
          onToggle={tappable ? () => toggleCounted(g) : undefined}
        />
      ))}
    </div>
  )

  // ── teaching steps ─────────────────────────────────────────────────────────
  const stepView = () => {
    if (model === 'measure') {
      return step === 'intro'
        ? <>{renderWholes(false, false)}<p className="fd-caption">{t('fdMeasureIntro', { w: wholes })}</p></>
        : <>{renderWholes(true, false)}<p className="fd-caption">{t('fdMeasureSplit', { d: pieces })}</p></>
    }

    if (model === 'partition') {
      const n = dividendN ?? 1, d = dividendD ?? 2, k = divisor ?? 2
      return step === 'intro'
        ? (
          <>
            <ShapeThumb shape={shape} denominator={d} size={partIntroSize}
              fillFor={(i) => i < n ? palette.filled : undefined} />
            <p className="fd-caption">{t('fdPartitionIntro', { n, d })}</p>
          </>
        )
        : (
          <>
            <div className="fd-split-anim">
              <ShapeThumb shape={shape} denominator={d * k} size={partSplitSize}
                fillFor={(i) => i < n * k ? palette.filled : undefined} />
            </div>
            <p className="fd-caption">{t('fdPartitionSplit', { d2: d * k })}</p>
          </>
        )
    }

    // grouping
    return step === 'intro'
      ? (
        <>
          <ShapeThumb shape={shape} denominator={dividendD ?? 2} size={partIntroSize}
            fillFor={(i) => i < (dividendN ?? 1) ? palette.filled : undefined} />
          <p className="fd-caption">{t('fdGroupingIntro', { n: dividendN ?? 1, d: dividendD ?? 2 })}</p>
        </>
      )
      : (
        <>
          <div className="fd-split-anim">{renderGroups(false)}</div>
          <p className="fd-caption">{t('fdGroupingSplit', { n2: divisorN ?? 1, d2: divisorD ?? 2 })}</p>
        </>
      )
  }

  // ── question step ──────────────────────────────────────────────────────────
  const wholeNumberAnswer = model !== 'partition'

  return (
    <div className="exercise-card" ref={ref}>
      <SpeakPrompt html={promptHtml} text={promptText} />

      {step !== 'question' && (
        <>
          <div key={step} className="fd-stage">
            {stepView()}
          </div>
          <button type="button" className="btn-check" onClick={goNext}>{t('fdContinue')}</button>
        </>
      )}

      {step === 'question' && (
        <>
          <p className="exercise-prompt">{t(questionKey)}</p>

          {mode === 'select' && wholeNumberAnswer && numChoices && (
            <div className="fd-number-choices">
              {numChoices.map((v, i) => (
                <NumberChoiceButton
                  key={i}
                  value={v}
                  disabled={revealing}
                  highlight={revealing && i === correctIndex}
                  onClick={() => finish(i === correctIndex)}
                />
              ))}
            </div>
          )}

          {mode === 'select' && !wholeNumberAnswer && choices && (
            <div className="fd-choices">
              {choices.map((c, i) => (
                <FractionChoiceButton
                  key={i}
                  shape={shape}
                  frac={c}
                  size={Math.min(96, Math.max(64, containerWidth / 4))}
                  disabled={revealing}
                  highlight={revealing && i === correctIndex}
                  onClick={() => finish(i === correctIndex)}
                />
              ))}
            </div>
          )}

          {/* generate — measure / grouping: tap each part to count it */}
          {mode === 'generate' && wholeNumberAnswer && (
            <div className="fd-stage">
              <p className="fd-caption">{t('fdTapHint')}</p>
              {model === 'measure' ? renderWholes(true, true) : renderGroups(true)}
              <p className="fd-count-display" aria-live="polite">
                {revealing ? countTarget : counted.size}
              </p>
              {revealing && <p className="fd-caption">{t('fdCorrectCount', { a: countTarget })}</p>}
              <button type="button" className="btn-check" disabled={revealing}
                onClick={() => finish(counted.size === countTarget)}>
                {t('check')}
              </button>
            </div>
          )}

          {/* generate — partition: shade the answer on the new denominator */}
          {mode === 'generate' && !wholeNumberAnswer && (
            <div className="fd-stage">
              <p className="fd-caption">{t('fdShadeHint', { d: partResult.denominator })}</p>
              <ShapeThumb
                shape={shape}
                denominator={partResult.denominator}
                size={partAnswerSize}
                fillFor={(i) => {
                  if (revealing) return i < partResult.numerator ? REVEAL_COLOR : undefined
                  return shaded.has(i) ? palette.filled : undefined
                }}
                onToggle={revealing ? undefined : toggleShaded}
              />
              <ShadeProgress shaded={shaded.size} total={partResult.denominator} />
              <button type="button" className="btn-check" disabled={revealing}
                onClick={() => finish(shaded.size === partResult.numerator)}>
                {t('check')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
