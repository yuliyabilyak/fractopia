import { useState, type DragEvent } from 'react'
import { DRAG_TYPE } from './PiecePalette'

/** Props for an element that accepts a piece dragged from a PiecePalette. */
export function useDropZone(onDrop: (value: string) => void) {
  const [over, setOver] = useState(false)
  return {
    over,
    props: {
      onDragOver: (e: DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' },
      onDragEnter: (e: DragEvent) => { e.preventDefault(); setOver(true) },
      onDragLeave: (e: DragEvent) => {
        // leaving into a child still counts as over
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false)
      },
      onDrop: (e: DragEvent) => {
        e.preventDefault()
        setOver(false)
        const value = e.dataTransfer.getData(DRAG_TYPE)
        if (value) onDrop(value)
      },
    },
  }
}
