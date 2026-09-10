import { Fragment } from 'react'
import { Stage, Layer, Arc, Circle, Text } from 'react-konva'

interface Props {
  denominator: number
  totalShaded: number
  toppingEmoji: string
  size?: number
  color?: 'default' | 'reveal'
  selectable?: boolean
  selected?: Set<number>
  onToggle?: (globalIndex: number) => void
  maxSlices?: number
}

const FILLED_COLOR = '#FF8C42'
const EMPTY_COLOR = '#FFF0E0'
const STROKE_COLOR = '#E06B1A'
const REVEAL_COLOR = '#22c55e'

function shadedCountInCopy(copyIdx: number, denominator: number, totalShaded: number): number {
  return Math.min(denominator, Math.max(0, totalShaded - copyIdx * denominator))
}

interface PizzaCopyProps {
  denominator: number
  shadedCount?: number
  selected?: Set<number>
  copyOffset: number
  toppingEmoji: string
  size: number
  filled: string
  onToggle?: (localIndex: number) => void
}

function PizzaCopy({ denominator, shadedCount, selected, copyOffset, toppingEmoji, size, filled, onToggle }: PizzaCopyProps) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 4
  const sliceDeg = 360 / denominator
  const emojiSize = Math.max(11, size * 0.15)
  const emojiRadius = r * 0.55
  const isShaded = (i: number) => (selected ? selected.has(copyOffset + i) : i < (shadedCount ?? 0))

  return (
    <Stage width={size} height={size}>
      <Layer>
        <Circle x={cx} y={cy} radius={r + 2} fill={STROKE_COLOR} />
        {Array.from({ length: denominator }, (_, i) => {
          const shaded = isShaded(i)
          const midAngleRad = ((i + 0.5) * sliceDeg - 90) * (Math.PI / 180)
          const ex = cx + Math.cos(midAngleRad) * emojiRadius
          const ey = cy + Math.sin(midAngleRad) * emojiRadius
          return (
            <Fragment key={i}>
              <Arc
                x={cx} y={cy}
                innerRadius={0}
                outerRadius={r}
                angle={sliceDeg - 1}
                rotation={i * sliceDeg - 90}
                fill={shaded ? filled : EMPTY_COLOR}
                stroke={STROKE_COLOR}
                strokeWidth={1.5}
                onClick={onToggle ? () => onToggle(i) : undefined}
                onTap={onToggle ? () => onToggle(i) : undefined}
                style={onToggle ? { cursor: 'pointer' } : undefined}
              />
              {shaded && (
                <Text
                  text={toppingEmoji}
                  x={ex - emojiSize / 2}
                  y={ey - emojiSize / 2}
                  fontSize={emojiSize}
                  listening={false}
                />
              )}
            </Fragment>
          )
        })}
      </Layer>
    </Stage>
  )
}

export default function PizzaTradePizza({
  denominator,
  totalShaded,
  toppingEmoji,
  size = 96,
  color = 'default',
  selectable = false,
  selected,
  onToggle,
  maxSlices,
}: Props) {
  const filled = color === 'reveal' ? REVEAL_COLOR : FILLED_COLOR
  const copies = selectable
    ? Math.max(1, Math.ceil(Math.min((selected?.size ?? 0) + denominator, maxSlices ?? Infinity) / denominator))
    : Math.max(1, Math.ceil(totalShaded / denominator))

  return (
    <div className="pt-pizza-group">
      {Array.from({ length: copies }, (_, c) => (
        <div key={c} className={`pt-pizza-copy${c > 0 ? ' pt-pizza-copy--fuse' : ''}`}>
          <PizzaCopy
            denominator={denominator}
            shadedCount={selectable ? undefined : shadedCountInCopy(c, denominator, totalShaded)}
            selected={selectable ? selected : undefined}
            copyOffset={c * denominator}
            toppingEmoji={toppingEmoji}
            size={size}
            filled={filled}
            onToggle={selectable && onToggle ? (i) => onToggle(c * denominator + i) : undefined}
          />
        </div>
      ))}
    </div>
  )
}
