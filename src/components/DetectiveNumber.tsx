import { useLang } from '../i18n/LangContext'
import { LOCALES, type Keys } from '../i18n/translations'
import { formatNumber, isHighlighted, tokenizeNumber, type Highlight } from '../data/numberDetective'

interface Props {
  n: number
  highlight: Highlight
}

const LAST_KEY: Record<number, Keys> = { 1: 'ndHlLast1', 2: 'ndHlLast2', 3: 'ndHlLast3' }
const HIGHLIGHT_KEY: Record<'all' | 'odd' | 'even', Keys> = { all: 'ndHlAll', odd: 'ndHlOdd', even: 'ndHlEven' }

/** The target number, one tile per digit so the digits a rule looks at can be
 * boxed, underlined and labelled — never marked by colour alone. */
export default function DetectiveNumber({ n, highlight }: Props) {
  const { t, lang } = useLang()
  const formatted = formatNumber(n, LOCALES[lang])
  const label = typeof highlight === 'number'
    ? (highlight > 0 ? t(LAST_KEY[highlight]) : null)
    : t(HIGHLIGHT_KEY[highlight])

  return (
    <div className="nd-number-frame">
      <p className="nd-number">
        <span className="nd-sr-only">{formatted}</span>
        <span className="nd-number-digits" aria-hidden="true">
          {tokenizeNumber(formatted).map((tok, i) =>
            tok.type === 'sep'
              ? <span key={i} className="nd-sep">{/\s/.test(tok.char) ? '' : tok.char}</span>
              : <span key={i} className={`nd-digit${isHighlighted(tok.fromRight, highlight) ? ' nd-digit--hl' : ''}`}>{tok.char}</span>,
          )}
        </span>
      </p>
      <p className="nd-hl-label">{label && <><span aria-hidden="true">▲ </span>{label}</>}</p>
    </div>
  )
}
