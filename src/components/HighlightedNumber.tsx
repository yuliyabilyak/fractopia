import { useLang } from '../i18n/LangContext'
import { LOCALES } from '../i18n/translations'
import { formatNumber, isHighlighted, tokenizeNumber, type Highlight } from '../data/numberDetective'

interface Props {
  n: number
  highlight: Highlight
}

/** A locale-formatted number drawn one tile per digit, so the digits a rule
 * looks at can be boxed and underlined. Screen readers get the plain number. */
export default function HighlightedNumber({ n, highlight }: Props) {
  const { lang } = useLang()
  const formatted = formatNumber(n, LOCALES[lang])
  return (
    <>
      <span className="nd-sr-only">{formatted}</span>
      <span className="nd-number-digits" aria-hidden="true">
        {tokenizeNumber(formatted).map((tok, i) =>
          tok.type === 'sep'
            ? <span key={i} className="nd-sep">{/\s/.test(tok.char) ? '' : tok.char}</span>
            : <span key={i} className={`nd-digit${isHighlighted(tok.fromRight, highlight) ? ' nd-digit--hl' : ''}`}>{tok.char}</span>,
        )}
      </span>
    </>
  )
}
