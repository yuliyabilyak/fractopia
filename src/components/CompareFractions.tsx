import { Stage, Layer, Rect } from 'react-konva'
import type { Fraction } from '../types'
import { useLang } from '../i18n/LangContext'
import { useContainerWidth } from '../hooks/useContainerWidth'

interface Props {
  left: Fraction
  right: Fraction
  onAnswer: (answer: 'left' | 'right' | 'equal') => void
}

const BASE_BAR_WIDTH = 180
const BAR_HEIGHT = 40
const FILLED_COLOR = '#f97316'
const EMPTY_COLOR = '#fff0e0'

function FractionVisual({ fraction, label, barWidth }: { fraction: Fraction; label: string; barWidth: number }) {
  const filledWidth = (fraction.numerator / fraction.denominator) * barWidth
  return (
    <div style={{ textAlign: 'center' }}>
      <Stage width={barWidth} height={BAR_HEIGHT}>
        <Layer>
          <Rect width={barWidth} height={BAR_HEIGHT} fill={EMPTY_COLOR} cornerRadius={6} />
          <Rect width={filledWidth} height={BAR_HEIGHT} fill={FILLED_COLOR} cornerRadius={6} />
        </Layer>
      </Stage>
      <div style={{ fontWeight: 'bold', fontSize: '1rem', marginTop: 6, color: '#444' }}>{label}</div>
    </div>
  )
}

export default function CompareFractions({ left, right, onAnswer }: Props) {
  const { t } = useLang()
  const { ref, width: containerWidth } = useContainerWidth(BASE_BAR_WIDTH * 2 + 80)

  // Reserve ~60px for "vs" + gaps; split remainder evenly between two bars
  const barWidth = Math.min(BASE_BAR_WIDTH, Math.max(80, Math.floor((containerWidth - 60) / 2)))

  const leftLabel = `${left.numerator}/${left.denominator}`
  const rightLabel = `${right.numerator}/${right.denominator}`

  return (
    <div className="exercise-card">
      <p className="exercise-prompt">{t('compare')}</p>
      <div ref={ref} style={{ width: '100%', display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
        <FractionVisual fraction={left} label={leftLabel} barWidth={barWidth} />
        <span style={{ fontSize: '1.4rem', fontWeight: 'bold', flexShrink: 0 }}>vs</span>
        <FractionVisual fraction={right} label={rightLabel} barWidth={barWidth} />
      </div>
      <div className="compare-btns">
        <button className="btn-choice" onClick={() => onAnswer('left')}>{t('isBigger', { f: leftLabel })}</button>
        <button className="btn-choice" onClick={() => onAnswer('equal')}>{t('equal')}</button>
        <button className="btn-choice" onClick={() => onAnswer('right')}>{t('isBigger', { f: rightLabel })}</button>
      </div>
    </div>
  )
}
