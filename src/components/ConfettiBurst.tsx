import { useMemo } from 'react'

const COLORS = [
  '#f97316', '#dc2626', '#16a34a', '#f59e0b',
  '#fdba74', '#fca5a5', '#86efac', '#a78bfa',
]

export default function ConfettiBurst() {
  const pieces = useMemo(() =>
    Array.from({ length: 32 }, (_, i) => {
      const angle = (i / 32) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
      const dist = 80 + Math.random() * 170
      return {
        id: i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 55, // slight upward bias
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.2,
        dur: 0.55 + Math.random() * 0.5,
        w: 7 + Math.random() * 7,
        h: 7 + Math.random() * 10,
        round: i % 3 === 0,
      }
    }), [])

  return (
    <div className="confetti-burst" aria-hidden="true">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
            width: p.w,
            height: p.round ? p.w : p.h,
            background: p.color,
            borderRadius: p.round ? '50%' : '3px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
