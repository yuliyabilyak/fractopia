import type { ReactNode } from 'react'
import { useLang } from '../../i18n/LangContext'
import type { Keys } from '../../i18n/translations'

interface Props {
  /** one short sentence; an {x} placeholder, if any, is where `display` goes */
  textKey: Keys
  /** the number as written: "24", "0.06", "12/18" */
  value?: string
  /** how the number looks on screen (defaults to `value`) */
  display?: ReactNode
}

const SLOT = '\u0001'

/** One short instruction, with the number set into the sentence. */
export default function WorkshopPrompt({ textKey, value = '', display }: Props) {
  const { t } = useLang()
  const pieces = t(textKey, { x: SLOT }).split(SLOT)

  return (
    <p className="exercise-prompt ws-prompt">
      {pieces[0]}
      {pieces.length > 1 && <span className="ws-prompt-value">{display ?? value}</span>}
      {pieces[1]}
    </p>
  )
}
