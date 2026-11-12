import { useState, type ReactNode } from 'react'
import { useLang } from '../../i18n/LangContext'
import PiecePalette from './PiecePalette'
import { useDropZone } from './useDropZone'

interface Props {
  /** the equation, with `slot` placed where the gap is */
  equation: (slot: ReactNode) => ReactNode
  cards: string[]
  onSubmit: (value: string) => void
}

/**
 * Mode B for one-gap equations: drag a number card into the gap — or tap the
 * card, then tap the gap (keyboard: Enter on each) — then Check.
 */
export default function FillTheSlot({ equation, cards, onSubmit }: Props) {
  const { t } = useLang()
  const [selected, setSelected] = useState<string | null>(null)
  const [placed, setPlaced] = useState<string | null>(null)
  const place = (value: string) => { setPlaced(value); setSelected(null) }
  const drop = useDropZone(place)

  const slot = (
    <span className={`ws-slot${drop.over ? ' ws-slot--over' : ''}${placed ? ' ws-slot--filled' : ''}`} {...drop.props}>
      {placed ? (
        <button type="button" className="ws-number-card ws-number-card--placed" aria-label={t('wsRemovePiece', { x: placed })} onClick={() => setPlaced(null)}>
          {placed}
        </button>
      ) : (
        <button
          type="button"
          className={`ws-slot-btn${selected ? ' ws-slot-btn--ready' : ''}`}
          aria-label={t('wsSlotAria')}
          disabled={!selected}
          onClick={() => selected && place(selected)}
        >
          ?
        </button>
      )}
    </span>
  )

  return (
    <>
      <div className="ws-equation">{equation(slot)}</div>
      <PiecePalette
        label={t('wsNumberCards')}
        selected={selected}
        onSelect={setSelected}
        items={cards.map(c => ({ value: c, className: 'ws-number-card', content: c }))}
      />
      <p className="ws-sr-only">{t('wsHowToPlace')}</p>
      <button type="button" className="btn-check" disabled={!placed} onClick={() => placed && onSubmit(placed)}>
        {t('check')}
      </button>
    </>
  )
}
