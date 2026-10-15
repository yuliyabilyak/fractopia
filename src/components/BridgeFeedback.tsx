import { useLang } from '../i18n/LangContext'
import { useDetectiveText } from '../hooks/useDetectiveText'
import {
  explainTile, failingStep, stonesStillNeeded,
  type BridgeChallenge, type BridgeState,
} from '../data/numberBridges'

interface Props {
  challenge: BridgeChallenge
  state: BridgeState
}

/** What the last "Check path" found: a short supportive line, and for every
 * stone that doesn't fit, the one step of the rule that it fails. */
export default function BridgeFeedback({ challenge, state }: Props) {
  const { t } = useLang()
  const text = useDetectiveText()
  const missing = stonesStillNeeded(state, challenge)

  return (
    <div role="status" className="nd-feedback-slot">
      {state.status === 'complete' && (
        <p className="nd-feedback nd-feedback--correct"><span aria-hidden="true">✓</span> {t('nbCorrect')}</p>
      )}
      {state.status === 'retry' && (
        <div className="nd-feedback nd-feedback--retry">
          <p className="nb-feedback-line"><span aria-hidden="true">🔎</span> {t('nbNotYet')}</p>
          {state.wrong.length > 0 && (
            <>
              <p className="nb-feedback-line nb-feedback-sub">{t('nbWhyNot')}</p>
              <ul className="nb-why-list">
                {state.wrong.map(i => {
                  const n = challenge.tiles[i]
                  const step = failingStep(explainTile(n, challenge.rule))
                  return (
                    <li key={i}>
                      <span aria-hidden="true">✗ </span>
                      <strong>{text.num(n)}</strong> — {step ? text.step(step) : ''}
                    </li>
                  )
                })}
              </ul>
            </>
          )}
          {missing > 0 && <p className="nb-feedback-line">{t('nbStillNeeded', { n: missing })}</p>}
        </div>
      )}
    </div>
  )
}
