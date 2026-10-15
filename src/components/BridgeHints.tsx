import { useLang } from '../i18n/LangContext'
import { useDetectiveText } from '../hooks/useDetectiveText'
import DetectiveClues from './DetectiveClues'
import {
  explainTile, ruleDivisors, workedExampleTile,
  type BridgeChallenge, type BridgeState,
} from '../data/numberBridges'

interface Props {
  challenge: BridgeChallenge
  state: BridgeState
}

/**
 * Progressively stronger hints, one per press of "Hint":
 *   1 · the rule in words
 *   2 · the digits that matter, highlighted on every stone (done by the parent)
 *   3 · one stone worked through step by step
 */
export default function BridgeHints({ challenge, state }: Props) {
  const { t } = useLang()
  const text = useDetectiveText()
  if (state.hintLevel === 0) return null

  const worked = workedExampleTile(state, challenge)
  const example = worked >= 0 ? explainTile(challenge.tiles[worked], challenge.rule) : null

  return (
    <section className="nd-clues" aria-label={t('ndCluesTitle')}>
      <div className="nd-clues-header">
        <h3 className="nd-clues-title"><span aria-hidden="true">💡</span> {t('ndCluesTitle')}</h3>
      </div>
      <div aria-live="polite">
        <ul className="nd-rule-list">
          {ruleDivisors(challenge.rule).map(d => (
            <li key={d} className="nd-rule-row">
              <span className="nd-rule-divisor">{d}</span>
              <span>{text.rule(d)}</span>
            </li>
          ))}
        </ul>

        {state.hintLevel >= 2 && challenge.rule.kind === 'single' && (
          <p className="nb-hint-line"><span aria-hidden="true">👀</span> {t('nbHintLook')}</p>
        )}

        {state.hintLevel >= 3 && example && (
          <div className="nb-worked">
            <p className="nb-hint-line"><strong>{t('nbHintWorked', { n: text.num(challenge.tiles[worked]) })}</strong></p>
            <DetectiveClues steps={example.steps.filter(s => s.kind !== 'rule')} conclusion={example.conclusion} />
          </div>
        )}
      </div>
    </section>
  )
}
