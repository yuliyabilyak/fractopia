export type PathDirection = 'up' | 'left' | 'right'
export type PathState = 'idle' | 'correct' | 'wrong' | 'disabled'

interface Props {
  direction: PathDirection
  label: string
  state: PathState
  onChoose: () => void
}

const ARROW: Record<PathDirection, string> = { up: '↑', left: '←', right: '→' }

export default function PathOption({ direction, label, state, onChoose }: Props) {
  const cls = ['dm-path', `dm-path--${direction}`]
  if (state !== 'idle') cls.push(`dm-path--${state}`)

  return (
    <button className={cls.join(' ')} onClick={onChoose} disabled={state === 'disabled'}>
      <span className="dm-path-arrow" aria-hidden="true">{ARROW[direction]}</span>
      <span className="dm-path-label">{label}</span>
    </button>
  )
}
