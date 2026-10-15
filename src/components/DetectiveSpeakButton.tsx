import { useLang } from '../i18n/LangContext'
import { speak } from '../utils/speech'

interface Props {
  lines: string[]
}

/** Optional read-aloud for the question — never speaks on its own, only when pressed. */
export default function DetectiveSpeakButton({ lines }: Props) {
  const { t, lang } = useLang()
  return (
    <button type="button" className="shade-speaker-btn" aria-label={t('ndReadAloud')} onClick={() => speak(lines.join(' '), lang)}>
      <span aria-hidden="true">🔊</span>
    </button>
  )
}
