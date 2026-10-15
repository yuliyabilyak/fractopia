import { useEffect, useReducer, useRef } from 'react'
import { useLang } from '../i18n/LangContext'
import { playFeedbackSound } from '../utils/sounds'
import DetectiveSpeakButton from './DetectiveSpeakButton'
import BridgeStone from './BridgeStone'
import BridgeFeedback from './BridgeFeedback'
import BridgeHints from './BridgeHints'
import type { RuleResult } from '../data/numberDetective'
import {
  INITIAL_BRIDGE_STATE, MAX_HINT, bridgeReducer, canCheck, crossingResults, failingFocus, tileFocus,
  type BridgeAction, type BridgeChallenge,
} from '../data/numberBridges'

interface Props {
  challenge: BridgeChallenge
  isLast: boolean
  /** called from "Next crossing", with the first-check result per rule */
  onDone: (results: RuleResult[]) => void
}

export default function BridgeCrossing({ challenge, isLast, onDone }: Props) {
  const { t } = useLang()
  const [state, dispatch] = useReducer(bridgeReducer, INITIAL_BRIDGE_STATE)
  const instructionRef = useRef<HTMLHeadingElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const { rule } = challenge
  const complete = state.status === 'complete'

  useEffect(() => { instructionRef.current?.focus() }, [])
  useEffect(() => { if (complete) nextRef.current?.focus() }, [complete])

  const instruction = rule.kind === 'single'
    ? t('nbSelectAll', { d: rule.divisor })
    : t('nbSelectAllBoth', { a: rule.divisors[0], b: rule.divisors[1] })

  function act(action: BridgeAction) {
    if (action.type === 'check' && canCheck(state)) {
      playFeedbackSound(bridgeReducer(state, action).status === 'complete')
    }
    dispatch(action)
  }

  function stoneHighlight(i: number) {
    if (state.wrong.includes(i)) return failingFocus(challenge.tiles[i], rule)
    return state.hintLevel >= 2 ? tileFocus(rule) : 0
  }

  const canReset = !complete && (state.selected.length > 0 || state.placed.length > 0)

  return (
    <div className="exercise-card nd-card">
      <div className="nd-question-row">
        <h2 className="nd-question" tabIndex={-1} ref={instructionRef}>{instruction}</h2>
        <DetectiveSpeakButton lines={[instruction]} />
      </div>

      <div className="nb-scene">
        <p className="nb-bank nb-bank--start">
          <span aria-hidden="true">{complete ? '🏕️' : '🧒'}</span> {t('nbStart')}
        </p>

        <div className={`nb-river${complete ? ' nb-river--crossed' : ''}`}>
          {complete && (
            <p className="nb-bridge"><span aria-hidden="true">🪵 </span>{t('nbBridgeBuilt')}<span aria-hidden="true"> 🪵</span></p>
          )}
          <div className="nb-stones" role="group" aria-label={t('nbStonesGroup')}>
            {challenge.tiles.map((n, i) => (
              <BridgeStone
                key={i}
                n={n}
                selected={state.selected.includes(i)}
                placed={state.placed.includes(i)}
                wrong={state.wrong.includes(i)}
                locked={complete}
                highlight={stoneHighlight(i)}
                onToggle={() => act({ type: 'toggle', index: i })}
              />
            ))}
          </div>
        </div>

        <p className="nb-bank nb-bank--goal">
          <span aria-hidden="true">🏝️</span> {t('nbGoal')} {complete && <span aria-hidden="true">🧒</span>}
        </p>
      </div>

      <BridgeFeedback challenge={challenge} state={state} />

      {!complete && (
        <div className="nb-controls">
          <button
            type="button"
            className="btn-start nb-check-btn"
            disabled={!canCheck(state)}
            onClick={() => act({ type: 'check', challenge })}
          >
            {t('nbCheck')}
          </button>
          {state.hintLevel < MAX_HINT && (
            <button type="button" className="nd-hint-btn" onClick={() => act({ type: 'hint' })}>
              <span aria-hidden="true">💡</span> {t(state.hintLevel === 0 ? 'ndHintBtn' : 'ndNextHintBtn')}
            </button>
          )}
          {canReset && (
            <button type="button" className="nd-hint-btn" onClick={() => act({ type: 'reset' })}>
              <span aria-hidden="true">↺</span> {t('nbTryAgain')}
            </button>
          )}
        </div>
      )}

      <BridgeHints challenge={challenge} state={state} />

      {complete && (
        <button
          type="button"
          ref={nextRef}
          className="btn-start nd-next-btn"
          onClick={() => onDone(crossingResults(rule, state.firstCheckCorrect ?? true))}
        >
          {t(isLast ? 'nbFinishLevel' : 'nbNextCrossing')} <span aria-hidden="true">→</span>
        </button>
      )}
    </div>
  )
}
