import { useLang } from '../i18n/LangContext'
import type { Keys } from '../i18n/translations'
import type { Highlight } from '../data/numberDetective'
import HighlightedNumber from './HighlightedNumber'

interface Props {
  n: number
  highlight: Highlight
}

const LAST_KEY: Record<number, Keys> = { 1: 'ndHlLast1', 2: 'ndHlLast2', 3: 'ndHlLast3' }
const HIGHLIGHT_KEY: Record<'all' | 'odd' | 'even', Keys> = { all: 'ndHlAll', odd: 'ndHlOdd', even: 'ndHlEven' }

/** The target number, one tile per digit so the digits a rule looks at can be
 * boxed, underlined and labelled — never marked by colour alone. */
export default function DetectiveNumber({ n, highlight }: Props) {
  const { t } = useLang()
  const label = typeof highlight === 'number'
    ? (highlight > 0 ? t(LAST_KEY[highlight]) : null)
    : t(HIGHLIGHT_KEY[highlight])

  return (
    <div className="nd-number-frame">
      <p className="nd-number"><HighlightedNumber n={n} highlight={highlight} /></p>
      <p className="nd-hl-label">{label && <><span aria-hidden="true">▲ </span>{label}</>}</p>
    </div>
  )
}
