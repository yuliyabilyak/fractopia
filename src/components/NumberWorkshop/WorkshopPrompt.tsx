import { useEffect, type ReactNode } from 'react'
import { useLang } from '../../i18n/LangContext'
import type { Keys } from '../../i18n/translations'
import { speak } from '../../utils/speech'
import { spoken } from './spoken'

interface Props {
  /** one short sentence; an {x} placeholder, if any, is where `display` goes */
  textKey: Keys
  /** the number as written, for narration: "24", "0.06", "12/18" */
  value?: string
  /** how the number looks on screen */
  display?: ReactNode
  /** read after the sentence — e.g. the equation "48 = 6 × ?" */
  speakAfter?: string
}

const SLOT = '\u0001'

/**
 * One short instruction, read aloud when it appears and again from the speaker
 * button. Mount it fresh per problem (via `key`) so a repeated sentence still speaks.
 */
export default function WorkshopPrompt({ textKey, value = '', display, speakAfter }: Props) {
  const { t, lang } = useLang()
  const sentence = t(textKey, { x: spoken(value, t) })
  const narration = speakAfter ? `${sentence} ${spoken(speakAfter, t)}` : sentence
  const pieces = t(textKey, { x: SLOT }).split(SLOT)

  useEffect(() => { speak(narration, lang) }, [narration, lang])

  return (
    <div className="shade-prompt-row ws-prompt-row">
      <p className="exercise-prompt ws-prompt">
        {pieces[0]}
        {pieces.length > 1 && <span className="ws-prompt-value">{display ?? value}</span>}
        {pieces[1]}
      </p>
      <button type="button" className="shade-speaker-btn" aria-label={t('replayAria')} onClick={() => speak(narration, lang)}>
        <span aria-hidden="true">🔊</span>
      </button>
    </div>
  )
}
