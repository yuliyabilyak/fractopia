import { useLayoutEffect, useRef, useState } from 'react'

export function useContainerWidth(initialWidth = 300) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(initialWidth)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.clientWidth)
    const obs = new ResizeObserver(() => setWidth(el.clientWidth))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return { ref, width }
}
