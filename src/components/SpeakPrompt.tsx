import { useEffect, useRef } from 'react'
import { useLang } from '../i18n/LangContext'
import { speak } from '../utils/speech'

interface Props {
  html: string
  text: string
}

export default function SpeakPrompt({ html, text }: Props) {
  const { lang, t } = useLang()
  const spokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (spokenRef.current === text) return
    spokenRef.current = text
    speak(text, lang)
  }, [text, lang])

  return (
    <div className="shade-prompt-row">
      <p className="exercise-prompt" dangerouslySetInnerHTML={{ __html: html }} />
      <button
        type="button"
        className="shade-speaker-btn"
        aria-label={t('replayAria')}
        onClick={() => speak(text, lang)}
      >
        🔊
      </button>
    </div>
  )
}
