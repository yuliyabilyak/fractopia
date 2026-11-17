import { useEffect, useRef } from 'react'

/** Focus the returned button once `when` turns true (e.g. Continue after a reveal). */
export function useFocusWhen(when: boolean) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (when) ref.current?.focus() }, [when])
  return ref
}
