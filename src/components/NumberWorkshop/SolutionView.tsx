import { isPrime, missingSlots, solutionParts, type WorkshopProblem } from '../../data/numberWorkshop'
import { useLang } from '../../i18n/LangContext'
import { FactoredFraction } from './FractionCancel'
import { TileGrid } from './TilePress'
import { EqualsSign, Frac, Product } from './Values'

/** One correct decomposition, written out as a product — shown after a wrong answer. */
export default function SolutionView({ problem }: { problem: WorkshopProblem }) {
  const { t } = useLang()
  const parts = solutionParts(problem)

  switch (problem.station) {
    case 'tile-press': {
      const [r, c] = parts.map(Number)
      return (
        <div className="ws-solution">
          <span className="ws-big-value"><Product factors={[r, c]} /><EqualsSign />{problem.target}</span>
          <TileGrid rows={r} cols={c} />
        </div>
      )
    }
    case 'factor-tree':
      if (isPrime(problem.target)) return <p className="ws-note">{t('wsAlreadySimple', { x: problem.target })}</p>
      return (
        <div className="ws-solution">
          <span className="ws-big-value">{problem.target}<EqualsSign /><Product factors={parts} /></span>
        </div>
      )
    case 'missing-multiplier':
      return (
        <div className="ws-solution">
          <span className="ws-big-value">
            {problem.target}<EqualsSign />
            <Product factors={missingSlots(problem).map((s, i) => (s === null ? <span key={i} className="ws-answer-mark">{problem.answer}</span> : s))} />
          </span>
        </div>
      )
    case 'decimal-scaler':
      return (
        <div className="ws-solution">
          <span className="ws-big-value">
            {problem.value}<EqualsSign /><Product factors={[<span key="w" className="ws-answer-mark">{problem.whole}</span>, problem.scaleFactor]} />
          </span>
        </div>
      )
    case 'fraction-cancel': {
      const c = problem.commonFactor
      return (
        <div className="ws-solution">
          <span className="ws-big-value">
            <FactoredFraction top={problem.topFactors} bottom={problem.bottomFactors} struck={c} />
            <EqualsSign />
            <Frac n={problem.numerator / c} d={problem.denominator / c} />
          </span>
        </div>
      )
    }
  }
}
