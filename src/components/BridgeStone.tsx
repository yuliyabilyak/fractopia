import { useLang } from '../i18n/LangContext'
import type { Highlight } from '../data/numberDetective'
import HighlightedNumber from './HighlightedNumber'

interface Props {
  n: number
  selected: boolean
  placed: boolean
  wrong: boolean
  /** crossing finished — nothing can change any more */
  locked: boolean
  highlight: Highlight
  onToggle: () => void
}

/** One stepping stone. Its state is shown by icon, border style and a text
 * label — never by colour alone. Locked stones stay focusable (aria-disabled,
 * not disabled) so keyboard and screen-reader users can still read them. */
export default function BridgeStone({ n, selected, placed, wrong, locked, highlight, onToggle }: Props) {
  const { t } = useLang()
  const mark = placed ? '✓' : wrong ? '✗' : selected ? '☑' : '☐'
  const inactive = locked || placed

  return (
    <button
      type="button"
      className={[
        'nb-stone',
        selected && 'nb-stone--selected',
        placed && 'nb-stone--placed',
        wrong && 'nb-stone--wrong',
      ].filter(Boolean).join(' ')}
      aria-pressed={selected || placed}
      aria-disabled={inactive || undefined}
      onClick={() => { if (!inactive) onToggle() }}
    >
      <span className="nb-stone-mark" aria-hidden="true">{mark}</span>
      <span className="nb-stone-number"><HighlightedNumber n={n} highlight={highlight} /></span>
      {placed && <span className="nb-stone-label">{t('nbOnPath')}</span>}
      {wrong && <span className="nb-stone-label">{t('nbCheckAgain')}</span>}
    </button>
  )
}
