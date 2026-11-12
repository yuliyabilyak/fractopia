import { PARTS, type AnswerEvents, type WorkshopProblem } from '../../data/numberWorkshop'
import { useLang } from '../../i18n/LangContext'
import SolutionView from './SolutionView'

interface Props {
  problem: WorkshopProblem
  correct: boolean
  events: AnswerEvents
  onNext: () => void
}

const partName = (id: string | null) => PARTS.find(p => p.id === id)?.nameKey

/**
 * After an answer. Right: a star. Wrong: a neutral "hmm" (no red, no buzzer)
 * and one correct way to do it — then on to the next one, no game over.
 */
export default function AnswerFeedback({ problem, correct, events, onNext }: Props) {
  const { t } = useLang()
  const golden = partName(events.goldenPart)

  return (
    <div className={`exercise-card ws-feedback ws-feedback--${correct ? 'yes' : 'hmm'}`} role="status">
      {correct ? (
        <>
          <span className="ws-feedback-star" aria-hidden="true">★</span>
          <p className="ws-feedback-title">{t('wsCorrect')}</p>
          <div className="ws-feedback-chips">
            {events.levelUp && <span className="ws-chip">⬆️ {t('wsLevelUp', { n: events.levelUp })}</span>}
            {events.batteryFull && <span className="ws-chip ws-chip--gold">🔋 {t('wsBatteryFull')}</span>}
            {golden && <span className="ws-chip ws-chip--gold">✨ {t('wsGoldenPart', { x: t(golden) })}</span>}
          </div>
        </>
      ) : (
        <>
          <span className="ws-feedback-hmm" aria-hidden="true">🤔</span>
          <p className="ws-feedback-title">{t('wsHmm')}</p>
          <SolutionView problem={problem} />
        </>
      )}
      {/* focus lands here so keyboard users can carry straight on */}
      <button type="button" className="btn-check" autoFocus onClick={onNext}>
        {t('next')}
      </button>
    </div>
  )
}
