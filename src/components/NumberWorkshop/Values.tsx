// Display pieces shared by every station: stacked fractions, a big, well-spaced
// multiplication sign, and products of factors. Display only — no grading here.

import { Fragment, type ReactNode } from 'react'
import { splitFactors, TIMES } from '../../data/numberWorkshop'
import { useLang } from '../../i18n/LangContext'

/** A fraction written the way it's taught: numerator over a bar over denominator. */
export function Frac({ n, d }: { n: ReactNode; d: ReactNode }) {
  return (
    <span className="ws-frac">
      <span className="ws-frac-num">{n}</span>
      <span className="ws-frac-den">{d}</span>
    </span>
  )
}

/** ×, large and spaced so it can't be read as the letter x or a plus — and read as "times". */
export function TimesSign() {
  const { t } = useLang()
  return (
    <span className="ws-times">
      <span aria-hidden="true">{TIMES}</span>
      <span className="ws-sr-only">{t('wsTimes')}</span>
    </span>
  )
}

export function EqualsSign() {
  const { t } = useLang()
  return (
    <span className="ws-equals">
      <span aria-hidden="true">=</span>
      <span className="ws-sr-only">{t('wsEquals')}</span>
    </span>
  )
}

/** Factors joined by × signs: 2 × 3 × 4. */
export function Product({ factors }: { factors: ReactNode[] }) {
  return (
    <span className="ws-product">
      {factors.map((f, i) => (
        <Fragment key={i}>
          {i > 0 && <TimesSign />}
          <span className="ws-factor">{f}</span>
        </Fragment>
      ))}
    </span>
  )
}

/** "3/4" → stacked fraction, "4 × 6" → product, anything else as written (zeros kept). */
export function ValueText({ value }: { value: string }) {
  const frac = /^(\d+)\/(\d+)$/.exec(value.trim())
  if (frac) return <Frac n={frac[1]} d={frac[2]} />
  if (value.includes(TIMES)) return <Product factors={splitFactors(value)} />
  return <span className="ws-value">{value}</span>
}
