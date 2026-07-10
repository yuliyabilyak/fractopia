interface Props {
  shaded: number
  total: number
}

export default function ShadeProgress({ shaded, total }: Props) {
  return (
    <div className="shade-progress" role="img" aria-label={`${shaded} of ${total} shaded`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`shade-progress-dot${i < shaded ? ' shade-progress-dot--filled' : ''}`}
        />
      ))}
    </div>
  )
}
