import { Stage, Layer, Rect, Text } from 'react-konva'
import type { Fraction } from '../types'
import { useLang } from '../i18n/LangContext'

interface Props {
  left: Fraction
  right: Fraction
  onAnswer: (answer: 'left' | 'right' | 'equal') => void
}

const BAR_WIDTH = 180
const BAR_HEIGHT = 40
const FILLED_COLOR = '#6C63FF'
const EMPTY_COLOR = '#E8E8F0'

function FractionVisual({ fraction, label }: { fraction: Fraction; label: string }) {
  const filledWidth = (fraction.numerator / fraction.denominator) * BAR_WIDTH
  return (
    <div style={{ textAlign: 'center' }}>
      <Stage width={BAR_WIDTH} height={BAR_HEIGHT + 30}>
        <Layer>
          <Rect width={BAR_WIDTH} height={BAR_HEIGHT} fill={EMPTY_COLOR} cornerRadius={6} />
          <Rect width={filledWidth} height={BAR_HEIGHT} fill={FILLED_COLOR} cornerRadius={6} />
          <Text
            x={0} y={BAR_HEIGHT + 6}
            width={BAR_WIDTH}
            text={label}
            align="center"
            fontSize={16} fontStyle="bold" fill="#444"
          />
        </Layer>
      </Stage>
    </div>
  )
}

export default function CompareFractions({ left, right, onAnswer }: Props) {
  const { t } = useLang()
  const leftLabel = `${left.numerator}/${left.denominator}`
  const rightLabel = `${right.numerator}/${right.denominator}`

  return (
    <div className="exercise-card">
      <p className="exercise-prompt">{t('compare')}</p>
      <div style={{ display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'flex-end' }}>
        <FractionVisual fraction={left} label={leftLabel} />
        <span style={{ fontSize: 28, fontWeight: 'bold', paddingBottom: 8 }}>vs</span>
        <FractionVisual fraction={right} label={rightLabel} />
      </div>
      <div className="compare-btns">
        <button className="btn-choice" onClick={() => onAnswer('left')}>{t('isBigger', { f: leftLabel })}</button>
        <button className="btn-choice" onClick={() => onAnswer('equal')}>{t('equal')}</button>
        <button className="btn-choice" onClick={() => onAnswer('right')}>{t('isBigger', { f: rightLabel })}</button>
      </div>
    </div>
  )
}
