import { useState, type CSSProperties } from 'react'
import { MAX_TILE_SIDE, isCorrectAnswer, isCorrectChoice, type TileProblem } from '../../data/numberWorkshop'
import { useLang } from '../../i18n/LangContext'
import AnswerCards from './AnswerCards'
import WorkshopPrompt from './WorkshopPrompt'
import { ValueText } from './Values'

interface Props {
  problem: TileProblem
  onAnswer: (correct: boolean) => void
}

/** r rows of c tiles, laid out with CSS grid — the area model: rows × columns. */
export function TileGrid({ rows, cols }: { rows: number; cols: number }) {
  const { t } = useLang()
  return (
    <span
      className="ws-tile-grid"
      role="img"
      aria-label={t('wsTilesAria', { r: rows, c: cols })}
      style={{ '--ws-cols': cols } as CSSProperties}
    >
      {Array.from({ length: rows * cols }, (_, i) => <span key={i} className="ws-tile" />)}
    </span>
  )
}

/** Arrows, not − and + — this mode never shows a plus sign. */
function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const { t } = useLang()
  return (
    <div className="ws-build-row">
      <span className="ws-build-label">{label}</span>
      <div className="ws-stepper">
        <button type="button" className="ws-stepper-btn" aria-label={`${label}: ${t('wsFewer')}`} disabled={value <= 1} onClick={() => onChange(value - 1)}>
          <span aria-hidden="true">◀</span>
        </button>
        <span className="ws-stepper-value" aria-live="polite">{value}</span>
        <button type="button" className="ws-stepper-btn" aria-label={`${label}: ${t('wsMore')}`} disabled={value >= MAX_TILE_SIDE} onClick={() => onChange(value + 1)}>
          <span aria-hidden="true">▶</span>
        </button>
      </div>
    </div>
  )
}

/** Factor pairs: press all the tiles into one rectangle. */
export default function TilePress({ problem, onAnswer }: Props) {
  const { t } = useLang()
  const [rows, setRows] = useState(1)
  const [cols, setCols] = useState(1)
  const select = problem.answerMode === 'select'

  return (
    <div className="exercise-card ws-station-card">
      <WorkshopPrompt textKey="wsPromptTile" value={String(problem.target)} />
      {select ? (
        <AnswerCards
          choices={problem.choices!}
          onPick={i => onAnswer(isCorrectChoice(problem, i))}
          render={c => <span className="ws-big-value"><ValueText value={c} /></span>}
        />
      ) : (
        <>
          <Stepper label={t('wsRows')} value={rows} onChange={setRows} />
          <Stepper label={t('wsCols')} value={cols} onChange={setCols} />
          <TileGrid rows={rows} cols={cols} />
          <button type="button" className="btn-check" onClick={() => onAnswer(isCorrectAnswer(problem, [String(rows), String(cols)]))}>
            {t('check')}
          </button>
        </>
      )}
    </div>
  )
}
