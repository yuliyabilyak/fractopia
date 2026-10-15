import { useLang } from '../i18n/LangContext'
import { useDetectiveText } from '../hooks/useDetectiveText'
import type { Conclusion, Step } from '../data/numberDetective'

interface Props {
  steps: Step[]
  conclusion?: Conclusion
}

function stepIcon(s: Step): string {
  if (s.kind === 'rule') return '📖'
  if (s.kind === 'last-digit' || s.kind === 'divide') return s.ok ? '✓' : '✗'
  return '•'
}

/** Step-by-step working for one rule (or two), using the actual number. */
export default function DetectiveClues({ steps, conclusion }: Props) {
  const { t } = useLang()
  const text = useDetectiveText()

  return (
    <>
      <ol className="nd-clue-list">
        {steps.map((s, i) => (
          <li key={i} className={`nd-clue${s.kind === 'rule' ? ' nd-clue--rule' : ''}`}>
            {s.group !== undefined && s.kind !== 'rule' && (
              <span className="nd-clue-tag">{t('ndCheckFor', { d: s.group })}</span>
            )}
            <span className="nd-clue-icon" aria-hidden="true">{stepIcon(s)}</span>
            {text.step(s)}
          </li>
        ))}
      </ol>

      {conclusion && (
        <div className="nd-conclusion">
          {conclusion.parts.length > 0 && (
            <ul className="nd-conclusion-parts">
              {conclusion.parts.map(p => (
                <li key={p.divisor}>
                  <span className="nd-clue-icon" aria-hidden="true">{p.ok ? '✓' : '✗'}</span>
                  {text.part(p)}
                </li>
              ))}
            </ul>
          )}
          <p className="nd-conclusion-text">
            <span className="nd-clue-icon" aria-hidden="true">{conclusion.ok ? '✓' : '✗'}</span>
            {text.conclusion(conclusion)}
          </p>
        </div>
      )}
    </>
  )
}
